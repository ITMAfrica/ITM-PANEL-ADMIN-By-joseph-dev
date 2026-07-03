import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantQuery } from '../middleware/tenant';

const router = Router();

router.get('/summary', requireAuth, requireTenantQuery, dashboardController.summary);

export default router;
