import { Router } from 'express';
import * as newsletterTemplatesController from '../controllers/newsletter-templates.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';
import { requireTenantBody } from '../middleware/tenant';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, newsletterTemplatesController.list);
router.post('/', requireAuth, requireTenantBody, canWrite, newsletterTemplatesController.create);

export default router;
