import { Router } from 'express';
import * as newsletterController from '../controllers/newsletter.controller';
import { validateApiKey } from '../middleware/api-key';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Internal dispatch, triggered by a cron (Render) using the public API key.
router.post('/dispatch', validateApiKey, newsletterController.dispatch);

// Send a specific newsletter immediately (front trigger, session-authenticated).
router.post('/:id/send', requireAuth, newsletterController.sendOne);

// Detailed send list (per-recipient opens/clicks with geo), session-authenticated.
router.get('/:id/sends', requireAuth, newsletterController.listSends);

// Public tracking pixels/links (no auth; identified by send id).
router.get('/track/open/:sendId.png', newsletterController.trackOpen);
router.get('/track/click/:sendId', newsletterController.trackClick);

export default router;
