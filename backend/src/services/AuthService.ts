import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { env } from '../config/env';
import { TOKENS } from '../container/tokens';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
} from '../errors';
import { User } from '../models/User';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import {
  AuthResult,
  IAuthService,
  LoginInput,
  RegisterInput,
  TokenPayload,
} from './interfaces/IAuthService';

const SALT_ROUNDS = 10;

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
  ) {
    if (!this.userRepository) {
      throw new Error('UserRepository dependency is required');
    }
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    });

    const token = this.generateToken(user);

    return { token, user };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const userWithPassword = await this.userRepository.findByEmail(input.email);

    if (!userWithPassword) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await bcrypt.compare(input.password, userWithPassword.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const user: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      createdAt: userWithPassword.createdAt,
      updatedAt: userWithPassword.updatedAt,
    };

    const token = this.generateToken(user);

    return { token, user };
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, env.jwtSecret()) as TokenPayload;

      if (!payload.userId || !payload.email) {
        throw new UnauthorizedError('Invalid token payload');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  private generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, env.jwtSecret(), {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}
