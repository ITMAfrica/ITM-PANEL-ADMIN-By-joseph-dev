import type { NextFunction, Request, Response } from 'express';
import { isSuperAdmin } from '../lib/tenant-access';

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
