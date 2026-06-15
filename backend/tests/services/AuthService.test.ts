import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '../../src/config/env';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
} from '../../src/errors';
import { IUserRepository } from '../../src/repositories/interfaces/IUserRepository';
import { AuthService } from '../../src/services/AuthService';
import { createUser, createUserWithPassword } from '../helpers/factories';

describe('AuthService', () => {
  let userRepository: IUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };

    authService = new AuthService(userRepository);
  });

  describe('register', () => {
    it('creates user and returns token when email is available', async () => {
      const input = {
        name: 'Test User',
        email: 'new@test.com',
        password: 'secret123',
      };
      const createdUser = createUser({ email: input.email, name: input.name });

      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue(createdUser);

      const result = await authService.register(input);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(userRepository.create).toHaveBeenCalledOnce();

      const createArg = vi.mocked(userRepository.create).mock.calls[0][0];
      expect(createArg.email).toBe(input.email);
      expect(createArg.name).toBe(input.name);
      expect(await bcrypt.compare(input.password, createArg.password)).toBe(true);

      expect(result.user).toEqual(createdUser);
      expect(result.token).toBeTypeOf('string');

      const payload = jwt.verify(result.token, env.jwtSecret()) as {
        userId: number;
        email: string;
      };
      expect(payload.userId).toBe(createdUser.id);
      expect(payload.email).toBe(createdUser.email);
    });

    it('throws EmailAlreadyExistsError when email is already registered', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(
        createUserWithPassword('hashed', { email: 'existing@test.com' }),
      );

      await expect(
        authService.register({
          name: 'Duplicate',
          email: 'existing@test.com',
          password: 'secret123',
        }),
      ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns token and user when credentials are valid', async () => {
      const password = 'secret123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const userWithPassword = createUserWithPassword(hashedPassword, {
        email: 'user@test.com',
      });

      vi.mocked(userRepository.findByEmail).mockResolvedValue(userWithPassword);

      const result = await authService.login({
        email: userWithPassword.email,
        password,
      });

      expect(result.user).toEqual({
        id: userWithPassword.id,
        email: userWithPassword.email,
        name: userWithPassword.name,
        createdAt: userWithPassword.createdAt,
        updatedAt: userWithPassword.updatedAt,
      });
      expect(jwt.verify(result.token, env.jwtSecret())).toMatchObject({
        userId: userWithPassword.id,
        email: userWithPassword.email,
      });
    });

    it('throws InvalidCredentialsError when user does not exist', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'missing@test.com', password: 'secret123' }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('throws InvalidCredentialsError when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);

      vi.mocked(userRepository.findByEmail).mockResolvedValue(
        createUserWithPassword(hashedPassword),
      );

      await expect(
        authService.login({ email: 'user@test.com', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });
  });

  describe('getCurrentUser', () => {
    it('returns user when id exists', async () => {
      const user = createUser();
      vi.mocked(userRepository.findById).mockResolvedValue(user);

      await expect(authService.getCurrentUser(user.id)).resolves.toEqual(user);
    });

    it('throws UnauthorizedError when user does not exist', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await expect(authService.getCurrentUser(999)).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('validateToken', () => {
    it('returns payload for a valid token', async () => {
      const user = createUser();
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        env.jwtSecret(),
        { expiresIn: '1h' },
      );

      await expect(authService.validateToken(token)).resolves.toMatchObject({
        userId: user.id,
        email: user.email,
      });
    });

    it('throws UnauthorizedError for invalid token', async () => {
      await expect(authService.validateToken('invalid.token.value')).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('throws UnauthorizedError when payload is incomplete', async () => {
      const token = jwt.sign({ userId: 1 }, env.jwtSecret(), { expiresIn: '1h' });

      await expect(authService.validateToken(token)).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });
});
