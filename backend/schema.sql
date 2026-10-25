-- Reference schema. The application applies the ordered SQL files in
-- src/database/migrations at server startup.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE speaking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  difficulty VARCHAR(20) NOT NULL DEFAULT 'Intermediate',
  transcript TEXT NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  word_count INT NOT NULL DEFAULT 0 CHECK (word_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE speaking_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES speaking_sessions(id) ON DELETE CASCADE,
  overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  fluency INT NOT NULL CHECK (fluency BETWEEN 0 AND 100),
  clarity INT NOT NULL CHECK (clarity BETWEEN 0 AND 100),
  vocabulary INT NOT NULL CHECK (vocabulary BETWEEN 0 AND 100),
  content_relevance INT NOT NULL CHECK (content_relevance BETWEEN 0 AND 100),
  strengths JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  feedback TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE debate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  position VARCHAR(10) NOT NULL CHECK (position IN ('FOR', 'AGAINST')),
  score INT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  feedback TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE debate_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_session_id UUID NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
  round_number INT NOT NULL CHECK (round_number BETWEEN 1 AND 3),
  prompt TEXT NOT NULL,
  student_response TEXT NOT NULL,
  ai_response TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(debate_session_id, round_number)
);

CREATE TABLE debate_reports (
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

CREATE INDEX idx_speaking_user ON speaking_sessions(user_id, created_at DESC);
CREATE INDEX idx_debate_user ON debate_sessions(user_id, created_at DESC);
CREATE INDEX idx_debate_rounds ON debate_rounds(debate_session_id, round_number);
