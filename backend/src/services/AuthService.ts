import { inject, injectable } from 'tsyringe';
import { AppError } from '../errors';
import { TOKENS } from '../container/tokens';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import {
  AuthResult,
  IAuthService,
  LoginInput,
  RegisterInput,
  TokenPayload,
} from './interfaces/IAuthService';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
  ) {
    if (!this.userRepository) {
      throw new Error('UserRepository dependency is required');
    }
  }

  register(_input: RegisterInput): Promise<AuthResult> {
    return Promise.reject(new AppError('Auth register not implemented yet', 501, 'NOT_IMPLEMENTED'));
  }

  login(_input: LoginInput): Promise<AuthResult> {
    return Promise.reject(new AppError('Auth login not implemented yet', 501, 'NOT_IMPLEMENTED'));
  }

  validateToken(_token: string): Promise<TokenPayload> {
    return Promise.reject(
      new AppError('Auth validateToken not implemented yet', 501, 'NOT_IMPLEMENTED'),
    );
  }
}
