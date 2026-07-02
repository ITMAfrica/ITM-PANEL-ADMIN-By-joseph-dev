import { Router } from 'express';
import * as templatesController from '../controllers/templates.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantBody } from '../middleware/tenant';

const router = Router();

router.get('/', requireAuth, templatesController.list);
router.post('/', requireAuth, requireTenantBody, templatesController.create);

export default router;
