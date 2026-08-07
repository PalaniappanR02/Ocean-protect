-- Analyst review workflow for social signals (Stage 3).
ALTER TABLE social_signals ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE social_signals ADD COLUMN IF NOT EXISTS credibility_score INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_social_signals_review ON social_signals(review_status);
