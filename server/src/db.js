const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DB_DIR || (process.env.VERCEL ? path.join('/tmp', 'pulsepoint') : path.join(__dirname, '..', 'data'));
fs.mkdirSync(DATA_DIR, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(DATA_DIR, 'pulsepoint.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS datasets (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    org_name        TEXT DEFAULT '',
    description     TEXT DEFAULT '',
    passcode        TEXT NOT NULL DEFAULT 'view1234',
    admin_passcode  TEXT NOT NULL DEFAULT 'admin1234',
    industry        TEXT DEFAULT 'General',
    date_range_start TEXT DEFAULT NULL,
    date_range_end   TEXT DEFAULT NULL,
    response_count INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS survey_responses (
    id              TEXT PRIMARY KEY,
    dataset_id      TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    respondent_id   TEXT DEFAULT NULL,
    channel         TEXT DEFAULT 'Survey',
    touchpoint      TEXT DEFAULT 'General',
    segment         TEXT DEFAULT 'All',
    nps_score       INTEGER DEFAULT NULL CHECK(nps_score IS NULL OR (nps_score >= 0 AND nps_score <= 10)),
    csat_score      REAL DEFAULT NULL CHECK(csat_score IS NULL OR (csat_score >= 1 AND csat_score <= 5)),
    ces_score       REAL DEFAULT NULL CHECK(ces_score IS NULL OR (ces_score >= 1 AND ces_score <= 7)),
    verbatim        TEXT DEFAULT NULL,
    sentiment       TEXT DEFAULT NULL CHECK(sentiment IN ('positive','neutral','negative') OR sentiment IS NULL),
    themes          TEXT DEFAULT '[]',
    category_tags   TEXT DEFAULT '[]',
    region          TEXT DEFAULT NULL,
    date            TEXT NOT NULL,
    ai_processed    INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_responses_dataset ON survey_responses(dataset_id);
  CREATE INDEX IF NOT EXISTS idx_responses_date ON survey_responses(date);
  CREATE INDEX IF NOT EXISTS idx_responses_touchpoint ON survey_responses(touchpoint);
  CREATE INDEX IF NOT EXISTS idx_responses_sentiment ON survey_responses(sentiment);

  CREATE TABLE IF NOT EXISTS annotations (
    id              TEXT PRIMARY KEY,
    dataset_id      TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    date            TEXT NOT NULL,
    label           TEXT NOT NULL,
    description     TEXT DEFAULT NULL,
    metric          TEXT DEFAULT 'all',
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alert_thresholds (
    id              TEXT PRIMARY KEY,
    dataset_id      TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    metric          TEXT NOT NULL CHECK(metric IN ('nps','csat','ces','response_volume','negative_rate')),
    operator        TEXT NOT NULL CHECK(operator IN ('below','above')),
    threshold       REAL NOT NULL,
    severity        TEXT DEFAULT 'warning' CHECK(severity IN ('warning','critical')),
    label           TEXT NOT NULL,
    active          INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_insights (
    id              TEXT PRIMARY KEY,
    dataset_id      TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    period          TEXT NOT NULL,
    type            TEXT NOT NULL CHECK(type IN ('summary','priorities','recommendations','themes')),
    content         TEXT NOT NULL,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_cache (
    cache_key       TEXT PRIMARY KEY,
    response        TEXT NOT NULL,
    created_at      TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
