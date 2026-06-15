import { Component, input } from '@angular/core';
import { TaskPriority } from '../../../../core/models/task.model';
import { priorityLabel, statusLabel } from '../../utils/task-labels.util';

@Component({
  selector: 'app-task-badges',
  standalone: true,
  templateUrl: './task-badges.component.html',
  styleUrl: './task-badges.component.scss',
})
export class TaskBadgesComponent {
  readonly completed = input.required<boolean>();
  readonly priority = input<TaskPriority | null>(null);
  readonly tags = input<string[]>([]);
  readonly showPriority = input(false);

  readonly statusLabel = statusLabel;
  readonly priorityLabel = priorityLabel;
}
