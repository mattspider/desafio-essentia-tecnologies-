import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      next(new ValidationError('Validation failed', details as Record<string, string[]>));
      return;
    }

    req.body = result.data;
    next();
  };
}
