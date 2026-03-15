const db = require('../config/db');

/**
 * Get test history for a user with topic breakdown.
 * Uses existing tests table + topic breakdown from user_answers (or test_topic_breakdown if populated).
 */
async function getTestHistory(userId, limit = 50, offset = 0) {
  const testsResult = await db.query(
    `SELECT id, total_score, accuracy_percentage, total_time, created_at
     FROM tests
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const tests = testsResult.rows;
  if (tests.length === 0) {
    return { tests: [], total: 0 };
  }

  const totalResult = await db.query(
    'SELECT COUNT(*) AS total FROM tests WHERE user_id = $1',
    [userId]
  );
  const total = Number(totalResult.rows[0].total);

  const topicBreakdownByTest = await db.query(
    `SELECT
       ua.test_id,
       t.id AS topic_id,
       t.name AS topic_name,
       COUNT(*) AS questions_count,
       SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) AS correct_count,
       ROUND(
         (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 2
       ) AS accuracy_percentage
     FROM user_answers ua
     JOIN questions q ON ua.question_id = q.id
     JOIN topics t ON q.topic_id = t.id
     WHERE ua.test_id = ANY($1::int[])
     GROUP BY ua.test_id, t.id, t.name`,
    [tests.map((t) => t.id)]
  );

  const breakdownMap = new Map();
  for (const row of topicBreakdownByTest.rows) {
    if (!breakdownMap.has(row.test_id)) breakdownMap.set(row.test_id, []);
    breakdownMap.get(row.test_id).push({
      topic_id: row.topic_id,
      topic_name: row.topic_name,
      questions_count: Number(row.questions_count),
      correct_count: Number(row.correct_count),
      accuracy_percentage: Number(row.accuracy_percentage)
    });
  }

  const testsWithBreakdown = tests.map((t) => ({
    test_id: t.id,
    score: Number(t.total_score),
    accuracy_percentage: Number(t.accuracy_percentage),
    time_taken_seconds: Number(t.total_time),
    created_at: t.created_at,
    topic_breakdown: breakdownMap.get(t.id) || []
  }));

  return { tests: testsWithBreakdown, total };
}

/**
 * Insert test_topic_breakdown for a test (optional cache for faster history).
 */
async function insertTestTopicBreakdown(testId, topicBreakdown) {
  if (!topicBreakdown || topicBreakdown.length === 0) return;

  const values = [];
  const placeholders = [];
  topicBreakdown.forEach((row, i) => {
    const base = i * 5;
    values.push(testId, row.topic_id, row.questions_count, row.correct_count, row.accuracy_percentage);
    placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
  });

  await db.query(
    `INSERT INTO test_topic_breakdown (test_id, topic_id, questions_count, correct_count, accuracy_percentage)
     VALUES ${placeholders.join(', ')}
     ON CONFLICT (test_id, topic_id) DO UPDATE SET
       questions_count = EXCLUDED.questions_count,
       correct_count = EXCLUDED.correct_count,
       accuracy_percentage = EXCLUDED.accuracy_percentage`,
    values
  );
}

module.exports = {
  getTestHistory,
  insertTestTopicBreakdown
};
