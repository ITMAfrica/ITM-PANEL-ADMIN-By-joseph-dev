import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller';
import { validateApiKey } from '../middleware/api-key';

const publicRouter = Router();
publicRouter.get('/', trackingController.listPublicContent);
publicRouter.get('/:id', trackingController.getPublicContentById);

const trackRouter = Router();
trackRouter.post('/view', validateApiKey, trackingController.trackViewEvent);
trackRouter.post('/click', validateApiKey, trackingController.trackClickEvent);

export { publicRouter, trackRouter };
