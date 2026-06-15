import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';
import { AuthBrandContent } from '../../models/auth-brand.model';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [MatIconModule, ThemeToggleComponent],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss',
})
export class AuthShellComponent {
  readonly brand = input.required<AuthBrandContent>();
}
