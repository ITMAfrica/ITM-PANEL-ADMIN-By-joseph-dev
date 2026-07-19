import { Router } from 'express';
import * as channelsController from '../controllers/channels.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, requireTenantQuery, channelsController.list);
router.post('/', requireAuth, requireTenantBody, canWrite, channelsController.create);
router.patch('/:id', requireAuth, channelsController.update);

export default router;
