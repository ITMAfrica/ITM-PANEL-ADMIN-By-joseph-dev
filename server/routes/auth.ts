import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';

// Brute-force protection on credential endpoints only — not /me or /logout,
// which are called frequently by the SPA during navigation/hydration.
const authLimiter = rateLimit({
  limit: process.env.NODE_ENV === 'development' ? 200 : 20,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts, please try again later.',
});

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
