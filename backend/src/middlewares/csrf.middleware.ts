import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors';
import { CSRF_HEADER, CSRF_TOKEN_COOKIE } from '../lib/auth-cookies';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const CSRF_EXEMPT_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/csrf',
  '/health',
]);

function normalizeApiPath(req: Request): string {
  const path = req.path.startsWith('/api') ? req.path.slice(4) : req.path;
  return path || '/';
}

export function csrfMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const path = normalizeApiPath(req);

  if (CSRF_EXEMPT_PATHS.has(path)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_TOKEN_COOKIE] as string | undefined;
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(new ForbiddenError('Invalid CSRF token'));
    return;
  }

  next();
}
