import { Router } from 'express';
import * as conversationsController from '../controllers/conversations.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, requireTenantQuery, conversationsController.list);
router.get('/:id/messages', requireAuth, requireTenantQuery, conversationsController.messages);
router.post('/:id/reply', requireAuth, requireTenantBody, canWrite, conversationsController.reply);
router.patch('/:id', requireAuth, requireTenantBody, canWrite, conversationsController.update);
router.post('/sync', requireAuth, requireTenantBody, canWrite, conversationsController.sync);

export default router;
