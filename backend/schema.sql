-- MindGuard AI — backend-ready relational schema
-- Intended for PostgreSQL or SQLite via the future Flask service.
-- Do not store raw third-party passwords. Store token references only.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connected_platforms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  connection_status TEXT NOT NULL,
  access_token_reference TEXT,
  connected_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS consent_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_conversation_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  message_type TEXT NOT NULL,
  analysis_status TEXT NOT NULL DEFAULT 'Not Analyzed'
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  classification TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS user_analysis_summary (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  analysis_period TEXT NOT NULL,
  risk_indicator TEXT NOT NULL,
  score DOUBLE PRECISION,
  generated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS model_configurations (
  id TEXT PRIMARY KEY,
  model_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp);
CREATE INDEX IF NOT EXISTS idx_platforms_user ON connected_platforms (user_id);
CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records (user_id);
