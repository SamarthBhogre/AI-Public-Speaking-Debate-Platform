import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import speakingRoutes from './routes/speaking.routes';
import debateRoutes from './routes/debate.routes';
import analyticsRoutes from './routes/analytics.routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', service: 'SpeakWell API' }),
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/speaking', speakingRoutes);
  app.use('/api/debate', debateRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));

  app.use(errorHandler);
  return app;
}
