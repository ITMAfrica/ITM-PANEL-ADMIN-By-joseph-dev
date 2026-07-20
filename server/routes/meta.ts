import { Router } from 'express';
import * as metaController from '../controllers/meta.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantQuery } from '../middleware/tenant';
import { rateLimit } from '../middleware/rate-limit';

const router = Router();
const canWrite = requireTenantRole('editor');

// Callback public du dialogue OAuth Meta — 30 req/min/IP comme les autres flux publics.
const oauthCallbackLimiter = rateLimit({
  limit: 30,
  windowMs: 60 * 1000,
  message: 'Too many requests, please slow down.',
});

router.get('/oauth/start', requireAuth, requireTenantQuery, canWrite, metaController.oauthStart);
router.get('/oauth/callback', oauthCallbackLimiter, metaController.oauthCallback);
router.get('/connections', requireAuth, requireTenantQuery, metaController.list);
router.delete('/connections/:id', requireAuth, requireTenantQuery, canWrite, metaController.disconnect);

export default router;
