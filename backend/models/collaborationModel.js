const db = require('../config/db');
const crypto = require('crypto');

function generateInviteCode() {
  return crypto.randomBytes(16).toString('hex');
}

function generateInviteToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function createSession(hostUserId, options = {}) {
  const inviteCode = generateInviteCode();
  const { questionIds = [], timeLimitSeconds = 1800 } = options;

  const result = await db.query(
    `INSERT INTO collaboration_sessions (host_user_id, invite_code, question_ids, time_limit_seconds, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING *`,
    [hostUserId, inviteCode, questionIds, timeLimitSeconds]
  );
  const session = result.rows[0];
  await db.query(
    `INSERT INTO collaboration_participants (session_id, user_id) VALUES ($1, $2)`,
    [session.id, hostUserId]
  );
  return session;
}

async function getSessionById(sessionId) {
  const result = await db.query(
    `SELECT s.*, u.name AS host_name, u.email AS host_email
     FROM collaboration_sessions s
     JOIN users u ON s.host_user_id = u.id
     WHERE s.id = $1`,
    [sessionId]
  );
  return result.rows[0] || null;
}

async function getSessionByInviteCode(inviteCode) {
  const result = await db.query(
    `SELECT s.*, u.name AS host_name FROM collaboration_sessions s
     JOIN users u ON s.host_user_id = u.id
     WHERE s.invite_code = $1 AND s.status = 'active'`,
    [inviteCode]
  );
  return result.rows[0] || null;
}

async function createInvite(sessionId, email, expiresInMinutes = 60) {
  const token = generateInviteToken();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  await db.query(
    `INSERT INTO collaboration_invites (session_id, email, token, expires_at) VALUES ($1, $2, $3, $4)`,
    [sessionId, email.toLowerCase(), token, expiresAt]
  );
  return { token, expiresAt };
}

async function getInviteByToken(token) {
  const result = await db.query(
    `SELECT i.*, s.host_user_id, s.invite_code, s.status AS session_status
     FROM collaboration_invites i
     JOIN collaboration_sessions s ON i.session_id = s.id
     WHERE i.token = $1 AND i.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
}

async function addParticipant(sessionId, userId) {
  await db.query(
    `INSERT INTO collaboration_participants (session_id, user_id) VALUES ($1, $2)
     ON CONFLICT (session_id, user_id) DO NOTHING
     RETURNING id`,
    [sessionId, userId]
  );
  const result = await db.query(
    `SELECT * FROM collaboration_participants WHERE session_id = $1 AND user_id = $2`,
    [sessionId, userId]
  );
  return result.rows[0];
}

async function getParticipants(sessionId) {
  const result = await db.query(
    `SELECT p.*, u.name, u.email FROM collaboration_participants p
     JOIN users u ON p.user_id = u.id
     WHERE p.session_id = $1 ORDER BY p.joined_at`,
    [sessionId]
  );
  return result.rows;
}

async function updateParticipantScore(sessionId, userId, score, answersCorrect) {
  await db.query(
    `UPDATE collaboration_participants SET score = $3, answers_correct = $4
     WHERE session_id = $1 AND user_id = $2`,
    [sessionId, userId, score, answersCorrect]
  );
}

async function endSession(sessionId) {
  await db.query(
    `UPDATE collaboration_sessions SET status = 'ended', ended_at = NOW() WHERE id = $1`,
    [sessionId]
  );
}

async function getActiveSessionsForUser(userId) {
  const result = await db.query(
    `SELECT s.* FROM collaboration_sessions s
     JOIN collaboration_participants p ON p.session_id = s.id
     WHERE p.user_id = $1 AND s.status = 'active' ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = {
  createSession,
  getSessionById,
  getSessionByInviteCode,
  createInvite,
  getInviteByToken,
  addParticipant,
  getParticipants,
  updateParticipantScore,
  endSession,
  getActiveSessionsForUser,
  generateInviteCode
};
