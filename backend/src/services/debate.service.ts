import { pool } from '../database/pool';
import { aiService } from './ai';
import { AppError } from '../middleware/error.middleware';
import { DebateSession, DebateRound } from '../types';

const ROUND_PROMPTS = [
  'Make your strongest opening argument with a clear claim and at least one concrete example.',
  'Your opponent raises a fair point. Acknowledge it briefly, then strengthen your position.',
  'Give your closing statement. Summarise your case and explain why your position is correct.',
];

export async function generateTopic() {
  return aiService.generateDebateTopic();
}

export async function createSession(
  userId: string,
  topic: string,
  position: 'FOR' | 'AGAINST',
): Promise<{ session: DebateSession; openingPrompt: string }> {
  const { rows } = await pool.query(
    `INSERT INTO debate_sessions (user_id, topic, position)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, topic, position],
  );
  const session = rows[0] as DebateSession;
  return { session, openingPrompt: ROUND_PROMPTS[0] };
}

export async function respondToRound(
  sessionId: string,
  userId: string,
  roundNumber: number,
  studentResponse: string,
): Promise<{ aiResponse: string; nextPrompt: string | null; roundId: string; isLastRound: boolean }> {
  // Verify session ownership
  const { rows: sessionRows } = await pool.query(
    'SELECT * FROM debate_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId],
  );
  if (!sessionRows.length) throw new AppError(404, 'Debate session not found');
  const session = sessionRows[0] as DebateSession;

  const { rows: countRows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM debate_rounds WHERE debate_session_id = $1',
    [sessionId],
  );
  const expectedRound = Number(countRows[0].count) + 1;
  if (roundNumber !== expectedRound) {
    throw new AppError(409, 'Debate rounds must be submitted in order');
  }

  // Fetch conversation history
  const { rows: histRows } = await pool.query(
    `SELECT prompt, student_response, ai_response
     FROM debate_rounds
     WHERE debate_session_id = $1
     ORDER BY round_number ASC`,
    [sessionId],
  );

  const conversationHistory = histRows.map(r => ({
    prompt: r.prompt as string,
    response: r.student_response as string,
  }));

  // Generate AI counterargument
  const { response: aiResponse } = await aiService.generateDebateResponse({
    topic: session.topic,
    position: session.position,
    round: roundNumber,
    studentResponse,
    conversationHistory,
  });

  // Insert round
  const prompt = ROUND_PROMPTS[roundNumber - 1] || ROUND_PROMPTS[0];
  const { rows: roundRows } = await pool.query(
    `INSERT INTO debate_rounds
      (debate_session_id, round_number, prompt, student_response, ai_response)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [sessionId, roundNumber, prompt, studentResponse, aiResponse],
  );
  const roundId = roundRows[0].id as string;

  const nextPrompt =
    roundNumber < 3 ? ROUND_PROMPTS[roundNumber] : null;

  return { aiResponse, nextPrompt, roundId, isLastRound: roundNumber === 3 };
}

export async function evaluateDebate(
  sessionId: string,
  userId: string,
): Promise<{ score: number; feedback: string }> {
  // Verify session ownership
  const { rows: sessionRows } = await pool.query(
    'SELECT * FROM debate_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId],
  );
  if (!sessionRows.length) throw new AppError(404, 'Debate session not found');
  const session = sessionRows[0] as DebateSession;

  // Fetch rounds
  const { rows: roundRows } = await pool.query(
    `SELECT prompt, student_response
     FROM debate_rounds
     WHERE debate_session_id = $1
     ORDER BY round_number ASC`,
    [sessionId],
  );

  if (roundRows.length !== 3) {
    throw new AppError(400, 'Complete all three debate rounds before evaluation');
  }

  const rounds = roundRows.map(r => ({
    prompt: r.prompt as string,
    studentResponse: r.student_response as string,
  }));

  const evaluation = await aiService.evaluateDebate({
    topic: session.topic,
    position: session.position,
    rounds,
  });

  // Update score
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "UPDATE debate_sessions SET score = $1, feedback = $2, status = 'completed' WHERE id = $3",
      [evaluation.score, evaluation.feedback, sessionId],
    );
    await client.query(
      `INSERT INTO debate_reports
        (session_id, overall_score, argument_quality, relevance, rebuttal_quality, clarity, strengths, weaknesses, suggestions, feedback)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (session_id) DO UPDATE SET
         overall_score = EXCLUDED.overall_score,
         argument_quality = EXCLUDED.argument_quality,
         relevance = EXCLUDED.relevance,
         rebuttal_quality = EXCLUDED.rebuttal_quality,
         clarity = EXCLUDED.clarity,
         strengths = EXCLUDED.strengths,
         weaknesses = EXCLUDED.weaknesses,
         suggestions = EXCLUDED.suggestions,
         feedback = EXCLUDED.feedback,
         created_at = NOW()`,
      [sessionId,evaluation.score,evaluation.argument_quality,evaluation.relevance,evaluation.rebuttal_quality,evaluation.clarity,JSON.stringify(evaluation.strengths),JSON.stringify(evaluation.weaknesses),JSON.stringify(evaluation.suggestions),evaluation.feedback],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return evaluation;
}

export async function getHistory(
  userId: string,
): Promise<(DebateSession & { rounds: DebateRound[] })[]> {
  const { rows: sessions } = await pool.query(
    "SELECT * FROM debate_sessions WHERE user_id = $1 AND status = 'completed' ORDER BY created_at DESC",
    [userId],
  );

  if (!sessions.length) return [];

  const sessionIds = sessions.map((s: Record<string, unknown>) => s.id);
  const { rows: rounds } = await pool.query(
    `SELECT * FROM debate_rounds WHERE debate_session_id = ANY($1::uuid[]) ORDER BY round_number ASC`,
    [sessionIds],
  );

  return sessions.map((s: Record<string, unknown>) => ({
    ...(s as unknown as DebateSession),
    rounds: rounds.filter(
      (r: Record<string, unknown>) => r.debate_session_id === s.id,
    ) as DebateRound[],
  }));
}

export async function getSessionById(
  id: string,
  userId: string,
): Promise<(DebateSession & { rounds: DebateRound[] }) | null> {
  const { rows: sessionRows } = await pool.query(
    `SELECT s.*, r.overall_score, r.argument_quality, r.relevance, r.rebuttal_quality,
            r.clarity, r.strengths, r.weaknesses, r.suggestions, r.feedback AS report_feedback
     FROM debate_sessions s
     LEFT JOIN debate_reports r ON r.session_id = s.id
     WHERE s.id = $1 AND s.user_id = $2`,
    [id, userId],
  );
  if (!sessionRows.length) return null;

  const { rows: roundRows } = await pool.query(
    `SELECT * FROM debate_rounds WHERE debate_session_id = $1 ORDER BY round_number ASC`,
    [id],
  );

  return {
    ...(sessionRows[0] as DebateSession),
    rounds: roundRows as DebateRound[],
    feedback: sessionRows[0].feedback as string | null,
    report: sessionRows[0].overall_score ? {
      overall_score: sessionRows[0].overall_score,
      argument_quality: sessionRows[0].argument_quality,
      relevance: sessionRows[0].relevance,
      rebuttal_quality: sessionRows[0].rebuttal_quality,
      clarity: sessionRows[0].clarity,
      strengths: sessionRows[0].strengths,
      weaknesses: sessionRows[0].weaknesses,
      suggestions: sessionRows[0].suggestions,
      feedback: sessionRows[0].report_feedback,
    } : null,
  };
}
