import { Router } from 'express';
import * as templatesController from '../controllers/templates.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantBody } from '../middleware/tenant';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, templatesController.list);
router.post('/', requireAuth, requireTenantBody, canWrite, templatesController.create);

export default router;
