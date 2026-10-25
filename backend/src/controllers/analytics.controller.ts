import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as analyticsService from '../services/analytics.service';

export async function getOverview(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const data = await analyticsService.getOverview(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getSpeaking(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const data = await analyticsService.getSpeakingAnalytics(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getDebate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const data = await analyticsService.getDebateAnalytics(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getStreak(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const data = await analyticsService.getStreak(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
