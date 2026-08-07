-- 008_social_enhancements.sql
-- Extends social signal modelling: new platforms, provenance, and the
-- NLP scores produced by the classifier (sentiment, engagement, misinfo).

ALTER TYPE social_platform_enum ADD VALUE IF NOT EXISTS 'reddit';
ALTER TYPE social_platform_enum ADD VALUE IF NOT EXISTS 'youtube';

ALTER TABLE social_signals
  ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC,
  ADD COLUMN IF NOT EXISTS engagement_score NUMERIC,
  ADD COLUMN IF NOT EXISTS misinfo_score NUMERIC,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Fast lookups for engagement-based prioritisation and misinfo review queues.
CREATE INDEX IF NOT EXISTS idx_social_signals_engagement ON social_signals(engagement_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_social_signals_misinfo ON social_signals(misinfo_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_social_signals_platform ON social_signals(platform, observed_at DESC);
