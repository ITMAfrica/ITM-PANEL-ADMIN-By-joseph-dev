import { Router } from 'express';
import * as sitesController from '../controllers/sites.controller';

const router = Router();

router.get('/:slug', sitesController.connectScript);

export default router;
