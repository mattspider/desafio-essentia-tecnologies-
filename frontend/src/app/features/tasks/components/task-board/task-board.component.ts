import { Component, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskPriority } from '../../../../core/models/task.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { TaskViewModel } from '../../models/task-view.model';
import { TaskPanelComponent } from '../task-panel/task-panel.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    LoadingStateComponent,
    EmptyStateComponent,
    TaskPanelComponent,
  ],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
})
export class TaskBoardComponent {
  readonly tasks = input.required<TaskViewModel[]>();
  readonly loading = input(false);
  readonly pendingCount = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly editingTaskId = input<number | null>(null);
  readonly editForm = input<FormGroup | null>(null);
  readonly metadataForms = input.required<Map<number, FormGroup>>();
  readonly priorities = input.required<TaskPriority[]>();

  readonly refresh = output<void>();
  readonly toggleCompleted = output<TaskViewModel>();
  readonly edit = output<TaskViewModel>();
  readonly delete = output<TaskViewModel>();
  readonly panelOpened = output<TaskViewModel>();
  readonly saveEdit = output<number>();
  readonly cancelEdit = output<void>();
  readonly saveMetadata = output<TaskViewModel>();

  metadataFormFor(taskId: number): FormGroup | null {
    return this.metadataForms().get(taskId) ?? null;
  }

  isEditing(taskId: number): boolean {
    return this.editingTaskId() === taskId;
  }
}
