import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../container/tokens';
import { NotFoundError } from '../errors';
import { CreateTaskData, Task, UpdateTaskData } from '../models/Task';
import { TaskMetadata } from '../models/TaskMetadata';
import { ITaskMetadataRepository } from '../repositories/interfaces/ITaskMetadataRepository';
import { ITaskRepository } from '../repositories/interfaces/ITaskRepository';
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

  async listByUser(userId: number): Promise<Task[]> {
    return this.taskRepository.findAllByUser(userId);
  }

  async getById(id: number, userId: number): Promise<Task> {
    return this.assertTaskOwnership(id, userId);
  }

  async create(userId: number, data: Omit<CreateTaskData, 'userId'>): Promise<Task> {
    const task = await this.taskRepository.create({
      title: data.title,
      description: data.description ?? null,
      userId,
    });

    await this.taskMetadataRepository.upsert(task.id, userId, {
      historyEntry: { action: 'task_created' },
    });

    return task;
  }

  async update(id: number, userId: number, data: UpdateTaskData): Promise<Task> {
    await this.assertTaskOwnership(id, userId);

    return this.taskRepository.update(id, userId, data);
  }

  async toggleCompleted(id: number, userId: number): Promise<Task> {
    const task = await this.assertTaskOwnership(id, userId);

    const updatedTask = await this.taskRepository.update(id, userId, {
      completed: !task.completed,
    });

    await this.taskMetadataRepository.upsert(id, userId, {
      historyEntry: {
        action: updatedTask.completed ? 'task_completed' : 'task_reopened',
      },
    });

    return updatedTask;
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.assertTaskOwnership(id, userId);

    await this.taskRepository.delete(id, userId);
    await this.taskMetadataRepository.deleteByTaskId(id);
  }

  async getMetadata(taskId: number, userId: number): Promise<TaskMetadata> {
    await this.assertTaskOwnership(taskId, userId);

    const metadata = await this.taskMetadataRepository.findByTaskId(taskId);

    if (!metadata) {
      throw new NotFoundError('Task metadata not found');
    }

    return metadata;
  }

  async upsertMetadata(
    taskId: number,
    userId: number,
    data: UpsertTaskMetadataData,
  ): Promise<TaskMetadata> {
    await this.assertTaskOwnership(taskId, userId);

    return this.taskMetadataRepository.upsert(taskId, userId, {
      ...data,
      historyEntry: data.historyEntry ?? { action: 'metadata_updated' },
    });
  }

  private async assertTaskOwnership(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findByIdAndUser(taskId, userId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }
}
