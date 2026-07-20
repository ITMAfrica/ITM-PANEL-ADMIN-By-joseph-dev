import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/error';
import { securityHeaders } from './middleware/security-headers';
import { rateLimit } from './middleware/rate-limit';
import uploadsRoutes from './routes/uploads';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import usersRoutes from './routes/users';
import workspacesRoutes from './routes/workspaces';
import workspaceMembersRoutes from './routes/workspace-members';
import sitesRoutes from './routes/sites';
import connectRoutes from './routes/connect';
import campaignsRoutes from './routes/campaigns';
import automationsRoutes from './routes/automations';
import distributionChannelsRoutes from './routes/distribution-channels';
import subscribersRoutes from './routes/subscribers';
import newsletterRoutes from './routes/newsletters';
import templatesRoutes from './routes/templates';
import newsletterTemplatesRoutes from './routes/newsletter-templates';
import mediaRoutes from './routes/media';
import activityRoutes from './routes/activity';
import dashboardRoutes from './routes/dashboard';
import { publicRouter, trackRouter } from './routes/tracking';
import subscribeRoutes from './routes/subscribe';
import widgetsRoutes from './routes/widgets';
import metaRoutes from './routes/meta';
import conversationsRoutes from './routes/conversations';

// Public-facing endpoints (subscribe / tracking) — stricter, per-IP.
const publicLimiter = rateLimit({
  limit: 120,
  windowMs: 60 * 1000, // 120 requests / min
  message: 'Too many requests, please slow down.',
});

export function createApp() {
  const app = express();

  // Trust the first proxy hop (Caddy / Next.js rewrite) so req.secure and
  // req.ip reflect X-Forwarded-Proto / X-Forwarded-For. Required for the
  // session cookie `secure` flag to follow the real client-facing protocol.
  app.set('trust proxy', 1);

  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api/uploads', uploadsRoutes);

  app.get('/api', (_req, res) => {
    res.json({ message: 'Hello, world!' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/workspaces', workspacesRoutes);
  app.use('/api/workspaces/:id/members', workspaceMembersRoutes);
  app.use('/api/sites', sitesRoutes);
  app.use('/api/connect', connectRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/public/content', publicRouter);
  app.use('/api/public', publicLimiter, subscribeRoutes);
  app.use('/api/track', publicLimiter, trackRouter);
  app.use('/api/campaigns', campaignsRoutes);
  app.use('/api/automations', automationsRoutes);
  app.use('/api/distribution-channels', distributionChannelsRoutes);
  app.use('/api/subscribers', subscribersRoutes);
  app.use('/api/widgets', widgetsRoutes);
  app.use('/api/meta', metaRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/newsletters', newsletterRoutes);
  app.use('/api/templates', templatesRoutes);
  app.use('/api/newsletter-templates', newsletterTemplatesRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
