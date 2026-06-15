import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const CSRF_EXEMPT_SUFFIXES = ['/auth/login', '/auth/register', '/auth/csrf'];

function isCsrfExempt(url: string): boolean {
  return CSRF_EXEMPT_SUFFIXES.some((suffix) => url.includes(suffix));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const headers: Record<string, string> = {};

  if (MUTATING_METHODS.has(req.method) && !isCsrfExempt(req.url)) {
    const csrfToken = authService.getCsrfToken();

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return next(
    req.clone({
      withCredentials: true,
      setHeaders: headers,
    }),
  );
};
