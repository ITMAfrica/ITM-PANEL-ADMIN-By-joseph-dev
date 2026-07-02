import { Router } from 'express';
import * as workspacesController from '../controllers/workspaces.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', requireAuth, workspacesController.list);
router.post('/', requireAuth, requireRole('super_admin', 'tenant_admin'), workspacesController.create);

export default router;
