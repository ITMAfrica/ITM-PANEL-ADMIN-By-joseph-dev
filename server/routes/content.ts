import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();
const canReview = requireRole('super_admin', 'tenant_admin', 'editor');

router.get('/stats', requireAuth, requireTenantQuery, contentController.stats);
router.get('/approved', requireAuth, requireTenantQuery, contentController.approved);
router.get('/', requireAuth, requireTenantQuery, contentController.list);
router.post('/', requireAuth, requireTenantBody, contentController.create);
router.get('/:id', requireAuth, contentController.getById);
router.patch('/:id', requireAuth, contentController.update);
router.put('/:id', requireAuth, contentController.update);
router.delete('/:id', requireAuth, contentController.remove);
router.post('/:id/publish', requireAuth, contentController.publish);
router.post('/:id/approve', requireAuth, canReview, contentController.approve);
router.post('/:id/reject', requireAuth, canReview, contentController.reject);
router.post('/:id/submit-for-review', requireAuth, contentController.submitForReview);

export default router;
