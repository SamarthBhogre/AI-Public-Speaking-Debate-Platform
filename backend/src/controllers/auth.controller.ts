import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    const { user, token } = await authService.registerUser(name, email, password);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user, message: 'Account created' });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { user, token } = await authService.loginUser(email, password);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user, message: 'Signed in successfully' });
  } catch (err) {
    next(err);
  }
}

export function logout(req: AuthRequest, res: Response) {
  res.clearCookie('token', { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' });
  res.json({ message: 'Logged out successfully' });
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const user = await authService.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
