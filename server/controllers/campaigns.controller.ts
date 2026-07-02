import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { parseChannels } from '../services/mappers/json';
import { userCanAccessTenant } from '../lib/tenant-access';

function mapCampaign(c: {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  startDate: Date;
  endDate: Date;
  tenantId: string;
  contentCount: number;
  publishedCount: number;
  totalReach: number;
  avgOpenRate: number;
  avgClickRate: number;
  channels: unknown;
  createdAt: Date;
}) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    color: c.color,
    status: c.status,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    tenantId: c.tenantId,
    contentCount: c.contentCount,
    publishedCount: c.publishedCount,
    totalReach: c.totalReach,
    avgOpenRate: c.avgOpenRate,
    avgClickRate: c.avgClickRate,
    channels: parseChannels(c.channels),
    createdAt: c.createdAt.toISOString(),
  };
}

async function getAuthorizedCampaign(req: Request, id: string) {
  const row = await db.campaign.findUnique({ where: { id } });
  if (!row || !req.user) return null;
  if (!(await userCanAccessTenant(req.user, row.tenantId))) return null;
  return row;
}

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await db.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rows.map(mapCampaign));
  } catch (error) {
    console.error('GET /api/campaigns', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = req.body;
    const tenantId = req.authorizedTenantId!;
    const row = await db.campaign.create({
      data: {
        name: body.name,
        description: body.description ?? '',
        color: body.color ?? '#3b82f6',
        status: body.status ?? 'draft',
        startDate: new Date(body.startDate ?? Date.now()),
        endDate: new Date(body.endDate ?? Date.now()),
        tenantId,
        channels: body.channels ?? [],
      },
    });
    res.status(201).json(mapCampaign(row));
  } catch (error) {
    console.error('POST /api/campaigns', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedCampaign(req, req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const body = req.body;
    const row = await db.campaign.update({
      where: { id: req.params.id as string },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.color !== undefined && { color: body.color }),
      },
    });
    res.json(mapCampaign(row));
  } catch (error) {
    console.error('PATCH /api/campaigns', error);
    res.status(404).json({ error: 'Failed to update campaign' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const existing = await getAuthorizedCampaign(req, req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await db.campaign.delete({ where: { id: req.params.id as string } });
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/campaigns', error);
    res.status(404).json({ error: 'Failed to delete campaign' });
  }
}
