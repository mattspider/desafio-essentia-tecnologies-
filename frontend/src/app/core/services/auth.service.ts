import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CsrfResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  SessionResponse,
  User,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly userSignal = signal<User | null>(null);
  private csrfToken: string | null = null;
  private bootstrapDone = false;

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());

  bootstrap(): Observable<void> {
    return this.fetchCsrf().pipe(
      tap(() => {
        this.bootstrapDone = true;
      }),
      catchError(() => {
        this.bootstrapDone = true;
        return of(undefined);
      }),
      map(() => undefined),
    );
  }

  restoreSession(): Observable<User | null> {
    return this.http
      .get<MeResponse>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        tap((response) => this.userSignal.set(response.user)),
        map((response) => response.user),
        catchError(() => {
          this.userSignal.set(null);
          return of(null);
        }),
      );
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http
      .post<SessionResponse>(`${environment.apiUrl}/auth/register`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.applySession(response)),
        map((response) => response.user),
      );
  }

  login(payload: LoginRequest): Observable<User> {
    return this.http
      .post<SessionResponse>(`${environment.apiUrl}/auth/login`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.applySession(response)),
        map((response) => response.user),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/logout`, {}, {
        withCredentials: true,
      })
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(undefined);
        }),
        map(() => undefined),
      );
  }

  getCsrfToken(): string | null {
    return this.csrfToken;
  }

  isBootstrapped(): boolean {
    return this.bootstrapDone;
  }

  private fetchCsrf(): Observable<string> {
    return this.http
      .get<CsrfResponse>(`${environment.apiUrl}/auth/csrf`, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.csrfToken = response.csrfToken;
        }),
        map((response) => response.csrfToken),
      );
  }

  private applySession(response: SessionResponse): User {
    this.userSignal.set(response.user);
    this.csrfToken = response.csrfToken;
    return response.user;
  }

  private clearSession(): void {
    this.userSignal.set(null);
    this.csrfToken = null;
    void this.router.navigate(['/auth/login']);
  }
}
