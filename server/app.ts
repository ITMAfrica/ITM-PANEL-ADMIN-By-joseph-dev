import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/error';
import { getUploadsDir } from './lib/uploads-dir';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import usersRoutes from './routes/users';
import workspacesRoutes from './routes/workspaces';
import sitesRoutes from './routes/sites';
import connectRoutes from './routes/connect';
import campaignsRoutes from './routes/campaigns';
import automationsRoutes from './routes/automations';
import distributionChannelsRoutes from './routes/distribution-channels';
import templatesRoutes from './routes/templates';
import mediaRoutes from './routes/media';
import activityRoutes from './routes/activity';
import { publicRouter, trackRouter } from './routes/tracking';

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api/uploads', express.static(getUploadsDir()));

  app.get('/api', (_req, res) => {
    res.json({ message: 'Hello, world!' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/workspaces', workspacesRoutes);
  app.use('/api/sites', sitesRoutes);
  app.use('/api/connect', connectRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/public/content', publicRouter);
  app.use('/api/track', trackRouter);
  app.use('/api/campaigns', campaignsRoutes);
  app.use('/api/automations', automationsRoutes);
  app.use('/api/distribution-channels', distributionChannelsRoutes);
  app.use('/api/templates', templatesRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/activity', activityRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
