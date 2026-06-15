import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskListComponent } from './task-list.component';

const sampleTask: Task = {
  id: 1,
  title: 'Revisar docs',
  description: 'README',
  completed: false,
  userId: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TaskListComponent', () => {
  let fixture: ComponentFixture<TaskListComponent>;
  let component: TaskListComponent;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
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

    await TestBed.configureTestingModule({
      imports: [TaskListComponent, NoopAnimationsModule],
      providers: [
        { provide: TaskService, useValue: taskService },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        {
          provide: AuthService,
          useValue: {
            user: signal(null).asReadonly(),
            logout: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load tasks on init', () => {
    expect(taskService.list).toHaveBeenCalled();
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].title).toBe('Revisar docs');
    expect(component.loading).toBeFalse();
  });

  it('should compute pending and completed counts', () => {
    component.tasks = [
      { ...sampleTask, id: 1, completed: false, metadataFetched: false },
      { ...sampleTask, id: 2, completed: true, metadataFetched: false },
    ];

    expect(component.pendingCount).toBe(1);
    expect(component.completedCount).toBe(1);
  });

  it('should create task and prepend to list', () => {
    const created: Task = { ...sampleTask, id: 2, title: 'Nova' };
    taskService.create.and.returnValue(of(created));

    component.createTask({ title: 'Nova', description: null });

    expect(taskService.create).toHaveBeenCalledWith({ title: 'Nova', description: null });
    expect(component.tasks[0].id).toBe(2);
    expect(component.creating).toBeFalse();
  });

  it('should show error state when load fails', () => {
    taskService.list.and.returnValue(throwError(() => ({ status: 500 })));
    component.loadTasks();
    expect(component.loading).toBeFalse();
  });

  it('should toggle completed via service', () => {
    component.tasks = [{ ...sampleTask, metadataFetched: false }];
    const updated = { ...sampleTask, completed: true };
    taskService.toggleCompleted.and.returnValue(of(updated));

    component.toggleCompleted(component.tasks[0]);

    expect(taskService.toggleCompleted).toHaveBeenCalledWith(1);
    expect(component.tasks[0].completed).toBeTrue();
  });
});
