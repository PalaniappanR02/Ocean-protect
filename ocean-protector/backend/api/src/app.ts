import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { CORS_ALLOW_LIST } from './config/constants';
import { requestIdMiddleware } from './common/middleware/requestId';
import { errorHandler } from './common/middleware/errorHandler';
import { notFoundHandler } from './common/middleware/notFound';
import healthRoutes from './modules/health/health.routes';
import regionRoutes from './modules/regions/region.routes';
import reportRoutes from './modules/reports/report.routes';
import mediaRoutes from './modules/media/media.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import socialRoutes from './modules/social-signals/social.routes';
import incidentRoutes from './modules/incidents/incident.routes';
import publicRoutes from './modules/public/public.routes';
import logger from './common/utils/logger';
import { normaliseBrowserOrigin } from './config/urls';

export const createApp = () => {
  const app = express();
  const corsAllowList = Array.from(
    new Set([
      ...CORS_ALLOW_LIST,
      ...env.CORS_ORIGIN.split(',').map(normaliseBrowserOrigin).filter(Boolean),
    ]),
  );

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  app.use(cors({
    origin: (origin, callback) => {
      const renderOriginAllowed =
        env.ALLOW_RENDER_ORIGINS && /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin || '');
      if (!origin || corsAllowList.includes(origin) || renderOriginAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }));

  // Global Rate Limiter
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again after 15 minutes.',
      },
    },
  });
  app.use(globalLimiter);

  // Strict Limiter for Report Submissions
  const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 submissions per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Report submission limit reached. Please try again later.',
      },
    },
  });

  app.use(requestIdMiddleware);
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: { message: 'OceanGuard API' } });
  });

  app.use('/health', healthRoutes);
  app.use('/api/v1/regions', regionRoutes);
  app.post('/api/v1/reports', submitLimiter);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/media', submitLimiter, mediaRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/social-signals', socialRoutes);
  app.use('/api/v1/incidents', incidentRoutes);
  app.use('/api/v1/public', publicRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  // Graceful error logging
  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection at Promise');
  });

  process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught Exception thrown');
    process.exit(1);
  });

  return app;
};