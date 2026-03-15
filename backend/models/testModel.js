const db = require('../config/db');

async function createTest({ userId, totalScore, accuracyPercentage, totalTime }) {
  const result = await db.query(
    `INSERT INTO tests (user_id, total_score, accuracy_percentage, total_time)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, totalScore, accuracyPercentage, totalTime]
  );
  return result.rows[0];
}

async function insertUserAnswers(testId, answers) {
  const hasCognitive = answers.some((a) => a.confidenceLevel != null || a.attemptType != null);
  const cols = hasCognitive
    ? 'test_id, question_id, selected_option, is_correct, time_spent, time_taken_seconds, confidence_level, attempt_type'
    : 'test_id, question_id, selected_option, is_correct, time_spent';

  const values = [];
  const placeholders = [];
  const stride = hasCognitive ? 8 : 5;

  answers.forEach((answer, index) => {
    const base = index * stride;
    const timeTaken = answer.timeTakenSeconds != null ? answer.timeTakenSeconds : answer.timeSpent;
    if (hasCognitive) {
      values.push(
        testId,
        answer.questionId,
        answer.selectedOption,
        answer.isCorrect,
        answer.timeSpent,
        timeTaken,
        answer.confidenceLevel ?? null,
        answer.attemptType ?? null
      );
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`
      );
    } else {
      values.push(testId, answer.questionId, answer.selectedOption, answer.isCorrect, answer.timeSpent);
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
    }
  });

  if (hasCognitive) {
    await db.query(
      `INSERT INTO user_answers (test_id, question_id, selected_option, is_correct, time_spent, time_taken_seconds, confidence_level, attempt_type)
       VALUES ${placeholders.join(', ')}`,
      values
    );
  } else {
    await db.query(
      `INSERT INTO user_answers (test_id, question_id, selected_option, is_correct, time_spent)
       VALUES ${placeholders.join(', ')}`,
      values
    );
    await db.query(
      `UPDATE user_answers SET time_taken_seconds = time_spent WHERE test_id = $1 AND time_taken_seconds IS NULL`,
      [testId]
    );
  }
}

async function getTopicWiseAccuracyForTest(testId) {
  const result = await db.query(
    `SELECT t.id AS topic_id,
            t.name AS topic_name,
            COUNT(*) AS total_questions,
            SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) AS correct_answers,
            ROUND(
              CASE WHEN COUNT(*) = 0 THEN 0
                   ELSE (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100
              END, 2
            ) AS accuracy_percentage
     FROM user_answers ua
     JOIN questions q ON ua.question_id = q.id
     JOIN topics t ON q.topic_id = t.id
     WHERE ua.test_id = $1
     GROUP BY t.id, t.name
     ORDER BY t.name`,
    [testId]
  );

  return result.rows;
}

/* ================= DASHBOARD FUNCTION ================= */

async function getUserDashboard(userId) {

  const testStats = await db.query(
    `SELECT 
        COUNT(*) AS total_tests,
        AVG(accuracy_percentage) AS average_accuracy,
        MAX(total_score) AS best_score
     FROM tests
     WHERE user_id = $1`,
    [userId]
  );

  const questionStats = await db.query(
    `SELECT COUNT(*) AS total_questions
     FROM user_answers ua
     JOIN tests t ON ua.test_id = t.id
     WHERE t.user_id = $1`,
    [userId]
  );

  return {
    totalTests: Number(testStats.rows[0].total_tests || 0),
    averageAccuracy: Number(testStats.rows[0].average_accuracy || 0),
    bestScore: Number(testStats.rows[0].best_score || 0),
    totalQuestionsSolved: Number(questionStats.rows[0].total_questions || 0)
  };
}

module.exports = {
  createTest,
  insertUserAnswers,
  getTopicWiseAccuracyForTest,
  getUserDashboard
};
