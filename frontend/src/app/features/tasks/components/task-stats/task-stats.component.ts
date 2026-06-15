import { Component, input } from '@angular/core';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [StatCardComponent],
  templateUrl: './task-stats.component.html',
  styleUrl: './task-stats.component.scss',
})
export class TaskStatsComponent {
  readonly total = input.required<number>();
  readonly pending = input.required<number>();
  readonly completed = input.required<number>();
}
