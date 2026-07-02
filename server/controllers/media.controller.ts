import type { Request, Response } from 'express';
import { db } from '../lib/prisma';

function getMediaTypeFromMime(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return 'document';
  }
  return 'other';
}

function buildUploadUrl(req: Request, tenantId: string, filename: string): string {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/api/uploads/${tenantId}/${filename}`;
}

export async function upload(req: Request, res: Response) {
  try {
    const file = req.file;
    const tenantId = req.authorizedTenantId!;

    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const url = buildUploadUrl(req, tenantId, file.filename);
    const type = getMediaTypeFromMime(file.mimetype);

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

    res.status(201).json({
      id: row.id,
      name: row.name,
      type: row.type,
      mimeType: row.mimeType,
      size: row.size,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl ?? undefined,
      uploadedBy: row.uploadedBy ?? '',
      tenantId: row.tenantId,
      alt: row.alt ?? undefined,
      width: row.width ?? undefined,
      height: row.height ?? undefined,
      createdAt: row.createdAt.toISOString(),
    });
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
    res.json(
      rows.map((m) => ({
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
      }))
    );
  } catch (error) {
    console.error('GET /api/media', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = req.body;
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
    res.status(201).json(row);
  } catch (error) {
    console.error('POST /api/media', error);
    res.status(500).json({ error: 'Failed to create media' });
  }
}
