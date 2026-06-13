import { injectable } from 'tsyringe';
import { prisma } from '../infrastructure/database/prisma/client';
import { CreateTaskData, Task, UpdateTaskData } from '../models/Task';
import { NotFoundError } from '../errors';
import { ITaskRepository } from './interfaces/ITaskRepository';

@injectable()
export class TaskRepository implements ITaskRepository {
  async findAllByUser(userId: number): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((task) => this.toTask(task));
  }

  async findById(id: number): Promise<Task | null> {
    const task = await prisma.task.findUnique({ where: { id } });

    return task ? this.toTask(task) : null;
  }

  async findByIdAndUser(id: number, userId: number): Promise<Task | null> {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    return task ? this.toTask(task) : null;
  }

  async create(data: CreateTaskData): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        userId: data.userId,
      },
    });

    return this.toTask(task);
  }

  async update(id: number, userId: number, data: UpdateTaskData): Promise<Task> {
    const existing = await this.findByIdAndUser(id, userId);

    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });

    return this.toTask(task);
  }

  async delete(id: number, userId: number): Promise<void> {
    const existing = await this.findByIdAndUser(id, userId);

    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    await prisma.task.delete({ where: { id } });
  }

  private toTask(task: {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
