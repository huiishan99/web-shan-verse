CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  thread_key TEXT NOT NULL CHECK (length(thread_key) BETWEEN 1 AND 120),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 40),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh', 'ja')),
  author_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS comments_thread_created_idx
  ON comments (thread_key, created_at, id);

CREATE INDEX IF NOT EXISTS comments_author_created_idx
  ON comments (author_hash, created_at);
