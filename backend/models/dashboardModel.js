const db = require('../config/db');

/**
 * Get user statistics for dashboard
 */
async function getUserStats(userId) {
  const result = await db.query(
    `SELECT 
       COUNT(DISTINCT ts.id) AS total_tests,
       ROUND(AVG(
         CASE 
           WHEN COUNT(ua.id) = 0 THEN 0
           ELSE (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(ua.id)::numeric) * 100
         END
       ), 2) AS avg_accuracy,
       ROUND(AVG(
         CASE 
           WHEN COUNT(ua.id) = 0 THEN 0
           ELSE (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(ua.id)::numeric)
         END
       ), 2) AS avg_score
     FROM tests ts
     LEFT JOIN user_answers ua ON ts.id = ua.test_id
     WHERE ts.user_id = $1`,
    [userId]
  );
  
  return result.rows[0] || {};
}

/**
 * Get user stats for dashboard /stats endpoint
 */
async function getUserStatsForDashboard(userId) {
  const result = await db.query(
    `SELECT 
       COUNT(*) as total_tests, 
       AVG(accuracy_percentage) as avg_accuracy,
       MAX(created_at) as last_session
     FROM tests 
     WHERE user_id = $1`,
    [userId]
  );
  
  return result.rows[0] || {};
}

module.exports = {
  getUserStats,
  getUserStatsForDashboard
};
