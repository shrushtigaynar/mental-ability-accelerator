const db = require('../config/db');

/**
 * Get question IDs already attempted by user (for exclusion in recommendations).
 */
async function getAttemptedQuestionIds(userId, limit = 2000) {
  const result = await db.query(
    `SELECT DISTINCT ua.question_id
     FROM user_answers ua
     JOIN tests t ON ua.test_id = t.id
     WHERE t.user_id = $1
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map((r) => r.question_id);
}

/**
 * Get questions by topic and difficulty with optional exclusion list.
 */
async function getQuestionsByTopicAndDifficulty(options) {
  const { topicIds, difficultyMix, excludeQuestionIds = [], limit = 20, topicName, specificDifficulty } = options;

  let whereClause = '1=1';
  const params = [];
  let paramIndex = 1;

  // Handle topic name filtering (takes precedence over topicIds)
  if (topicName) {
    params.push(topicName);
    whereClause += ` AND t.name ILIKE $${paramIndex}`;
    paramIndex++;
  } else if (topicIds && topicIds.length > 0) {
    params.push(topicIds);
    whereClause += ` AND q.topic_id = ANY($${paramIndex}::int[])`;
    paramIndex++;
  }
  // else: no topic filter = all topics

  // Handle specific difficulty filtering
  if (specificDifficulty) {
    params.push(specificDifficulty);
    whereClause += ` AND q.difficulty = $${paramIndex}`;
    paramIndex++;
  }

  if (excludeQuestionIds.length > 0) {
    params.push(excludeQuestionIds);
    whereClause += ` AND q.id != ALL($${paramIndex}::int[])`;
    paramIndex++;
  }

  params.push(limit);

  const result = await db.query(
    `SELECT 
       q.id,
       q.topic_id,
       q.question_text,
       q.option_a,
       q.option_b,
       q.option_c,
       q.option_d,
       TRIM(q.correct_option) as correct_option,
       TRIM(q.correct_option) as correct_answer,
       q.difficulty,
       t.name AS topic_name
     FROM questions q
     JOIN topics t ON q.topic_id = t.id
     WHERE ${whereClause}
     ORDER BY RANDOM()
     LIMIT $${paramIndex}`,
    params
  );

  return result.rows;
}

/**
 * Get all practice modes.
 */
async function getPracticeModes() {
  const result = await db.query(
    'SELECT id, name, slug, question_count, time_limit_seconds, difficulty_mix, description FROM practice_modes ORDER BY id'
  );
  return result.rows;
}

/**
 * Get practice mode by slug.
 */
async function getPracticeModeBySlug(slug) {
  const result = await db.query(
    'SELECT * FROM practice_modes WHERE slug = $1',
    [slug]
  );
  return result.rows[0] || null;
}

/**
 * Get all company patterns.
 */
async function getCompanyPatterns() {
  const result = await db.query(
    'SELECT id, name, slug, topic_distribution, difficulty_levels, time_limit_seconds, question_count, description FROM company_patterns ORDER BY id'
  );
  return result.rows;
}

/**
 * Get company pattern by slug.
 */
async function getCompanyPatternBySlug(slug) {
  const result = await db.query(
    'SELECT * FROM company_patterns WHERE slug = $1',
    [slug]
  );
  return result.rows[0] || null;
}

/**
 * Get topic IDs by names (for company pattern topic_distribution).
 */
async function getTopicIdsByNames(names) {
  if (!names || names.length === 0) return [];
  const result = await db.query(
    'SELECT id, name FROM topics WHERE name = ANY($1::text[])',
    [names]
  );
  return result.rows;
}

/**
 * Get questions for company pattern: weighted by topic distribution and difficulty.
 */
async function getQuestionsForCompanyPattern(pattern, excludeQuestionIds = []) {
  const topicDist = pattern.topic_distribution || {};
  const topicNames = Object.keys(topicDist);
  const difficulties = Array.isArray(pattern.difficulty_levels) ? pattern.difficulty_levels : ['easy', 'medium', 'hard'];
  const totalCount = pattern.question_count || 20;

  if (topicNames.length === 0) {
    const res = await db.query(
      `SELECT id FROM questions WHERE difficulty = ANY($1::text[]) AND id != ALL($2::int[])
       ORDER BY RANDOM() LIMIT $3`,
      [difficulties, excludeQuestionIds, totalCount]
    );
    return getQuestionsByIds(res.rows.map((r) => r.id));
  }

  const topicsResult = await db.query(
    'SELECT id, name FROM topics WHERE name = ANY($1::text[])',
    [topicNames]
  );
  const topicIdByName = new Map(topicsResult.rows.map((r) => [r.name, r.id]));

  const allQuestionIds = [];
  for (const [name, weight] of Object.entries(topicDist)) {
    const topicId = topicIdByName.get(name);
    if (!topicId) continue;
    const count = Math.max(1, Math.round(totalCount * weight));
    const res = await db.query(
      `SELECT id FROM questions
       WHERE topic_id = $1 AND difficulty = ANY($2::text[]) AND id != ALL($3::int[])
       ORDER BY RANDOM() LIMIT $4`,
      [topicId, difficulties, excludeQuestionIds, count]
    );
    allQuestionIds.push(...res.rows.map((r) => r.id));
  }

  const shuffled = allQuestionIds.sort(() => Math.random() - 0.5).slice(0, totalCount);
  return getQuestionsByIds(shuffled);
}

async function getQuestionsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const result = await db.query(
    `SELECT q.*, t.name AS topic_name FROM questions q JOIN topics t ON q.topic_id = t.id WHERE q.id = ANY($1::int[])`,
    [ids]
  );
  return result.rows;
}

module.exports = {
  getAttemptedQuestionIds,
  getQuestionsByTopicAndDifficulty,
  getPracticeModes,
  getPracticeModeBySlug,
  getCompanyPatterns,
  getCompanyPatternBySlug,
  getTopicIdsByNames,
  getQuestionsForCompanyPattern,
  getQuestionsByIds
};
