import type { Request, Response } from 'express';
import { getDashboardSummary } from '../services/dashboard.service';
import { getAnalyticsTrends } from '../services/analytics-trends.service';
import { analyticsTrendsQuerySchema } from '../lib/schemas';

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

export async function trends(req: Request, res: Response) {
  const tenantId = req.authorizedTenantId!;
  const parsed = analyticsTrendsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid query',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const data = await getAnalyticsTrends({
      tenantId,
      resource: parsed.data.resource,
      mode: parsed.data.mode,
      weeks: parsed.data.weeks,
      from: parsed.data.from,
      to: parsed.data.to,
      granularity: parsed.data.granularity,
      locale: parsed.data.locale,
    });
    res.json(data);
  } catch (error) {
    console.error('GET /api/dashboard/trends', error);
    res.status(500).json({ error: 'Failed to fetch analytics trends' });
  }
}
