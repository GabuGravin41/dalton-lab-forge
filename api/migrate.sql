-- Migration: Add view_count column and explore index to users_portfolios
-- Run once in your Neon console or via psql

ALTER TABLE users_portfolios
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Index for explore page ordering by views
CREATE INDEX IF NOT EXISTS idx_portfolios_views
  ON users_portfolios (view_count DESC, created_at DESC);

-- Ensure created_at exists (needed for explore sorting)
ALTER TABLE users_portfolios
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
