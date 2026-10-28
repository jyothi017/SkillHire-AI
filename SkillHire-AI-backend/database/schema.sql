CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  role VARCHAR(120) NOT NULL,
  skill VARCHAR(120) NOT NULL,
  question_text TEXT NOT NULL,
  difficulty CHAR(1) NOT NULL CHECK (difficulty IN ('B', 'I', 'A')),
  question_type VARCHAR(40) NOT NULL DEFAULT 'Technical',
  expected_points TEXT[] NOT NULL DEFAULT '{}',
  source VARCHAR(40) NOT NULL DEFAULT 'User',
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id BIGSERIAL PRIMARY KEY,
  role VARCHAR(120) NOT NULL,
  experience_level VARCHAR(10) NOT NULL DEFAULT 'F',
  skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_questions (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  skill VARCHAR(120) NOT NULL,
  difficulty CHAR(1) NOT NULL DEFAULT 'I' CHECK (difficulty IN ('B', 'I', 'A')),
  question_type VARCHAR(40) NOT NULL DEFAULT 'Technical',
  expected_points TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_results (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  session_question_id BIGINT NOT NULL REFERENCES session_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL DEFAULT '',
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, session_question_id)
);

CREATE INDEX IF NOT EXISTS idx_questions_skill ON questions(skill);
CREATE INDEX IF NOT EXISTS idx_questions_approved ON questions(approved);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON interview_sessions(created_at DESC);
