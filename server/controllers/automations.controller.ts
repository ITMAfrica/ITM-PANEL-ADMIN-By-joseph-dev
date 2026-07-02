import type { Request, Response } from 'express';
import { db } from '../lib/prisma';

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await db.automation.findMany({
      where: { workspaceId: tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      rows.map((a) => ({
        id: a.id,
        name: a.name,
        trigger: a.trigger,
        action: a.action,
        enabled: a.enabled,
        lastRun: a.lastRun?.toISOString(),
        runCount: a.runCount,
        tenantId: a.workspaceId,
      }))
    );
  } catch (error) {
    console.error('GET /api/automations', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = req.body;
    const tenantId = req.authorizedTenantId!;
    const row = await db.automation.create({
      data: {
        name: body.name,
        trigger: body.trigger,
        action: body.action,
        enabled: body.enabled ?? true,
        workspaceId: tenantId,
      },
    });
    res.status(201).json({
      id: row.id,
      name: row.name,
      trigger: row.trigger,
      action: row.action,
      enabled: row.enabled,
      lastRun: row.lastRun?.toISOString(),
      runCount: row.runCount,
      tenantId: row.workspaceId,
    });
  } catch (error) {
    console.error('POST /api/automations', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
}
