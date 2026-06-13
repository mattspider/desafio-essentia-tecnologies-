import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    public readonly details?: Record<string, string[]>,
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
