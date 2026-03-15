const db = require('../config/db');

/**
 * Topic-wise performance for a user (all-time from user_answers).
 * Used by Weak Topic Detection Engine.
 */
async function getTopicWisePerformance(userId) {
  const result = await db.query(
    `SELECT
       t.id AS topic_id,
       t.name AS topic_name,
       COUNT(*) AS total_attempts,
       SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) AS correct_count,
       ROUND(
         CASE WHEN COUNT(*) = 0 THEN 0
              ELSE (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100
         END, 2
       ) AS accuracy_percentage,
       SUM(CASE WHEN ua.is_correct THEN 0 ELSE 1 END) AS mistake_count
     FROM user_answers ua
     JOIN tests ts ON ua.test_id = ts.id
     JOIN questions q ON ua.question_id = q.id
     JOIN topics t ON q.topic_id = t.id
     WHERE ts.user_id = $1
     GROUP BY t.id, t.name
     ORDER BY accuracy_percentage ASC NULLS LAST, mistake_count DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Mistake frequency per topic (mistakes per attempt).
 */
async function getTopicMistakeFrequency(userId) {
  const rows = await getTopicWisePerformance(userId);
  return rows.map((r) => ({
    topic_id: r.topic_id,
    topic_name: r.topic_name,
    total_attempts: Number(r.total_attempts),
    mistake_count: Number(r.mistake_count),
    mistake_frequency: r.total_attempts > 0 ? (r.mistake_count / r.total_attempts) : 0,
    accuracy_percentage: Number(r.accuracy_percentage)
  }));
}

module.exports = {
  getTopicWisePerformance,
  getTopicMistakeFrequency
};
