export const TOKENS = {
  TaskRepository: Symbol.for('ITaskRepository'),
  TaskMetadataRepository: Symbol.for('ITaskMetadataRepository'),
  UserRepository: Symbol.for('IUserRepository'),
  TaskService: Symbol.for('ITaskService'),
  AuthService: Symbol.for('IAuthService'),
} as const;
