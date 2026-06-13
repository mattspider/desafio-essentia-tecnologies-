import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../container/tokens';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { IAuthService } from '../services/interfaces/IAuthService';

@injectable()
export class AuthController {
  constructor(@inject(TOKENS.AuthService) private readonly authService: IAuthService) {
    if (!this.authService) {
      throw new Error('AuthService dependency is required');
    }
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterDto;
      const result = await this.authService.register(body);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as LoginDto;
      const result = await this.authService.login(body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
