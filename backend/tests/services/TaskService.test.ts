import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../src/errors';
import { ITaskMetadataRepository } from '../../src/repositories/interfaces/ITaskMetadataRepository';
import { ITaskRepository } from '../../src/repositories/interfaces/ITaskRepository';
import { TaskService } from '../../src/services/TaskService';
import { createTask, createTaskMetadata } from '../helpers/factories';

describe('TaskService', () => {
  let taskRepository: ITaskRepository;
  let taskMetadataRepository: ITaskMetadataRepository;
  let taskService: TaskService;

  beforeEach(() => {
    taskRepository = {
      findAllByUser: vi.fn(),
      findById: vi.fn(),
      findByIdAndUser: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    taskMetadataRepository = {
      findByTaskId: vi.fn(),
      upsert: vi.fn(),
      deleteByTaskId: vi.fn(),
    };

    taskService = new TaskService(taskRepository, taskMetadataRepository);
  });

  describe('listByUser', () => {
    it('returns tasks from repository', async () => {
      const tasks = [createTask(), createTask({ id: 2, title: 'Second task' })];
      vi.mocked(taskRepository.findAllByUser).mockResolvedValue(tasks);

      await expect(taskService.listByUser(1)).resolves.toEqual(tasks);
      expect(taskRepository.findAllByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('getById', () => {
    it('returns task when user owns it', async () => {
      const task = createTask();
      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);

      await expect(taskService.getById(1, 1)).resolves.toEqual(task);
    });

    it('throws NotFoundError when task does not belong to user', async () => {
      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(null);

      await expect(taskService.getById(99, 1)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('create', () => {
    it('creates task and records metadata history', async () => {
      const createdTask = createTask({ title: 'New task', description: 'Details' });
      const metadata = createTaskMetadata({ taskId: createdTask.id });

      vi.mocked(taskRepository.create).mockResolvedValue(createdTask);
      vi.mocked(taskMetadataRepository.upsert).mockResolvedValue(metadata);

      const result = await taskService.create(1, {
        title: 'New task',
        description: 'Details',
      });

      expect(taskRepository.create).toHaveBeenCalledWith({
        title: 'New task',
        description: 'Details',
        userId: 1,
      });
      expect(taskMetadataRepository.upsert).toHaveBeenCalledWith(createdTask.id, 1, {
        historyEntry: { action: 'task_created' },
      });
      expect(result).toEqual(createdTask);
    });
  });

  describe('update', () => {
    it('updates task when user owns it', async () => {
      const task = createTask();
      const updatedTask = createTask({ title: 'Updated title' });

      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);
      vi.mocked(taskRepository.update).mockResolvedValue(updatedTask);

      await expect(
        taskService.update(1, 1, { title: 'Updated title' }),
      ).resolves.toEqual(updatedTask);

      expect(taskRepository.update).toHaveBeenCalledWith(1, 1, { title: 'Updated title' });
    });

    it('throws NotFoundError when task is missing', async () => {
      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(null);

      await expect(taskService.update(1, 1, { title: 'Updated title' })).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe('toggleCompleted', () => {
    it('marks incomplete task as completed and records history', async () => {
      const task = createTask({ completed: false });
      const updatedTask = createTask({ completed: true });

      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);
      vi.mocked(taskRepository.update).mockResolvedValue(updatedTask);
      vi.mocked(taskMetadataRepository.upsert).mockResolvedValue(
        createTaskMetadata({ history: [{ action: 'task_completed', at: new Date() }] }),
      );

      await expect(taskService.toggleCompleted(1, 1)).resolves.toEqual(updatedTask);

      expect(taskRepository.update).toHaveBeenCalledWith(1, 1, { completed: true });
      expect(taskMetadataRepository.upsert).toHaveBeenCalledWith(1, 1, {
        historyEntry: { action: 'task_completed' },
      });
    });

    it('reopens completed task and records history', async () => {
      const task = createTask({ completed: true });
      const updatedTask = createTask({ completed: false });

      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);
      vi.mocked(taskRepository.update).mockResolvedValue(updatedTask);
      vi.mocked(taskMetadataRepository.upsert).mockResolvedValue(createTaskMetadata());

      await taskService.toggleCompleted(1, 1);

      expect(taskRepository.update).toHaveBeenCalledWith(1, 1, { completed: false });
      expect(taskMetadataRepository.upsert).toHaveBeenCalledWith(1, 1, {
        historyEntry: { action: 'task_reopened' },
      });
    });
  });

  describe('delete', () => {
    it('deletes task and metadata when user owns task', async () => {
      const task = createTask();
      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);

      await taskService.delete(1, 1);

      expect(taskRepository.delete).toHaveBeenCalledWith(1, 1);
      expect(taskMetadataRepository.deleteByTaskId).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundError when task is missing', async () => {
      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(null);

      await expect(taskService.delete(1, 1)).rejects.toBeInstanceOf(NotFoundError);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getMetadata', () => {
    it('returns metadata when task and metadata exist', async () => {
      const task = createTask();
      const metadata = createTaskMetadata();

      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);
      vi.mocked(taskMetadataRepository.findByTaskId).mockResolvedValue(metadata);

      await expect(taskService.getMetadata(1, 1)).resolves.toEqual(metadata);
    });

    it('throws NotFoundError when metadata is missing', async () => {
      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(createTask());
      vi.mocked(taskMetadataRepository.findByTaskId).mockResolvedValue(null);

      await expect(taskService.getMetadata(1, 1)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('upsertMetadata', () => {
    it('upserts metadata with default history action', async () => {
      const task = createTask();
      const metadata = createTaskMetadata({ tags: ['work'], priority: 'high' });

      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);
      vi.mocked(taskMetadataRepository.upsert).mockResolvedValue(metadata);

      const input = { tags: ['work'], priority: 'high' as const };

      await expect(taskService.upsertMetadata(1, 1, input)).resolves.toEqual(metadata);

      expect(taskMetadataRepository.upsert).toHaveBeenCalledWith(1, 1, {
        ...input,
        historyEntry: { action: 'metadata_updated' },
      });
    });

    it('preserves custom history entry when provided', async () => {
      const task = createTask();
      const metadata = createTaskMetadata();

      vi.mocked(taskRepository.findByIdAndUser).mockResolvedValue(task);
      vi.mocked(taskMetadataRepository.upsert).mockResolvedValue(metadata);

      const historyEntry = { action: 'tag_added', at: new Date('2024-06-02T00:00:00.000Z') };

      await taskService.upsertMetadata(1, 1, { tags: ['urgent'], historyEntry });

      expect(taskMetadataRepository.upsert).toHaveBeenCalledWith(1, 1, {
        tags: ['urgent'],
        historyEntry,
      });
    });
  });
});
