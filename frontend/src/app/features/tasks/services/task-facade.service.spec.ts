import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskFacadeService } from './task-facade.service';
import { TaskViewModel } from '../models/task-view.model';

const sampleTask: Task = {
  id: 1,
  title: 'Revisar docs',
  description: 'README',
  completed: false,
  userId: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const loadedMetadata = {
  taskId: 1,
  userId: 10,
  tags: ['api', 'teste'],
  priority: 'high' as const,
  notes: 'nota',
  history: [],
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

  it('should patch metadata form when getMetadata resolves', () => {
    const task: TaskViewModel = { ...sampleTask, metadataFetched: false };
    taskService.getMetadata.and.returnValue(of(loadedMetadata));

    facade.onPanelOpened(task);

    expect(taskService.getMetadata).toHaveBeenCalledWith(1);
    expect(facade.metadataForms().get(1)?.getRawValue()).toEqual({
      priority: 'high',
      notes: 'nota',
      tagsInput: 'api, teste',
    });
    expect(task.metadata).toEqual(loadedMetadata);
  });

  it('should not reset metadata form to defaults when panel reopens with loaded metadata', () => {
    const task = {
      ...sampleTask,
      metadataFetched: true,
      metadata: loadedMetadata,
    };

    facade.onPanelOpened(task);

    expect(taskService.getMetadata).not.toHaveBeenCalled();
    expect(facade.metadataForms().get(1)?.getRawValue()).toEqual({
      priority: 'high',
      notes: 'nota',
      tagsInput: 'api, teste',
    });
  });

  it('should ignore stale getMetadata responses after a newer save started', () => {
    const task: TaskViewModel = { ...sampleTask, metadataFetched: false };
    const metadata$ = new Subject<typeof loadedMetadata>();
    taskService.getMetadata.and.returnValue(metadata$.asObservable());
    taskService.upsertMetadata.and.returnValue(
      of({
        ...loadedMetadata,
        priority: 'low',
      }),
    );

    facade.onPanelOpened(task);
    facade.metadataForms().get(1)?.patchValue({ priority: 'low', notes: '', tagsInput: '' });
    facade.saveMetadata(task);
    metadata$.next(loadedMetadata);

    expect(task.metadata?.priority).toBe('low');
    expect(task.metadata?.tags).toEqual(['api', 'teste']);
    expect(task.metadata?.notes).toBe('nota');
    expect(facade.metadataForms().get(1)?.getRawValue()).toEqual({
      priority: 'low',
      notes: 'nota',
      tagsInput: 'api, teste',
    });
  });

  it('should merge loaded metadata into save payload when form fields are empty', () => {
    const task = {
      ...sampleTask,
      metadataFetched: true,
      metadata: loadedMetadata,
    };
    taskService.upsertMetadata.and.returnValue(of(loadedMetadata));

    facade.onPanelOpened(task);
    facade.metadataForms().get(1)?.patchValue({ priority: 'high', notes: '', tagsInput: '' });

    facade.saveMetadata(task);

    expect(taskService.upsertMetadata).toHaveBeenCalledWith(1, {
      priority: 'high',
      notes: 'nota',
      tags: ['api', 'teste'],
    });
  });
});
