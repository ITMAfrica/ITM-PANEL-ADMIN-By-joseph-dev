import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { getTenantUploadDir, sanitizeFilename } from '../lib/uploads-dir';

const MAX_FILE_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 10;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const tenantId = req.authorizedTenantId ?? '';
    if (!tenantId) {
      cb(new Error('tenantId required'), '');
      return;
    }
    cb(null, getTenantUploadDir(tenantId));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = sanitizeFilename(path.basename(file.originalname, ext));
    cb(null, `${randomUUID()}-${base}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error('Unsupported file type'));
    return;
  }
  cb(null, true);
}

export const mediaUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});
