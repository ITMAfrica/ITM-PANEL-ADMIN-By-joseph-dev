import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();

router.get('/stats', requireAuth, requireTenantQuery, contentController.stats);
router.get('/approved', requireAuth, requireTenantQuery, contentController.approved);
router.get('/', requireAuth, requireTenantQuery, contentController.list);
router.post('/', requireAuth, requireTenantBody, contentController.create);
router.get('/:id', requireAuth, contentController.getById);
router.patch('/:id', requireAuth, contentController.update);
router.put('/:id', requireAuth, contentController.update);
router.delete('/:id', requireAuth, contentController.remove);
router.post('/:id/publish', requireAuth, contentController.publish);

export default router;
