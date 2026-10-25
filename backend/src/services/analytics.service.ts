import { pool } from '../database/pool';

export async function getOverview(userId: string) {
  const { rows: speaking } = await pool.query(
    `SELECT
       COUNT(*)::int                        AS total_speaking,
       COALESCE(AVG(r.overall_score), 0)    AS speaking_average,
       COALESCE(MAX(r.overall_score), 0)    AS best_speaking
     FROM speaking_sessions s
     LEFT JOIN speaking_reports r ON r.session_id = s.id
     WHERE s.user_id = $1`,
    [userId],
  );

  const { rows: debate } = await pool.query(
    `SELECT
       COUNT(*)::int               AS total_debate,
       COALESCE(AVG(score), 0)    AS debate_average,
       COALESCE(MAX(score), 0)    AS best_debate
     FROM debate_sessions
     WHERE user_id = $1`,
    [userId],
  );

  const speakingRow = speaking[0];
  const debateRow = debate[0];

  const totalSessions =
    (speakingRow.total_speaking as number) + (debateRow.total_debate as number);
  const speakingAvg = Math.round(Number(speakingRow.speaking_average));
  const debateAvg = Math.round(Number(debateRow.debate_average));

  const speakingCount = Number(speakingRow.total_speaking);
  const debateCount = Number(debateRow.total_debate);
  const averageScore = totalSessions
    ? Math.round(
        (speakingAvg * speakingCount + debateAvg * debateCount) / totalSessions,
      )
    : 0;

  const bestScore = Math.max(
    Number(speakingRow.best_speaking),
    Number(debateRow.best_debate),
    0,
  );

  const streak = await getStreak(userId);

  return {
    averageScore,
    bestScore,
    totalSessions,
    speakingAverage: speakingAvg,
    debateAverage: debateAvg,
    currentStreak: streak.current,
    longestStreak: streak.longest,
  };
}

export async function getSpeakingAnalytics(userId: string) {
  const { rows: scoreOverTime } = await pool.query(
    `SELECT
       DATE(s.created_at) AS date,
       ROUND(AVG(r.overall_score))::int AS avg_score
     FROM speaking_sessions s
     JOIN speaking_reports r ON r.session_id = s.id
     WHERE s.user_id = $1
     GROUP BY DATE(s.created_at)
     ORDER BY DATE(s.created_at) ASC`,
    [userId],
  );

  const { rows: categoryBreakdown } = await pool.query(
    `SELECT
       s.category,
       COUNT(*)::int                     AS count,
       ROUND(AVG(r.overall_score))::int  AS avg_score
     FROM speaking_sessions s
     LEFT JOIN speaking_reports r ON r.session_id = s.id
     WHERE s.user_id = $1
     GROUP BY s.category
     ORDER BY count DESC`,
    [userId],
  );

  const { rows: difficultyBreakdown } = await pool.query(
    `SELECT
       s.difficulty,
       COUNT(*)::int                     AS count,
       ROUND(AVG(r.overall_score))::int  AS avg_score
     FROM speaking_sessions s
     LEFT JOIN speaking_reports r ON r.session_id = s.id
     WHERE s.user_id = $1
     GROUP BY s.difficulty`,
    [userId],
  );

  const { rows: wordCountGrowth } = await pool.query(
    `SELECT
       DATE(created_at)  AS date,
       ROUND(AVG(word_count))::int AS avg_word_count
     FROM speaking_sessions
     WHERE user_id = $1
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) ASC`,
    [userId],
  );

  const { rows: avgDurationRow } = await pool.query(
    `SELECT ROUND(AVG(duration_seconds))::int AS avg_duration
     FROM speaking_sessions
     WHERE user_id = $1`,
    [userId],
  );

  return {
    scoreOverTime,
    categoryBreakdown,
    difficultyBreakdown,
    wordCountGrowth,
    avgDuration: (avgDurationRow[0]?.avg_duration as number) || 0,
  };
}

export async function getDebateAnalytics(userId: string) {
  const { rows: scoreOverTime } = await pool.query(
    `SELECT
       DATE(created_at) AS date,
       ROUND(AVG(score))::int AS avg_score
     FROM debate_sessions
     WHERE user_id = $1 AND score > 0
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) ASC`,
    [userId],
  );

  const { rows: topicBreakdown } = await pool.query(
    `SELECT
       topic,
       COUNT(*)::int         AS count,
       ROUND(AVG(score))::int AS avg_score,
       ROUND(MAX(score))::int AS best_score
     FROM debate_sessions
     WHERE user_id = $1
     GROUP BY topic
     ORDER BY count DESC
     LIMIT 10`,
    [userId],
  );

  return { scoreOverTime, topicBreakdown };
}

export async function getStreak(userId: string): Promise<{
  current: number;
  longest: number;
}> {
  // Get distinct active days across both speaking and debate sessions
  const { rows } = await pool.query(
    `SELECT DISTINCT DATE(created_at) AS day
     FROM (
       SELECT created_at FROM speaking_sessions WHERE user_id = $1
       UNION ALL
       SELECT created_at FROM debate_sessions WHERE user_id = $1
     ) combined
     ORDER BY day DESC`,
    [userId],
  );

  if (!rows.length) return { current: 0, longest: 0 };

  const days = rows.map(r => new Date(r.day as string).toDateString());
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // If most recent activity isn't today or yesterday, current streak is 0
  if (days[0] !== today && days[0] !== yesterday) {
    return { current: 0, longest: calcLongestStreak(rows) };
  }

  // Calculate current streak
  let current = 1;
  for (let i = 1; i < rows.length; i++) {
    const prev = new Date(rows[i - 1].day as string);
    const curr = new Date(rows[i].day as string);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(current, calcLongestStreak(rows)) };
}

function calcLongestStreak(rows: Record<string, unknown>[]): number {
  if (!rows.length) return 0;
  let longest = 1;
  let streak = 1;
  for (let i = 1; i < rows.length; i++) {
    const prev = new Date(rows[i - 1].day as string);
    const curr = new Date(rows[i].day as string);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }
  return longest;
}
