import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskMetadata, TaskPriority } from '../../../../core/models/task.model';
import { TaskBadgesComponent } from '../task-badges/task-badges.component';
import { TaskHistoryListComponent } from '../task-history-list/task-history-list.component';
import { priorityLabel } from '../../utils/task-labels.util';
import { TaskViewModel } from '../../models/task-view.model';

@Component({
  selector: 'app-task-metadata-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    TaskBadgesComponent,
    TaskHistoryListComponent,
  ],
  templateUrl: './task-metadata-form.component.html',
  styleUrl: './task-metadata-form.component.scss',
})
export class TaskMetadataFormComponent {
  readonly task = input.required<TaskViewModel>();
  readonly form = input.required<FormGroup>();
  readonly priorities = input.required<TaskPriority[]>();
  readonly save = output<void>();

  readonly priorityLabel = priorityLabel;

  metadata(): TaskMetadata | null | undefined {
    return this.task().metadata;
  }
}
