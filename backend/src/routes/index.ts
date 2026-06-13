import { Router } from 'express';
import { createAuthRouter } from './auth.routes';
import { healthRouter } from './health.routes';
import { createTaskRouter } from './task.routes';

export function createApiRouter(): Router {
  const apiRouter = Router();

  apiRouter.use(healthRouter);
  apiRouter.use('/auth', createAuthRouter());
  apiRouter.use('/tasks', createTaskRouter());

  return apiRouter;
}
