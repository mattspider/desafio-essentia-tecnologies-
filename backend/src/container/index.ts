import { container } from 'tsyringe';
import { TaskMetadataRepository } from '../repositories/TaskMetadataRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';
import { TaskService } from '../services/TaskService';
import { TOKENS } from './tokens';

export function setupContainer(): void {
  container.registerSingleton(TOKENS.UserRepository, UserRepository);
  container.registerSingleton(TOKENS.TaskRepository, TaskRepository);
  container.registerSingleton(TOKENS.TaskMetadataRepository, TaskMetadataRepository);
  container.registerSingleton(TOKENS.AuthService, AuthService);
  container.registerSingleton(TOKENS.TaskService, TaskService);
}

export { container };
