ALTER TABLE debate_sessions
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'in_progress';

UPDATE debate_sessions SET status = 'completed' WHERE score > 0;
