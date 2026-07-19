import { Router } from 'express';
import * as automationsController from '../controllers/automations.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, requireTenantQuery, automationsController.list);
router.post('/', requireAuth, requireTenantBody, canWrite, automationsController.create);

export default router;
