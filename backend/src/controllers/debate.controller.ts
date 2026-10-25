import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as debateService from '../services/debate.service';
import { AppError } from '../middleware/error.middleware';

export async function getTopic(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const topic = await debateService.generateTopic();
    res.json(topic);
  } catch (err) {
    next(err);
  }
}

export async function startSession(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const { topic, position } = req.body as {
      topic: string;
      position: 'FOR' | 'AGAINST';
    };
    const result = await debateService.createSession(userId, topic, position);
    res.status(201).json({ sessionId: result.session.id, openingPrompt: result.openingPrompt });
  } catch (err) {
    next(err);
  }
}

export async function respond(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const { sessionId, roundNumber, studentResponse } = req.body as {
      sessionId: string;
      roundNumber: number;
      studentResponse: string;
    };
    const result = await debateService.respondToRound(
      sessionId,
      userId,
      roundNumber,
      studentResponse,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function evaluate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const { sessionId } = req.body as { sessionId: string };
    const result = await debateService.evaluateDebate(sessionId, userId);
    res.json(result);
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
    const sessions = await debateService.getHistory(userId);
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
    const session = await debateService.getSessionById(id, userId);
    if (!session) return next(new AppError(404, 'Debate session not found'));
    res.json({ session });
  } catch (err) {
    next(err);
  }
}
