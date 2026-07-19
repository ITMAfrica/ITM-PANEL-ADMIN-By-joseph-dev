import { Router } from 'express';
import * as uploadsController from '../controllers/uploads.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/:tenantId/:filename', optionalAuth, uploadsController.serve);

export default router;
