import { Task } from '../../src/models/Task';
import { TaskMetadata } from '../../src/models/TaskMetadata';
import { User, UserWithPassword } from '../../src/models/User';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'user@test.com',
    name: 'Test User',
    createdAt: new Date('2024-06-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createUserWithPassword(
  password: string,
  overrides: Partial<UserWithPassword> = {},
): UserWithPassword {
  return {
    ...createUser(overrides),
    password,
    ...overrides,
  };
}

export function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Sample task',
    description: 'Task description',
    completed: false,
    userId: 1,
    createdAt: new Date('2024-06-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createTaskMetadata(overrides: Partial<TaskMetadata> = {}): TaskMetadata {
  return {
    taskId: 1,
    userId: 1,
    tags: [],
    priority: 'medium',
    notes: '',
    history: [{ action: 'task_created', at: new Date('2024-06-01T00:00:00.000Z') }],
    ...overrides,
  };
}
