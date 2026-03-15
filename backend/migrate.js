const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  console.log('Running migrations...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), subscription_status VARCHAR(50) DEFAULT 'free', role VARCHAR(20) DEFAULT 'student', created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS practice_modes (id SERIAL PRIMARY KEY, name VARCHAR(255), slug VARCHAR(100) UNIQUE, question_count INTEGER DEFAULT 100, time_limit_seconds INTEGER);
    CREATE TABLE IF NOT EXISTS topics (id SERIAL PRIMARY KEY, name VARCHAR(255), mode_id INTEGER);
    CREATE TABLE IF NOT EXISTS questions (id SERIAL PRIMARY KEY, topic_id INTEGER, question_text TEXT, option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT, correct_option CHAR(1), difficulty VARCHAR(50), solution_text TEXT, shortcut_text TEXT);
    CREATE TABLE IF NOT EXISTS tests (id SERIAL PRIMARY KEY, user_id INTEGER, mode VARCHAR(100), accuracy_percentage DECIMAL(5,2), total_questions INTEGER, correct_answers INTEGER, time_taken INTEGER, created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS user_answers (id SERIAL PRIMARY KEY, test_id INTEGER, question_id INTEGER, selected_option CHAR(1), is_correct BOOLEAN, time_taken_seconds INTEGER);
    CREATE TABLE IF NOT EXISTS friendships (id SERIAL PRIMARY KEY, user_id INTEGER, friend_id INTEGER, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS pending_invites (id SERIAL PRIMARY KEY, inviter_id INTEGER, invited_email VARCHAR(255), created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS user_daily_focus (id SERIAL PRIMARY KEY, user_id INTEGER, focus_topic VARCHAR(255), focus_minutes INTEGER, focus_date DATE DEFAULT CURRENT_DATE, UNIQUE(user_id, focus_date));
    INSERT INTO practice_modes (name, slug, question_count) VALUES ('Speed Mode', 'speed', 100), ('Deep Thinking', 'deep-thinking', 100), ('Interview Simulation', 'interview', 100) ON CONFLICT (slug) DO NOTHING;
    INSERT INTO topics (name, mode_id) VALUES ('Percentages', 1), ('Profit & Loss', 1), ('Time & Work', 1), ('Time, Speed & Distance', 1), ('Ratio & Proportion', 1), ('Number Series', 2), ('Missing Number Pattern', 2), ('Alphabet Series', 2), ('Analogy', 2), ('Odd One Out', 2), ('Blood Relations', 3), ('Coding-Decoding', 3), ('Direction Sense', 3), ('Syllogisms', 3), ('Statement & Conclusion', 3) ON CONFLICT DO NOTHING;
  `);
  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(e => { console.error(e.message); process.exit(1); });