import { z } from 'zod';

export const startDebateSchema = z.object({
  topic: z.string().min(5).max(500),
  position: z.enum(['FOR', 'AGAINST']),
});

export const respondSchema = z.object({
  sessionId: z.string().uuid(),
  roundNumber: z.number().int().min(1).max(3),
  studentResponse: z.string().min(5),
});

export const evaluateDebateSchema = z.object({
  sessionId: z.string().uuid(),
});
