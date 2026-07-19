import type { Request, Response } from 'express';
import { resolveUploadFilePath, verifyUploadAccessToken } from '../lib/media-access';
import { userCanAccessTenant } from '../lib/tenant-access';

export async function serve(req: Request, res: Response) {
  const tenantId = req.params.tenantId as string;
  const filename = req.params.filename as string;
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  const hasSessionAccess =
    !!req.user && (await userCanAccessTenant(req.user, tenantId));
  const hasTokenAccess =
    !!token && (await verifyUploadAccessToken(token, tenantId, filename));

  if (!hasSessionAccess && !hasTokenAccess) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const filePath = resolveUploadFilePath(tenantId, filename);
  if (!filePath) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res.sendFile(filePath);
}
