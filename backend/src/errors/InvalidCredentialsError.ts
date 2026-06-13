import { AppError } from './AppError';

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid email or password') {
    super(message, 401, 'INVALID_CREDENTIALS');
  }
}
