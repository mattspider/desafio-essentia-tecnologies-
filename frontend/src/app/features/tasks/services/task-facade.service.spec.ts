import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskFacadeService } from './task-facade.service';

const sampleTask: Task = {
  id: 1,
  title: 'Revisar docs',
  description: 'README',
  completed: false,
  userId: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TaskFacadeService', () => {
  let facade: TaskFacadeService;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(() => {
    taskService = jasmine.createSpyObj<TaskService>('TaskService', [
      'list',
      'create',
      'toggleCompleted',
      'update',
      'delete',
      'getMetadata',
      'upsertMetadata',
    ]);
    taskService.list.and.returnValue(of([sampleTask]));

    TestBed.configureTestingModule({
      providers: [
        TaskFacadeService,
        { provide: TaskService, useValue: taskService },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
      ],
    });

    facade = TestBed.inject(TaskFacadeService);
  });

  it('should load tasks and clear loading', () => {
    facade.loadTasks();

    expect(taskService.list).toHaveBeenCalled();
    expect(facade.tasks().length).toBe(1);
    expect(facade.tasks()[0].title).toBe('Revisar docs');
    expect(facade.loading()).toBeFalse();
  });

  it('should compute pending and completed counts', () => {
    facade.tasks.set([
      { ...sampleTask, id: 1, completed: false, metadataFetched: false },
      { ...sampleTask, id: 2, completed: true, metadataFetched: false },
    ]);

    expect(facade.pendingCount()).toBe(1);
    expect(facade.completedCount()).toBe(1);
  });

  it('should create task and prepend to list', () => {
    const created: Task = { ...sampleTask, id: 2, title: 'Nova' };
    taskService.create.and.returnValue(of(created));
    const afterCreate = jasmine.createSpy('afterCreate');

    facade.createTask({ title: 'Nova', description: null }, afterCreate);

    expect(taskService.create).toHaveBeenCalledWith({ title: 'Nova', description: null });
    expect(facade.tasks()[0].id).toBe(2);
    expect(facade.creating()).toBeFalse();
    expect(afterCreate).toHaveBeenCalled();
  });

  it('should set loading false when load fails', () => {
    taskService.list.and.returnValue(throwError(() => ({ status: 500 })));
    facade.loadTasks();
    expect(facade.loading()).toBeFalse();
  });

  it('should toggle completed via service', () => {
    facade.tasks.set([{ ...sampleTask, metadataFetched: false }]);
    const updated = { ...sampleTask, completed: true };
    taskService.toggleCompleted.and.returnValue(of(updated));

    facade.toggleCompleted(facade.tasks()[0]);

    expect(taskService.toggleCompleted).toHaveBeenCalledWith(1);
    expect(facade.tasks()[0].completed).toBeTrue();
  });

  it('should start and cancel edit mode', () => {
    const task = { ...sampleTask, metadataFetched: false };
    facade.startEdit(task);

    expect(facade.editingTaskId()).toBe(1);
    expect(facade.editForm.getRawValue()).toEqual({
      title: 'Revisar docs',
      description: 'README',
    });

    facade.cancelEdit();
    expect(facade.editingTaskId()).toBeNull();
  });

  it('should create metadata form when panel opens', () => {
    const task = { ...sampleTask, metadataFetched: false };
    taskService.getMetadata.and.returnValue(
      of({
        taskId: 1,
        userId: 10,
        tags: ['api'],
        priority: 'high',
        notes: 'nota',
        history: [],
      }),
    );

    facade.onPanelOpened(task);

    expect(taskService.getMetadata).toHaveBeenCalledWith(1);
    expect(facade.metadataForms.get(1)?.getRawValue()).toEqual({
      priority: 'high',
      notes: 'nota',
      tagsInput: 'api',
    });
  });
});
