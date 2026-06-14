import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { TaskListComponent } from './features/tasks/task-list/task-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'tasks',
    component: TaskListComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'tasks' },
];
