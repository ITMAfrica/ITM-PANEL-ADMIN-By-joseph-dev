import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export function handleUploadError(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File too large' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(400).json({ error: err.message });
    return;
  }

  next(err);
}
