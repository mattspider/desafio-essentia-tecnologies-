import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../container/tokens';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpsertTaskMetadataDto,
} from '../dtos/task.dto';
import { ValidationError } from '../errors';
import { ITaskService } from '../services/interfaces/ITaskService';

@injectable()
export class TaskController {
  constructor(@inject(TOKENS.TaskService) private readonly taskService: ITaskService) {
    if (!this.taskService) {
      throw new Error('TaskService dependency is required');
    }
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const tasks = await this.taskService.listByUser(userId);

      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const taskId = this.parseTaskId(req);

      const task = await this.taskService.getById(taskId, userId);

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const body = req.body as CreateTaskDto;

      const task = await this.taskService.create(userId, body);

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const taskId = this.parseTaskId(req);
      const body = req.body as UpdateTaskDto;

      const task = await this.taskService.update(taskId, userId, body);

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  toggleCompleted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const taskId = this.parseTaskId(req);

      const task = await this.taskService.toggleCompleted(taskId, userId);

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const taskId = this.parseTaskId(req);

      await this.taskService.delete(taskId, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const taskId = this.parseTaskId(req);

      const metadata = await this.taskService.getMetadata(taskId, userId);

      res.status(200).json(metadata);
    } catch (error) {
      next(error);
    }
  };

  upsertMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const taskId = this.parseTaskId(req);
      const body = req.body as UpsertTaskMetadataDto;

      const metadata = await this.taskService.upsertMetadata(taskId, userId, body);

      res.status(200).json(metadata);
    } catch (error) {
      next(error);
    }
  };

  private getUserId(req: Request): number {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ValidationError('Authenticated user not found in request');
    }

    return userId;
  }

  private parseTaskId(req: Request): number {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ValidationError('Invalid task id');
    }

    return taskId;
  }
}
