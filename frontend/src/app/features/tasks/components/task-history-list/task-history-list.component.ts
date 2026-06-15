import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TaskHistoryEntry } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-history-list',
  standalone: true,
  imports: [DatePipe, MatListModule, MatIconModule],
  templateUrl: './task-history-list.component.html',
  styleUrl: './task-history-list.component.scss',
})
export class TaskHistoryListComponent {
  readonly history = input.required<TaskHistoryEntry[]>();
}
