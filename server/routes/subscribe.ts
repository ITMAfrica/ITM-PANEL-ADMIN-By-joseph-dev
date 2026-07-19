import { Router } from 'express';
import * as subscribeController from '../controllers/subscribe.controller';

const router = Router();

router.post('/subscribe', subscribeController.subscribe);
router.get('/unsubscribe', subscribeController.unsubscribe);

export default router;
