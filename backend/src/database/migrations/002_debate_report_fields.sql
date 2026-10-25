ALTER TABLE debate_sessions
  ADD COLUMN IF NOT EXISTS feedback TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_debate_round_unique
  ON debate_rounds(debate_session_id, round_number);
