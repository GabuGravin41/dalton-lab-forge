-- Table schema to hold user custom portfolio data.
-- You can run this in your Neon SQL console to prepare the database.

CREATE TABLE IF NOT EXISTS users_portfolios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_data JSONB NOT NULL,
  projects_data JSONB NOT NULL,
  papers_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
