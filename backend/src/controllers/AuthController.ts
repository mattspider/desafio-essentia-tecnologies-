import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../container/tokens';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import {
  clearAuthCookies,
  generateCsrfToken,
  setAuthCookies,
  setCsrfCookie,
} from '../lib/auth-cookies';
import { IAuthService } from '../services/interfaces/IAuthService';

@injectable()
export class AuthController {
  constructor(@inject(TOKENS.AuthService) private readonly authService: IAuthService) {
    if (!this.authService) {
      throw new Error('AuthService dependency is required');
    }
  }

  csrf = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const csrfToken = generateCsrfToken();
      setCsrfCookie(res, csrfToken);
      res.status(200).json({ csrfToken });
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterDto;
      const result = await this.authService.register(body);
      const csrfToken = generateCsrfToken();

      setAuthCookies(res, result.token, csrfToken);
      res.status(201).json({ user: result.user, csrfToken });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as LoginDto;
      const result = await this.authService.login(body);
      const csrfToken = generateCsrfToken();

      setAuthCookies(res, result.token, csrfToken);
      res.status(200).json({ user: result.user, csrfToken });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getCurrentUser(req.user!.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      clearAuthCookies(res);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };
}
