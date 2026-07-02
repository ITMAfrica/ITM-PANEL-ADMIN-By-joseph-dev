import { Router } from 'express';
import * as sitesController from '../controllers/sites.controller';
import { validateApiKey } from '../middleware/api-key';
import { requireAuth } from '../middleware/auth';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();

router.get('/', requireAuth, requireTenantQuery, sitesController.list);
router.post('/', requireAuth, requireTenantBody, sitesController.create);
router.post('/:slug/verify', requireAuth, sitesController.verify);
router.post('/:slug/activate', validateApiKey, sitesController.activate);

export default router;
