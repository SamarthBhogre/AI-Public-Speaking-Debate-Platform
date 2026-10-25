export type View = 'dashboard' | 'practice' | 'speaking-report' | 'debate' | 'debate-report' | 'history' | 'analytics' | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface SpeakingSession {
  id: string;
  user_id: string;
  topic: string;
  category: string;
  difficulty: string;
  transcript: string | null;
  duration_seconds: number;
  word_count: number;
  created_at: string;
  report?: SpeakingReport;
}

export interface SpeakingReport {
  id: string;
  session_id: string;
  overall_score: number;
  fluency: number;
  clarity: number;
  vocabulary: number;
  content_relevance: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  created_at: string;
}

export interface DebateSession {
  id: string;
  user_id: string;
  topic: string;
  position: 'FOR' | 'AGAINST';
  score: number;
  created_at: string;
  rounds?: DebateRound[];
  feedback?: string | null;
  report?: {
    overall_score: number;
    argument_quality: number;
    relevance: number;
    rebuttal_quality: number;
    clarity: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    feedback: string;
  } | null;
}

export interface DebateRound {
  id: string;
  debate_session_id: string;
  round_number: number;
  prompt: string;
  student_response: string;
  ai_response: string;
  created_at: string;
}

export interface AnalyticsOverview {
  averageScore: number;
  bestScore: number;
  totalSessions: number;
  speakingAverage: number;
  debateAverage: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ScorePoint {
  date: string;
  score: number;
  type: string;
}
