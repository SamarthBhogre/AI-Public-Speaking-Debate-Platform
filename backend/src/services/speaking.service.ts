import { pool } from '../database/pool';
import { aiService } from './ai';
import { AppError } from '../middleware/error.middleware';
import { SpeakingSession, SpeakingReport } from '../types';

export async function generateTopic(
  category?: string,
  difficulty?: string,
) {
  return aiService.generateSpeakingTopic({ category, difficulty });
}

export async function createSession(
  userId: string,
  data: {
    topic: string;
    category: string;
    difficulty: string;
    transcript: string;
    durationSeconds: number;
    wordCount: number;
  },
): Promise<{ session: SpeakingSession; report: SpeakingReport }> {
  const { topic, category, difficulty, transcript, durationSeconds, wordCount } = data;
  const actualWordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  const evaluation = await aiService.evaluateSpeaking({
    topic,
    transcript,
    durationSeconds,
    wordCount: actualWordCount || wordCount,
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: sessionRows } = await client.query(
      `INSERT INTO speaking_sessions
        (user_id, topic, category, difficulty, transcript, duration_seconds, word_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [userId, topic, category, difficulty, transcript, durationSeconds, actualWordCount],
    );
    const session = sessionRows[0] as SpeakingSession;
    const { rows: reportRows } = await client.query(
      `INSERT INTO speaking_reports
        (session_id, overall_score, fluency, clarity, vocabulary, content_relevance, strengths, improvements, feedback)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        session.id,
        evaluation.overall_score,
        evaluation.fluency,
        evaluation.clarity,
        evaluation.vocabulary,
        evaluation.content_relevance,
        JSON.stringify(evaluation.strengths),
        JSON.stringify(evaluation.improvements),
        evaluation.feedback,
      ],
    );
    await client.query('COMMIT');
    return { session, report: reportRows[0] as SpeakingReport };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getHistory(userId: string): Promise<
  (SpeakingSession & { report: SpeakingReport | null })[]
> {
  const { rows } = await pool.query(
    `SELECT
       s.*,
       r.id           AS report_id,
       r.overall_score,
       r.fluency,
       r.clarity,
       r.vocabulary,
       r.content_relevance,
       r.strengths,
       r.improvements,
       r.feedback,
       r.created_at   AS report_created_at
     FROM speaking_sessions s
     LEFT JOIN speaking_reports r ON r.session_id = s.id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId],
  );

  return rows.map(row => {
    const session: SpeakingSession = {
      id: row.id as string,
      user_id: row.user_id as string,
      topic: row.topic as string,
      category: row.category as string,
      difficulty: row.difficulty as string,
      transcript: row.transcript as string | null,
      duration_seconds: row.duration_seconds as number,
      word_count: row.word_count as number,
      created_at: row.created_at as string,
    };
    const report: SpeakingReport | null = row.report_id
      ? {
          id: row.report_id as string,
          session_id: row.id as string,
          overall_score: row.overall_score as number,
          fluency: row.fluency as number,
          clarity: row.clarity as number,
          vocabulary: row.vocabulary as number,
          content_relevance: row.content_relevance as number,
          strengths: row.strengths as string[],
          improvements: row.improvements as string[],
          feedback: row.feedback as string,
          created_at: row.report_created_at as string,
        }
      : null;
    return { ...session, report };
  });
}

export async function getSessionById(
  id: string,
  userId: string,
): Promise<(SpeakingSession & { report: SpeakingReport | null }) | null> {
  const { rows } = await pool.query(
    `SELECT
       s.*,
       r.id           AS report_id,
       r.overall_score,
       r.fluency,
       r.clarity,
       r.vocabulary,
       r.content_relevance,
       r.strengths,
       r.improvements,
       r.feedback,
       r.created_at   AS report_created_at
     FROM speaking_sessions s
     LEFT JOIN speaking_reports r ON r.session_id = s.id
     WHERE s.id = $1 AND s.user_id = $2`,
    [id, userId],
  );
  if (!rows.length) return null;
  const row = rows[0];
  const session: SpeakingSession = {
    id: row.id as string,
    user_id: row.user_id as string,
    topic: row.topic as string,
    category: row.category as string,
    difficulty: row.difficulty as string,
    transcript: row.transcript as string | null,
    duration_seconds: row.duration_seconds as number,
    word_count: row.word_count as number,
    created_at: row.created_at as string,
  };
  const report: SpeakingReport | null = row.report_id
    ? {
        id: row.report_id as string,
        session_id: row.id as string,
        overall_score: row.overall_score as number,
        fluency: row.fluency as number,
        clarity: row.clarity as number,
        vocabulary: row.vocabulary as number,
        content_relevance: row.content_relevance as number,
        strengths: row.strengths as string[],
        improvements: row.improvements as string[],
        feedback: row.feedback as string,
        created_at: row.report_created_at as string,
      }
    : null;
  return { ...session, report };
}
