import { TaskMetadata } from '../../models/TaskMetadata';
import { CreateTaskData, Task, UpdateTaskData } from '../../models/Task';
import { UpsertTaskMetadataData } from '../../repositories/interfaces/ITaskMetadataRepository';

export interface ITaskService {
  listByUser(userId: number): Promise<Task[]>;
  getById(id: number, userId: number): Promise<Task>;
  create(userId: number, data: Omit<CreateTaskData, 'userId'>): Promise<Task>;
  update(id: number, userId: number, data: UpdateTaskData): Promise<Task>;
  toggleCompleted(id: number, userId: number): Promise<Task>;
  delete(id: number, userId: number): Promise<void>;
  getMetadata(taskId: number, userId: number): Promise<TaskMetadata>;
  upsertMetadata(
    taskId: number,
    userId: number,
    data: UpsertTaskMetadataData,
  ): Promise<TaskMetadata>;
}
