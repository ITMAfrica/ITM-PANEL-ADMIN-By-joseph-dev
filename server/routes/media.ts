import { Router } from 'express';
import * as mediaController from '../controllers/media.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';
import { mediaUpload } from '../middleware/upload';
import { handleUploadError } from '../middleware/upload-error';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, requireTenantQuery, mediaController.list);
router.post(
  '/upload',
  requireAuth,
  requireTenantQuery,
  canWrite,
  (req, res, next) => {
    mediaUpload.single('file')(req, res, (err) => {
      if (err) {
        handleUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  mediaController.upload
);
router.post('/', requireAuth, requireTenantBody, canWrite, mediaController.create);
router.delete('/:id', requireAuth, mediaController.remove);

export default router;
