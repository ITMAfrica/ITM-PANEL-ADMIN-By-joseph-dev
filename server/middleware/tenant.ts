import type { NextFunction, Request, Response } from 'express';
import { userCanAccessTenant } from '../lib/tenant-access';

export async function requireTenantQuery(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const tenantId = typeof req.query.tenantId === 'string' ? req.query.tenantId.trim() : '';
  if (!tenantId) {
    res.status(400).json({ error: 'tenantId required' });
    return;
  }

  if (!(await userCanAccessTenant(req.user, tenantId))) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  req.authorizedTenantId = tenantId;
  next();
}

export async function requireTenantBody(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const tenantId = typeof req.body?.tenantId === 'string' ? req.body.tenantId.trim() : '';
  if (!tenantId) {
    res.status(400).json({ error: 'tenantId required' });
    return;
  }

  if (!(await userCanAccessTenant(req.user, tenantId))) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  req.authorizedTenantId = tenantId;
  next();
}
