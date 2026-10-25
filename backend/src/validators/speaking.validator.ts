import { z } from 'zod';

export const evaluateSchema = z.object({
  topic: z.string().min(5).max(500),
  category: z.string().default('General'),
  difficulty: z.string().default('Intermediate'),
  transcript: z.string().min(10, 'Transcript too short'),
  durationSeconds: z.number().int().min(0).max(7200),
  wordCount: z.number().int().min(1),
});

export const topicSchema = z.object({
  category: z.string().optional(),
  difficulty: z.string().optional(),
});
