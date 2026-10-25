CREATE TABLE IF NOT EXISTS debate_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES debate_sessions(id) ON DELETE CASCADE,
  overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  argument_quality INT NOT NULL CHECK (argument_quality BETWEEN 0 AND 100),
  relevance INT NOT NULL CHECK (relevance BETWEEN 0 AND 100),
  rebuttal_quality INT NOT NULL CHECK (rebuttal_quality BETWEEN 0 AND 100),
  clarity INT NOT NULL CHECK (clarity BETWEEN 0 AND 100),
  strengths JSONB NOT NULL DEFAULT '[]',
  weaknesses JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  feedback TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
