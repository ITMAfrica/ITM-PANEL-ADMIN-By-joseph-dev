import { Router } from 'express';
import * as subscribersController from '../controllers/subscribers.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantQuery, requireTenantBody } from '../middleware/tenant';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, requireTenantQuery, subscribersController.list);
router.get('/count', requireAuth, requireTenantQuery, subscribersController.count);
router.post('/', requireAuth, requireTenantBody, canWrite, subscribersController.create);
router.delete('/:id', requireAuth, subscribersController.remove);

export default router;
