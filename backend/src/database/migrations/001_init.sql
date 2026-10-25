CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS speaking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  category VARCHAR(80) DEFAULT 'General',
  difficulty VARCHAR(20) DEFAULT 'Intermediate',
  transcript TEXT,
  duration_seconds INT DEFAULT 0,
  word_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS speaking_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES speaking_sessions(id) ON DELETE CASCADE,
  overall_score INT NOT NULL DEFAULT 0,
  fluency INT NOT NULL DEFAULT 0,
  clarity INT NOT NULL DEFAULT 0,
  vocabulary INT NOT NULL DEFAULT 0,
  content_relevance INT NOT NULL DEFAULT 0,
  strengths JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  feedback TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  position VARCHAR(10) NOT NULL CHECK (position IN ('FOR', 'AGAINST')),
  score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debate_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_session_id UUID NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
  round_number INT NOT NULL CHECK (round_number BETWEEN 1 AND 3),
  prompt TEXT NOT NULL,
  student_response TEXT NOT NULL,
  ai_response TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speaking_user ON speaking_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debate_user ON debate_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debate_rounds ON debate_rounds(debate_session_id, round_number);
