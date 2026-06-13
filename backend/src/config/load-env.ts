import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

const backendEnvPath = path.resolve(__dirname, '../../.env');

export function loadEnv(): void {
  if (existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
    return;
  }

  dotenv.config();
}
