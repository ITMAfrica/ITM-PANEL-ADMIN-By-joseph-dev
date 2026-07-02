import { Router } from 'express';
import * as automationsController from '../controllers/automations.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();

router.get('/', requireAuth, requireTenantQuery, automationsController.list);
router.post('/', requireAuth, requireTenantBody, automationsController.create);

export default router;
