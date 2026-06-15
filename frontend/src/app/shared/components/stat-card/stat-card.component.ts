import { Component, input } from '@angular/core';

export type StatCardVariant = 'total' | 'pending' | 'done';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly variant = input<StatCardVariant>('total');
}
