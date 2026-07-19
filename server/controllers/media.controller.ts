import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { mediaCreateSchema } from '../lib/schemas';
import { getUserTenantRole, isSuperAdmin, roleMeetsOrExceeds, userCanAccessTenant } from '../lib/tenant-access';
import { parseBody } from '../lib/validate';
import { uploadToStorage, deleteFromStorage } from '../lib/storage';

function getMediaTypeFromMime(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return 'document';
  }
  return 'other';
}

async function mapMediaRow(
  m: {
    id: string;
    name: string;
    type: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl: string | null;
    uploadedBy: string | null;
    tenantId: string;
    alt: string | null;
    width: number | null;
    height: number | null;
    createdAt: Date;
  }
) {
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    mimeType: m.mimeType,
    size: m.size,
    url: m.url,
    thumbnailUrl: m.thumbnailUrl ?? undefined,
    uploadedBy: m.uploadedBy ?? '',
    tenantId: m.tenantId,
    alt: m.alt ?? undefined,
    width: m.width ?? undefined,
    height: m.height ?? undefined,
    createdAt: m.createdAt.toISOString(),
  };
}

export async function upload(req: Request, res: Response) {
  try {
    const file = req.file;
    const tenantId = req.authorizedTenantId!;

    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const type = getMediaTypeFromMime(file.mimetype);
    const url = await uploadToStorage(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    const row = await db.mediaItem.create({
      data: {
        name: file.originalname,
        type,
        mimeType: file.mimetype,
        size: file.size,
        url,
        thumbnailUrl: type === 'image' ? url : undefined,
        uploadedBy: req.user?.id,
        tenantId,
        alt: file.originalname,
      },
    });

    res.status(201).json(await mapMediaRow(row));
  } catch (error) {
    console.error('POST /api/media/upload', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await db.mediaItem.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(await Promise.all(rows.map((m) => mapMediaRow(m))));
  } catch (error) {
    console.error('GET /api/media', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = parseBody(mediaCreateSchema, req, res);
    if (!body) return;

    const tenantId = req.authorizedTenantId!;
    const row = await db.mediaItem.create({
      data: {
        name: body.name,
        type: body.type ?? 'other',
        mimeType: body.mimeType ?? 'application/octet-stream',
        size: body.size ?? 0,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl,
        uploadedBy: req.user?.id ?? body.uploadedBy,
        tenantId,
        alt: body.alt,
        width: body.width,
        height: body.height,
      },
    });
    res.status(201).json(await mapMediaRow(row));
  } catch (error) {
    console.error('POST /api/media', error);
    res.status(500).json({ error: 'Failed to create media' });
  }
}

function deleteStoredUploadFile(url: string, tenantId: string) {
  void deleteFromStorage(tenantId, url);
}

async function getAuthorizedMedia(req: Request, id: string) {
  const row = await db.mediaItem.findUnique({ where: { id } });
  if (!row || !req.user) return null;
  if (!(await userCanAccessTenant(req.user, row.tenantId))) return null;
  return row;
}

async function getAuthorizedMediaWithRole(
  req: Request,
  id: string,
  requiredRole: string
) {
  const row = await getAuthorizedMedia(req, id);
  if (!row || !req.user) return null;
  const effectiveRole = await getUserTenantRole(req.user, row.tenantId);
  if (!effectiveRole) return null;
  if (isSuperAdmin(req.user) || roleMeetsOrExceeds(effectiveRole, requiredRole)) return row;
  return null;
}

export async function remove(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedMediaWithRole(req, req.params.id as string, 'editor');
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    deleteStoredUploadFile(existing.url, existing.tenantId);
    if (existing.thumbnailUrl && existing.thumbnailUrl !== existing.url) {
      deleteStoredUploadFile(existing.thumbnailUrl, existing.tenantId);
    }

    await db.mediaItem.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/media', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
}
