import crypto from 'crypto';
import { CookieOptions, Response } from 'express';
import { env } from '../config/env';

export const ACCESS_TOKEN_COOKIE = 'techx_access_token';
export const CSRF_TOKEN_COOKIE = 'techx_csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function baseCookieOptions(maxAge: number, httpOnly: boolean): CookieOptions {
  const isProduction = env.nodeEnv === 'production';

  return {
    httpOnly,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge,
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  csrfToken: string,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, baseCookieOptions(SEVEN_DAYS_MS, true));
  res.cookie(CSRF_TOKEN_COOKIE, csrfToken, baseCookieOptions(SEVEN_DAYS_MS, false));
}

export function setCsrfCookie(res: Response, csrfToken: string): void {
  res.cookie(CSRF_TOKEN_COOKIE, csrfToken, baseCookieOptions(SEVEN_DAYS_MS, false));
}

export function clearAuthCookies(res: Response): void {
  const isProduction = env.nodeEnv === 'production';
  const clearOptions: CookieOptions = {
    path: '/',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...clearOptions, httpOnly: true });
  res.clearCookie(CSRF_TOKEN_COOKIE, { ...clearOptions, httpOnly: false });
}
