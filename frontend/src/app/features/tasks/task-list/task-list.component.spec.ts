import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskListComponent } from './task-list.component';
import { TaskFacadeService } from '../services/task-facade.service';

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
  let facade: TaskFacadeService;
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
    facade = component.facade;
    fixture.detectChanges();
  });

  it('should load tasks on init via facade', () => {
    expect(taskService.list).toHaveBeenCalled();
    expect(facade.tasks().length).toBe(1);
    expect(facade.loading()).toBeFalse();
  });

  it('should delegate createTask to facade', () => {
    const created: Task = { ...sampleTask, id: 2, title: 'Nova' };
    taskService.create.and.returnValue(of(created));
    spyOn(facade, 'createTask').and.callThrough();

    component.createTask({ title: 'Nova', description: null });

    expect(facade.createTask).toHaveBeenCalled();
    expect(facade.tasks()[0].id).toBe(2);
  });

  it('should delegate toggleCompleted to facade', () => {
    facade.tasks.set([{ ...sampleTask, metadataFetched: false }]);
    const updated = { ...sampleTask, completed: true };
    taskService.toggleCompleted.and.returnValue(of(updated));
    spyOn(facade, 'toggleCompleted').and.callThrough();

    component.toggleCompleted(facade.tasks()[0]);

    expect(facade.toggleCompleted).toHaveBeenCalled();
    expect(facade.tasks()[0].completed).toBeTrue();
  });
});
