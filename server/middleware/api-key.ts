import type { NextFunction, Request, Response } from 'express';
import { getSiteByApiKey } from '../services/site.service';

export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const key = process.env.PUBLIC_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      res.status(503).json({ error: 'API key not configured' });
      return;
    }
    next();
    return;
  }

  const headerKey = req.headers['x-api-key'];
  if (headerKey === key) {
    next();
    return;
  }

  if (typeof headerKey === 'string') {
    const site = await getSiteByApiKey(headerKey);
    if (site) {
      next();
      return;
    }
  }

  res.status(401).json({ error: 'Unauthorized' });
}
