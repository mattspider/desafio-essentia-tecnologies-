import { NextFunction, Request, Response } from 'express';
import { container } from '../container';
import { TOKENS } from '../container/tokens';
import { UnauthorizedError } from '../errors';
import { IAuthService } from '../services/interfaces/IAuthService';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token not provided');
    }

    const token = authorization.slice('Bearer '.length);
    const authService = container.resolve<IAuthService>(TOKENS.AuthService);
    const payload = await authService.validateToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
