import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './error.middleware';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = result.error.issues
        .map((e: any) => `${String(e.path.join('.'))}: ${String(e.message)}`)
        .join('; ');
      return next(new AppError(400, msg));
    }
    req.body = result.data;
    next();
  };
}
