CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  difficulty TEXT,
  current_level INTEGER DEFAULT 0,
  completed_levels TEXT DEFAULT '[]',
  last_played DATETIME,
  UNIQUE(user_id, category, difficulty)
);

CREATE TABLE IF NOT EXISTS idioms_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idiom_urdu TEXT NOT NULL,
  idiom_roman TEXT NOT NULL,
  correct_meaning TEXT NOT NULL,
  distractor_1 TEXT NOT NULL,
  distractor_2 TEXT NOT NULL,
  distractor_3 TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  image_path TEXT
);

CREATE TABLE IF NOT EXISTS wordsearch_wordlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_urdu TEXT NOT NULL,
  word_meaning TEXT NOT NULL,
  difficulty TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS poetry_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  couplet_urdu TEXT NOT NULL,
  couplet_roman TEXT NOT NULL,
  poet_name TEXT NOT NULL,
  poem_title TEXT,
  word_breakdown TEXT NOT NULL,
  overall_meaning TEXT NOT NULL,
  tashri TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_idioms_difficulty ON idioms_content(difficulty);
CREATE INDEX IF NOT EXISTS idx_wordsearch_difficulty ON wordsearch_wordlists(difficulty);
