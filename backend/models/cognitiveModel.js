const db = require('../config/db');

/** Use time_taken_seconds if set, else time_spent */
const TIME_COL = `COALESCE(ua.time_taken_seconds, ua.time_spent)`;

/**
 * Get raw answer stats for cognitive analysis (speed, correctness, confidence).
 */
async function getAnswerStatsForUser(userId, limit = 500) {
  const result = await db.query(
    `SELECT
       ua.id,
       ua.question_id,
       ua.is_correct,
       ${TIME_COL} AS time_seconds,
       ua.confidence_level,
       ua.attempt_type
     FROM user_answers ua
     JOIN tests t ON ua.test_id = t.id
     WHERE t.user_id = $1
     ORDER BY ua.id DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

/**
 * Upsert user cognitive profile.
 */
async function upsertCognitiveProfile(userId, profile) {
  const {
    avg_speed,
    accuracy,
    guessing_index,
    overthinking_index
  } = profile;

  const result = await db.query(
    `INSERT INTO user_cognitive_profile (user_id, avg_speed, accuracy, guessing_index, overthinking_index, last_updated)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       avg_speed = EXCLUDED.avg_speed,
       accuracy = EXCLUDED.accuracy,
       guessing_index = EXCLUDED.guessing_index,
       overthinking_index = EXCLUDED.overthinking_index,
       last_updated = NOW()
     RETURNING *`,
    [userId, avg_speed ?? null, accuracy ?? null, guessing_index ?? null, overthinking_index ?? null]
  );
  return result.rows[0];
}

/**
 * Get cognitive profile by user id.
 */
async function getCognitiveProfile(userId) {
  const result = await db.query(
    `SELECT * FROM user_cognitive_profile WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAnswerStatsForUser,
  upsertCognitiveProfile,
  getCognitiveProfile
};
