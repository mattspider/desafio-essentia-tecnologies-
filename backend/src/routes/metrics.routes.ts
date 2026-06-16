import { Router } from 'express';
import { register } from '../metrics/registry';

const metricsRouter = Router();

metricsRouter.get('/', async (_req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});

export { metricsRouter };
