-- ================= ADVANCED FEATURES MIGRATION =================
-- Safe to run multiple times

-- ===============================================================
-- 1️⃣ Extend user_answers (Cognitive Engine)
-- ===============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_answers' AND column_name='time_taken_seconds'
  ) THEN
    ALTER TABLE user_answers ADD COLUMN time_taken_seconds INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_answers' AND column_name='confidence_level'
  ) THEN
    ALTER TABLE user_answers
    ADD COLUMN confidence_level SMALLINT
    CHECK (confidence_level BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_answers' AND column_name='attempt_type'
  ) THEN
    ALTER TABLE user_answers ADD COLUMN attempt_type VARCHAR(50);
  END IF;
END $$;

-- ===============================================================
-- 2️⃣ Test Topic Breakdown
-- ===============================================================

CREATE TABLE IF NOT EXISTS test_topic_breakdown (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  questions_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  accuracy_percentage NUMERIC(5,2) NOT NULL,
  UNIQUE(test_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_test_topic_breakdown_test
ON test_topic_breakdown(test_id);

-- ===============================================================
-- 3️⃣ User Cognitive Profile
-- ===============================================================

CREATE TABLE IF NOT EXISTS user_cognitive_profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  avg_speed NUMERIC(10,2),
  accuracy NUMERIC(5,2),
  guessing_index NUMERIC(5,2),
  overthinking_index NUMERIC(5,2),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cognitive_user
ON user_cognitive_profile(user_id);

-- ===============================================================
-- 4️⃣ Collaboration System
-- ===============================================================

CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id SERIAL PRIMARY KEY,
  host_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  invite_code VARCHAR(32) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active','ended','cancelled')),
  question_ids INTEGER[],
  time_limit_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_participants (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score INTEGER DEFAULT 0,
  answers_correct INTEGER DEFAULT 0,
  UNIQUE(session_id,user_id)
);

CREATE TABLE IF NOT EXISTS session_invites (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_collab_host
ON collaboration_sessions(host_user_id);

CREATE INDEX IF NOT EXISTS idx_collab_invite
ON collaboration_sessions(invite_code);

CREATE INDEX IF NOT EXISTS idx_collab_participants
ON session_participants(session_id);

-- ===============================================================
-- 5️⃣ Friends System
-- ===============================================================

CREATE TABLE IF NOT EXISTS user_friends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'accepted'
    CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,friend_id),
  CHECK (user_id <> friend_id)
);

CREATE INDEX IF NOT EXISTS idx_user_friends_user
ON user_friends(user_id);

CREATE INDEX IF NOT EXISTS idx_user_friends_friend
ON user_friends(friend_id);

-- ===============================================================
-- 6️⃣ Streak System
-- ===============================================================

CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  streak_count INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_streaks
ON user_streaks(user_id);

-- ===============================================================
-- 7️⃣ Practice Modes
-- ===============================================================

CREATE TABLE IF NOT EXISTS practice_modes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  question_count INTEGER NOT NULL,
  time_limit_seconds INTEGER NOT NULL,
  difficulty_mix JSONB DEFAULT '{}',
  description TEXT
);

INSERT INTO practice_modes
(name,slug,question_count,time_limit_seconds,difficulty_mix,description)
VALUES
('Speed Mode','speed',10,300,'{"easy":0.5,"medium":0.4,"hard":0.1}','Quick speed practice'),
('Deep Thinking Mode','deep-thinking',5,900,'{"easy":0.2,"medium":0.3,"hard":0.5}','Complex reasoning'),
('Interview Simulation','interview',15,1200,'{"easy":0.2,"medium":0.5,"hard":0.3}','Simulated interviews')
ON CONFLICT (slug) DO NOTHING;

-- ===============================================================
-- 8️⃣ Company Patterns
-- ===============================================================

CREATE TABLE IF NOT EXISTS company_patterns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  topic_distribution JSONB DEFAULT '{}',
  difficulty_levels JSONB DEFAULT '[]',
  time_limit_seconds INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  description TEXT
);

INSERT INTO company_patterns
(name,slug,topic_distribution,difficulty_levels,time_limit_seconds,question_count,description)
VALUES
('Amazon','amazon','{"Logical":0.35,"Quant":0.35,"Verbal":0.2,"Pattern":0.1}','["easy","medium","hard"]',3600,20,'Amazon aptitude pattern'),
('TCS','tcs','{"Quant":0.4,"Verbal":0.3,"Logical":0.3}','["easy","medium"]',2700,25,'TCS Ninja pattern'),
('Infosys','infosys','{"Logical":0.4,"Quant":0.35,"Verbal":0.25}','["easy","medium","hard"]',3000,20,'Infosys aptitude pattern')
ON CONFLICT (slug) DO NOTHING;

-- ===============================================================
-- 9️⃣ Performance Indexes
-- ===============================================================

CREATE INDEX IF NOT EXISTS idx_user_answers_question
ON user_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_tests_user_created
ON tests(user_id,created_at DESC);

CREATE INDEX IF NOT EXISTS idx_questions_topic_diff
ON questions(topic_id,difficulty);
