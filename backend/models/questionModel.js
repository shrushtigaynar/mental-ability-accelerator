const db = require('../config/db');

async function getRandomQuestions(limit = 20) {
  const result = await db.query(
    `SELECT q.*, t.name AS topic_name
     FROM questions q
     JOIN topics t ON q.topic_id = t.id
     ORDER BY RANDOM()
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getQuestionsByIds(ids) {
  const result = await db.query(
    `SELECT q.*, t.name AS topic_name
     FROM questions q
     JOIN topics t ON q.topic_id = t.id
     WHERE q.id = ANY($1::int[])`,
    [ids]
  );
  return result.rows;
}

module.exports = {
  getRandomQuestions,
  getQuestionsByIds
};

