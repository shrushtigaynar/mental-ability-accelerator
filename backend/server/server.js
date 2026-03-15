require('dotenv').config();
require('../migrate');

const http = require('http');
const { Server: SocketServer } = require('socket.io');
const app = require('./app');
const { attachCollaborationSocket } = require('./collaborationSocket');
const pool = require('../config/db');

const PORT = process.env.PORT || 4000;

// Create friendships table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
  )
`).catch(console.error);

// Create pending_invites table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS pending_invites (
    id SERIAL PRIMARY KEY,
    inviter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

// Create user_daily_focus table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS user_daily_focus (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    focus_topic VARCHAR(100) NOT NULL,
    focus_minutes INTEGER DEFAULT 30,
    focus_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, focus_date)
  )
`).catch(console.error);

// Add focus_minutes column if table already exists
pool.query(`
  ALTER TABLE user_daily_focus 
  ADD COLUMN IF NOT EXISTS focus_minutes INTEGER DEFAULT 30
`).catch(console.error);

// Update practice_modes question_count to allow more questions per session
pool.query(`
  UPDATE practice_modes SET question_count = 100 
  WHERE slug IN ('speed', 'deep-thinking', 'interview')
`).catch(console.error);

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] }
});

attachCollaborationSocket(io);

app.set('io', io);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Mental Ability Accelerator API running on port ${PORT} (HTTP + WebSocket)`);
});
