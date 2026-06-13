import { NextFunction, Request, Response } from 'express';
import { AppError, ValidationError } from '../errors';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}
