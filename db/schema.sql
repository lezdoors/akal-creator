-- AKAL Creator — attribution schema
-- Apply:  psql "$DATABASE_URL" -f db/schema.sql
--
-- Two constraints carry the whole product:
--   1. conversions_idempotency — client postbacks retry. Without this, a retry
--      double-counts a signup and every CPA on every report is wrong.
--   2. campaigns.report_token — unguessable, so /r/:token needs no auth in v1.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  contact_email text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name             text NOT NULL,
  budget_cents     bigint NOT NULL DEFAULT 0,
  target_cpa_cents bigint,
  currency         char(3) NOT NULL DEFAULT 'USD',
  status           text NOT NULL DEFAULT 'draft',
  report_token     text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creators (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle        text NOT NULL,
  platform      text NOT NULL,
  channel_url   text,
  audience_size bigint,
  topic_tags    text[] NOT NULL DEFAULT '{}',
  contact_email text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, handle)
);

CREATE TABLE IF NOT EXISTS placements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id       uuid NOT NULL REFERENCES creators(id) ON DELETE RESTRICT,
  code             text NOT NULL UNIQUE,
  dest_url         text NOT NULL,
  agreed_fee_cents bigint NOT NULL DEFAULT 0,
  live_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Append-only. Never updated, never deleted.
CREATE TABLE IF NOT EXISTS clicks (
  id           bigserial PRIMARY KEY,
  placement_id uuid NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  ts           timestamptz NOT NULL DEFAULT now(),
  ip_hash      text,          -- hashed, never the raw IP
  ua           text,
  country      text,
  referrer     text
);

CREATE TABLE IF NOT EXISTS conversions (
  id           bigserial PRIMARY KEY,
  placement_id uuid NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  ts           timestamptz NOT NULL DEFAULT now(),
  event        text NOT NULL,
  external_id  text NOT NULL,
  value_cents  bigint NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS conversions_idempotency
  ON conversions (placement_id, event, external_id);

CREATE TABLE IF NOT EXISTS api_keys (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  label      text,
  key_hash   text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text,
  email       text NOT NULL,
  company     text,
  website     text,
  budget_band text,
  message     text,
  source      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clicks_placement_ts      ON clicks (placement_id, ts DESC);
CREATE INDEX IF NOT EXISTS conversions_placement_ts ON conversions (placement_id, ts DESC);
CREATE INDEX IF NOT EXISTS placements_campaign      ON placements (campaign_id);
CREATE INDEX IF NOT EXISTS campaigns_client         ON campaigns (client_id);
