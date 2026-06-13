import { Router } from 'express';
import { createAuthRouter } from './auth.routes';
import { healthRouter } from './health.routes';

export function createApiRouter(): Router {
  const apiRouter = Router();

  apiRouter.use(healthRouter);
  apiRouter.use('/auth', createAuthRouter());

  return apiRouter;
}
