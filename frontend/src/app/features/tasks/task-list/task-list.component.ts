import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CreateTaskRequest } from '../../../core/models/task.model';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { TaskBoardComponent } from '../components/task-board/task-board.component';
import { TaskComposerComponent } from '../components/task-composer/task-composer.component';
import { TaskStatsComponent } from '../components/task-stats/task-stats.component';
import { TaskViewModel } from '../models/task-view.model';
import { TaskFacadeService } from '../services/task-facade.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    MatSnackBarModule,
    AppHeaderComponent,
    TaskStatsComponent,
    TaskComposerComponent,
    TaskBoardComponent,
  ],
  providers: [TaskFacadeService],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  readonly facade = inject(TaskFacadeService);

  @ViewChild(TaskComposerComponent) private composer?: TaskComposerComponent;

  readonly user = this.authService.user;

  ngOnInit(): void {
    this.facade.loadTasks();
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  createTask(payload: CreateTaskRequest): void {
    this.facade.createTask(payload, () => this.composer?.reset());
  }

  toggleCompleted(task: TaskViewModel): void {
    this.facade.toggleCompleted(task);
  }

  startEdit(task: TaskViewModel): void {
    this.facade.startEdit(task);
  }

  cancelEdit(): void {
    this.facade.cancelEdit();
  }

  saveEdit(taskId: number): void {
    this.facade.saveEdit(taskId);
  }

  deleteTask(task: TaskViewModel): void {
    this.facade.deleteTask(task);
  }

  onPanelOpened(task: TaskViewModel): void {
    this.facade.onPanelOpened(task);
  }

  saveMetadata(task: TaskViewModel): void {
    this.facade.saveMetadata(task);
  }
}
