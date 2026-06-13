import { AppError } from './AppError';

export class EmailAlreadyExistsError extends AppError {
  constructor(message = 'Email already registered') {
    super(message, 409, 'EMAIL_ALREADY_EXISTS');
  }
}
