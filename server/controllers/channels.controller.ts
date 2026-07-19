import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { getUserTenantRole, isSuperAdmin, roleMeetsOrExceeds, userCanAccessTenant } from '../lib/tenant-access';
import { channelCreateSchema, channelUpdateSchema } from '../lib/schemas';
import { parseBody } from '../lib/validate';

function mapChannel(c: {
  id: string;
  name: string;
  type: string;
  icon: string;
  subscriberCount: number;
  isActive: boolean;
  lastSentAt: Date | null;
}) {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
    subscriberCount: c.subscriberCount,
    isActive: c.isActive,
    lastSentAt: c.lastSentAt?.toISOString(),
  };
}

async function getAuthorizedChannel(req: Request, id: string) {
  const row = await db.distributionChannel.findUnique({ where: { id } });
  if (!row || !req.user) return null;
  if (!(await userCanAccessTenant(req.user, row.tenantId))) return null;
  return row;
}

async function getAuthorizedChannelWithRole(
  req: Request,
  id: string,
  requiredRole: string
) {
  const row = await getAuthorizedChannel(req, id);
  if (!row || !req.user) return null;
  const effectiveRole = await getUserTenantRole(req.user, row.tenantId);
  if (!effectiveRole) return null;
  if (isSuperAdmin(req.user) || roleMeetsOrExceeds(effectiveRole, requiredRole)) return row;
  return null;
}

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await db.distributionChannel.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    res.json(rows.map(mapChannel));
  } catch (error) {
    console.error('GET /api/distribution-channels', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = parseBody(channelCreateSchema, req, res);
    if (!body) return;
    const tenantId = req.authorizedTenantId!;
    const row = await db.distributionChannel.create({
      data: {
        name: body.name,
        type: body.type ?? 'email',
        icon: body.icon ?? 'mail',
        subscriberCount: body.subscriberCount ?? 0,
        isActive: body.isActive ?? true,
        tenantId,
      },
    });
    res.status(201).json(mapChannel(row));
  } catch (error) {
    console.error('POST /api/distribution-channels', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedChannelWithRole(req, req.params.id as string, 'editor');
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const body = parseBody(channelUpdateSchema, req, res);
    if (!body) return;

    const row = await db.distributionChannel.update({
      where: { id: req.params.id as string },
      data: {
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.name !== undefined && { name: body.name }),
      },
    });
    res.json(mapChannel(row));
  } catch (error) {
    console.error('PATCH /api/distribution-channels', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
}
