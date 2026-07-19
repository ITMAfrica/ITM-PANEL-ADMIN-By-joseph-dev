import { Router } from 'express';
import * as campaignsController from '../controllers/campaigns.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, requireTenantQuery, campaignsController.list);
router.post('/', requireAuth, requireTenantBody, canWrite, campaignsController.create);
router.patch('/:id', requireAuth, campaignsController.update);
router.put('/:id', requireAuth, campaignsController.update);
router.delete('/:id', requireAuth, campaignsController.remove);

export default router;
