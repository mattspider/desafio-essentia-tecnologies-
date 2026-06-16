import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import { env } from './config/env';
import { setupSwagger } from './config/swagger';
import { httpMetricsMiddleware } from './metrics/http-metrics.middleware';
import { errorHandler } from './middlewares/error-handler.middleware';
import { csrfMiddleware } from './middlewares/csrf.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { createApiRouter } from './routes';
import { metricsRouter } from './routes/metrics.routes';

export function createApp(): Express {
  const app = express();

  app.use(cookieParser());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(httpMetricsMiddleware);
  app.use('/metrics', metricsRouter);
  setupSwagger(app);
  app.use('/api', csrfMiddleware);
  app.use('/api', createApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
