import { Router } from 'express';
import * as channelsController from '../controllers/channels.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantBody, requireTenantQuery } from '../middleware/tenant';

const router = Router();

router.get('/', requireAuth, requireTenantQuery, channelsController.list);
router.post('/', requireAuth, requireTenantBody, channelsController.create);

export default router;
