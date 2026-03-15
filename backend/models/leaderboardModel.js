const db = require('../config/db');

async function getFriendsWithStatus(userId, status = 'accepted') {
  const result = await db.query(
    `SELECT uf.friend_id AS user_id, u.name, u.email, uf.status, uf.created_at
     FROM user_friends uf
     JOIN users u ON u.id = uf.friend_id
     WHERE uf.user_id = $1 AND uf.status = $2
     UNION
     SELECT uf.user_id, u.name, u.email, uf.status, uf.created_at
     FROM user_friends uf
     JOIN users u ON u.id = uf.user_id
     WHERE uf.friend_id = $1 AND uf.status = $2`,
    [userId, status]
  );
  return result.rows;
}

async function getFriendIds(userId) {
  const rows = await getFriendsWithStatus(userId);
  const ids = rows.map((r) => r.user_id);
  return [...new Set([userId, ...ids])];
}

async function sendFriendRequest(userId, friendId) {
  if (userId === friendId) return null;
  const result = await db.query(
    `INSERT INTO user_friends (user_id, friend_id, status) VALUES ($1, $2, 'pending')
     ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'pending'
     RETURNING *`,
    [userId, friendId]
  );
  return result.rows[0];
}

async function acceptFriendRequest(userId, friendId) {
  const result = await db.query(
    `UPDATE user_friends SET status = 'accepted'
     WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)) AND status = 'pending'
     RETURNING *`,
    [userId, friendId]
  );
  return result.rows[0];
}

async function getStreak(userId) {
  const result = await db.query(
    'SELECT * FROM user_streaks WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function upsertStreak(userId, newStreakCount, lastActivityDate) {
  const result = await db.query(
    `INSERT INTO user_streaks (user_id, streak_count, last_activity_date, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       streak_count = EXCLUDED.streak_count,
       last_activity_date = EXCLUDED.last_activity_date,
       updated_at = NOW()
     RETURNING *`,
    [userId, newStreakCount, lastActivityDate]
  );
  return result.rows[0];
}

/**
 * Leaderboard: users with total score, accuracy, avg time, streak.
 * If friendIds provided, filter to those users; else all users (or top N).
 */
async function getLeaderboard(options = {}) {
  const { friendIds = null, limit = 50 } = options;

  const result = await db.query(
    `WITH user_stats AS (
       SELECT
         t.user_id,
         COUNT(DISTINCT t.id) AS total_tests,
         COALESCE(SUM(t.total_score), 0) AS total_score,
         COALESCE(AVG(t.accuracy_percentage), 0) AS avg_accuracy,
         COALESCE(AVG(t.total_time), 0) AS avg_time_seconds
       FROM tests t
       GROUP BY t.user_id
     ),
     with_streaks AS (
       SELECT us.*, u.name, u.email, COALESCE(st.streak_count, 0) AS streak_count
       FROM user_stats us
       JOIN users u ON u.id = us.user_id
       LEFT JOIN user_streaks st ON st.user_id = us.user_id
     )
     SELECT * FROM with_streaks
     ${friendIds && friendIds.length > 0 ? 'WHERE user_id = ANY($1::int[])' : ''}
     ORDER BY total_score DESC, avg_accuracy DESC, streak_count DESC
     LIMIT $${friendIds && friendIds.length > 0 ? 2 : 1}`,
    friendIds && friendIds.length > 0 ? [friendIds, limit] : [limit]
  );

  return result.rows.map((r, index) => ({
    rank: index + 1,
    user_id: r.user_id,
    name: r.name,
    email: r.email,
    total_score: Number(r.total_score),
    avg_accuracy: Number(Number(r.avg_accuracy).toFixed(2)),
    avg_time_seconds: Number(Number(r.avg_time_seconds).toFixed(0)),
    streak_count: Number(r.streak_count),
    total_tests: Number(r.total_tests)
  }));
}

module.exports = {
  getFriendsWithStatus,
  getFriendIds,
  sendFriendRequest,
  acceptFriendRequest,
  getStreak,
  upsertStreak,
  getLeaderboard
};
