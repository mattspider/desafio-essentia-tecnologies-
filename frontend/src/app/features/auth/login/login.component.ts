import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';
import { AuthCardComponent } from '../components/auth-card/auth-card.component';
import { AuthPasswordFieldComponent } from '../components/auth-password-field/auth-password-field.component';
import { AuthShellComponent } from '../components/auth-shell/auth-shell.component';
import { LOGIN_BRAND } from '../constants/auth-brand.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    AuthShellComponent,
    AuthCardComponent,
    AuthPasswordFieldComponent,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly brand = LOGIN_BRAND;
  loading = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        void this.router.navigate(['/tasks']);
      },
      error: (error: unknown) => {
        this.loading = false;
        this.snackBar.open(getApiErrorMessage(error, 'Falha ao entrar.'), 'Fechar', {
          duration: 4000,
        });
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
