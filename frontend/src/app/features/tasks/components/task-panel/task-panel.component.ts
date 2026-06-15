import { Component, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TaskPriority } from '../../../../core/models/task.model';
import { TaskViewModel } from '../../models/task-view.model';
import { displayPriority, displayTags } from '../../utils/task-display.util';
import { TaskBadgesComponent } from '../task-badges/task-badges.component';
import { TaskEditFormComponent } from '../task-edit-form/task-edit-form.component';
import { TaskMetadataFormComponent } from '../task-metadata-form/task-metadata-form.component';

@Component({
  selector: 'app-task-panel',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    TaskBadgesComponent,
    TaskEditFormComponent,
    TaskMetadataFormComponent,
  ],
  templateUrl: './task-panel.component.html',
  styleUrl: './task-panel.component.scss',
})
export class TaskPanelComponent {
  readonly task = input.required<TaskViewModel>();
  readonly editing = input(false);
  readonly editForm = input<FormGroup | null>(null);
  readonly metadataForm = input<FormGroup | null>(null);
  readonly priorities = input.required<TaskPriority[]>();

  readonly toggleCompleted = output<void>();
  readonly edit = output<void>();
  readonly delete = output<void>();
  readonly panelOpened = output<void>();
  readonly saveEdit = output<void>();
  readonly cancelEdit = output<void>();
  readonly saveMetadata = output<void>();

  priority(): TaskPriority {
    return displayPriority(this.task(), this.metadataForm());
  }

  tags(): string[] {
    return displayTags(this.task(), this.metadataForm());
  }

  showPriorityBadge(): boolean {
    const task = this.task();
    return Boolean(task.metadataFetched || this.metadataForm());
  }
}
