import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      type="button"
      class="theme-toggle"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.mode() === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"
      [matTooltip]="theme.mode() === 'dark' ? 'Modo claro' : 'Modo escuro'"
    >
      <mat-icon>{{ theme.mode() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  styles: `
    .theme-toggle {
      color: var(--tx-text-muted);
    }
  `,
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}
