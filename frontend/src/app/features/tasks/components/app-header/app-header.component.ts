import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../../core/models/user.model';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';
import { UserChipComponent } from '../../../../shared/components/user-chip/user-chip.component';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ThemeToggleComponent, UserChipComponent],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  readonly user = input<User | null>(null);
  readonly logout = output<void>();
}
