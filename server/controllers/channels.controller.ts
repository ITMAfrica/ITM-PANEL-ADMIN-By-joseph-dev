import type { Request, Response } from 'express';
import { db } from '../lib/prisma';

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await db.distributionChannel.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    res.json(
      rows.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        subscriberCount: c.subscriberCount,
        isActive: c.isActive,
        lastSentAt: c.lastSentAt?.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/distribution-channels', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = req.body;
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
    res.status(201).json(row);
  } catch (error) {
    console.error('POST /api/distribution-channels', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
}
