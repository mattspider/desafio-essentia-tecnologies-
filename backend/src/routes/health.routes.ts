import { Router } from 'express';
import { getMongoConnectionState } from '../infrastructure/database/mongoose/connection';
import { prisma } from '../infrastructure/database/prisma/client';

const healthRouter = Router();

healthRouter.get('/health', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const mongoReady = getMongoConnectionState() === 1;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mysql: 'connected',
        mongo: mongoReady ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    next(error);
  }
});

export { healthRouter };
