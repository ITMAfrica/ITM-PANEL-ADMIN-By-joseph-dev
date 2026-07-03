import type { Request, Response } from 'express';
import { getDashboardSummary } from '../services/dashboard.service';

export async function summary(req: Request, res: Response) {
  const tenantId = req.authorizedTenantId!;

  try {
    const data = await getDashboardSummary(tenantId);
    res.json(data);
  } catch (error) {
    console.error('GET /api/dashboard/summary', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
}
