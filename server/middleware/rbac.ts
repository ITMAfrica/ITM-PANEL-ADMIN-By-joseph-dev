import type { NextFunction, Request, Response } from 'express';
import { getUserTenantRole, isSuperAdmin, roleMeetsOrExceeds } from '../lib/tenant-access';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (isSuperAdmin(req.user) || roles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ error: 'Forbidden' });
  };
}

/**
 * Middleware that checks the user's role **within a specific tenant/workspace**.
 *
 * Unlike `requireRole`, which checks the global `User.role`, this middleware
 * reads `WorkspaceMember.role` (with fallback to `User.role`) for the tenant
 * identified by `req.authorizedTenantId` (set by `requireTenantQuery/Body`),
 * or falls back to `req.query.tenantId` / `req.body.tenantId`.
 *
 * Chain it AFTER `requireTenantQuery` or `requireTenantBody` for the best
 * experience, but it will auto-detect the tenantId if those are absent.
 *
 * Example:
 *   router.delete('/:id', requireAuth, requireTenantQuery, requireTenantRole('tenant_admin'), handler);
 */
export function requireTenantRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Prefer the explicitly authorized tenant, then fall back to query/body.
    const tenantId =
      req.authorizedTenantId ||
      (typeof req.query.tenantId === 'string' ? req.query.tenantId.trim() : '') ||
      (typeof req.body?.tenantId === 'string' ? req.body.tenantId.trim() : '');

    if (!tenantId) {
      res.status(400).json({
        error:
          'tenantId is required; pass it via query, body, or chain requireTenantQuery / requireTenantBody before requireTenantRole',
      });
      return;
    }

    const effectiveRole = await getUserTenantRole(req.user, tenantId);
    if (!effectiveRole) {
      res.status(403).json({ error: 'Forbidden: not a member of this workspace' });
      return;
    }

    if (
      isSuperAdmin(req.user) ||
      roles.some((r) => roleMeetsOrExceeds(effectiveRole, r))
    ) {
      next();
      return;
    }

    res.status(403).json({ error: 'Forbidden: insufficient workspace role' });
  };
}
