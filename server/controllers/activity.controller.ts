import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { toAuditLogEntry } from '../services/mappers/audit.mapper';

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await db.activityLog.findMany({
      where: { workspaceId: tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(rows.map(toAuditLogEntry));
  } catch (error) {
    console.error('GET /api/activity', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
}
