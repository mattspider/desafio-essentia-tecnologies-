import { NextFunction, Request, Response } from 'express';
import { container } from '../container';
import { TOKENS } from '../container/tokens';
import { UnauthorizedError } from '../errors';
import { ACCESS_TOKEN_COOKIE } from '../lib/auth-cookies';
import { IAuthService } from '../services/interfaces/IAuthService';

function extractAccessToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;

  if (cookieToken) {
    return cookieToken;
  }

  const authorization = req.headers.authorization;

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  return undefined;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      throw new UnauthorizedError('Token not provided');
    }

    const authService = container.resolve<IAuthService>(TOKENS.AuthService);
    const payload = await authService.validateToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
