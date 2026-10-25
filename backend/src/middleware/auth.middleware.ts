import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    (req.cookies as Record<string, string> | undefined)?.token ||
    req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new AppError(401, 'Authentication required'));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
