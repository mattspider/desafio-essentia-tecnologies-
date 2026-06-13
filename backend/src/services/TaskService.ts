import { inject, injectable } from 'tsyringe';
import { AppError } from '../errors';
import { TOKENS } from '../container/tokens';
import { ITaskMetadataRepository } from '../repositories/interfaces/ITaskMetadataRepository';
import { ITaskRepository } from '../repositories/interfaces/ITaskRepository';
import { CreateTaskData, Task, UpdateTaskData } from '../models/Task';
import { TaskMetadata } from '../models/TaskMetadata';
import { UpsertTaskMetadataData } from '../repositories/interfaces/ITaskMetadataRepository';
import { ITaskService } from './interfaces/ITaskService';

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TOKENS.TaskRepository) private readonly taskRepository: ITaskRepository,
    @inject(TOKENS.TaskMetadataRepository)
    private readonly taskMetadataRepository: ITaskMetadataRepository,
  ) {
    if (!this.taskRepository || !this.taskMetadataRepository) {
      throw new Error('Task repository dependencies are required');
    }
  }

  listByUser(_userId: number): Promise<Task[]> {
    return Promise.reject(new AppError('Task list not implemented yet', 501, 'NOT_IMPLEMENTED'));
  }

  getById(_id: number, _userId: number): Promise<Task> {
    return Promise.reject(new AppError('Task getById not implemented yet', 501, 'NOT_IMPLEMENTED'));
  }

  create(_userId: number, _data: Omit<CreateTaskData, 'userId'>): Promise<Task> {
    return Promise.reject(new AppError('Task create not implemented yet', 501, 'NOT_IMPLEMENTED'));
  }

  update(_id: number, _userId: number, _data: UpdateTaskData): Promise<Task> {
    return Promise.reject(new AppError('Task update not implemented yet', 501, 'NOT_IMPLEMENTED'));
  }

  toggleCompleted(_id: number, _userId: number): Promise<Task> {
    return Promise.reject(
      new AppError('Task toggleCompleted not implemented yet', 501, 'NOT_IMPLEMENTED'),
    );
  }

  delete(_id: number, _userId: number): Promise<void> {
    return Promise.reject(new AppError('Task delete not implemented yet', 501, 'NOT_IMPLEMENTED'));
  }

  getMetadata(_taskId: number, _userId: number): Promise<TaskMetadata> {
    return Promise.reject(
      new AppError('Task getMetadata not implemented yet', 501, 'NOT_IMPLEMENTED'),
    );
  }

  upsertMetadata(
    _taskId: number,
    _userId: number,
    _data: UpsertTaskMetadataData,
  ): Promise<TaskMetadata> {
    return Promise.reject(
      new AppError('Task upsertMetadata not implemented yet', 501, 'NOT_IMPLEMENTED'),
    );
  }
}
