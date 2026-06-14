import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/api-error.model';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as ApiErrorBody | string | null;

    if (body && typeof body === 'object' && body.error?.message) {
      return body.error.message;
    }

    if (typeof body === 'string' && body.length > 0) {
      return body;
    }
  }

  return fallback;
}
