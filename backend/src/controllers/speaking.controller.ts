import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as speakingService from '../services/speaking.service';
import { AppError } from '../middleware/error.middleware';

export async function getTopic(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { category, difficulty } = req.body as {
      category?: string;
      difficulty?: string;
    };
    const topic = await speakingService.generateTopic(category, difficulty);
    res.json(topic);
  } catch (err) {
    next(err);
  }
}

export async function createSession(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const { topic, category, difficulty, transcript, durationSeconds, wordCount } =
      req.body as {
        topic: string;
        category: string;
        difficulty: string;
        transcript: string;
        durationSeconds: number;
        wordCount: number;
      };
    const result = await speakingService.createSession(userId, {
      topic,
      category,
      difficulty,
      transcript,
      durationSeconds,
      wordCount,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const sessions = await speakingService.getHistory(userId);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

export async function getById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = await speakingService.getSessionById(id, userId);
    if (!session) return next(new AppError(404, 'Session not found'));
    res.json({ session });
  } catch (err) {
    next(err);
  }
}
