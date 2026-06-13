import { CreateTaskData, Task, UpdateTaskData } from '../../models/Task';

export interface ITaskRepository {
  findAllByUser(userId: number): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
  findByIdAndUser(id: number, userId: number): Promise<Task | null>;
  create(data: CreateTaskData): Promise<Task>;
  update(id: number, userId: number, data: UpdateTaskData): Promise<Task>;
  delete(id: number, userId: number): Promise<void>;
}
