import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app';
import { setupContainer } from './container';
import { env } from './config/env';
import { connectMongo, disconnectMongo } from './infrastructure/database/mongoose/connection';
import {
  connectPrisma,
  disconnectPrisma,
} from './infrastructure/database/prisma/client';

async function bootstrap(): Promise<void> {
  setupContainer();

  await connectPrisma();
  await connectMongo();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`TechX Todo API running on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectPrisma();
      await disconnectMongo();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
