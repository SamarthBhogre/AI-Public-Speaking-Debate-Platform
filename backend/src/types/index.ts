export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

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
  created_at: string;
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

// AI interface types
export interface SpeakingTopic {
  topic: string;
  category: string;
  difficulty: string;
}

export interface DebateTopic {
  topic: string;
  for_stance: string;
  against_stance: string;
}

export interface DebateResponse {
  response: string;
}

export interface SpeakingEvaluation {
  overall_score: number;
  fluency: number;
  clarity: number;
  vocabulary: number;
  content_relevance: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export interface DebateEvaluation {
  score: number;
  feedback: string;
  argument_quality: number;
  relevance: number;
  rebuttal_quality: number;
  clarity: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
