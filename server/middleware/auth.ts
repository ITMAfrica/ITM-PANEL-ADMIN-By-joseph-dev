import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE, verifySessionToken } from '../lib/auth';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const session = await verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  req.user = session;
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    const session = await verifySessionToken(token);
    if (session) req.user = session;
  }
  next();
}
