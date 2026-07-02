import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantQuery } from '../middleware/tenant';

const router = Router();

router.get('/', requireAuth, requireTenantQuery, activityController.list);

export default router;
