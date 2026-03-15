const { getWeakTopics } = require('./weakTopicService');
const { getCognitiveProfile } = require('../models/cognitiveModel');
const {
  getAttemptedQuestionIds,
  getQuestionsByTopicAndDifficulty,
  getPracticeModeBySlug,
  getQuestionsByIds
} = require('../models/practiceModel');

/** Default difficulty mix: more medium, then easy/hard */
const DEFAULT_MIX = { easy: 0.3, medium: 0.5, hard: 0.2 };

/**
 * Adaptive Difficulty: map user level to difficulty mix.
 * strong → harder, struggling → easier, weak topic → moderate.
 */
function getAdaptiveDifficultyMix(userLevel) {
  if (userLevel === 'strong') return { easy: 0.1, medium: 0.3, hard: 0.6 };
  if (userLevel === 'struggling') return { easy: 0.6, medium: 0.3, hard: 0.1 };
  return DEFAULT_MIX; // moderate
}

/**
 * Derive user level from cognitive profile and recent performance.
 */
async function getUserLevel(userId) {
  const profile = await getCognitiveProfile(userId);
  if (!profile) return 'moderate';
  const acc = Number(profile.accuracy);
  const guess = Number(profile.guessing_index || 0);
  const over = Number(profile.overthinking_index || 0);
  if (acc >= 75 && guess < 0.2) return 'strong';
  if (acc < 50 || guess > 0.4 || over > 0.5) return 'struggling';
  return 'moderate';
}

/**
 * AI Practice Recommendation Engine.
 * Suggests questions based on weak topics, difficulty, recent performance, and attempt history.
 */
async function getRecommendations(userId, options = {}) {
  const { limit = 20, modeSlug = null } = options;

  const weakTopics = await getWeakTopics(userId, 5);
  const weakTopicIds = weakTopics.map((t) => t.topic_id);
  const attemptedIds = await getAttemptedQuestionIds(userId);
  const userLevel = await getUserLevel(userId);
  const difficultyMix = getAdaptiveDifficultyMix(userLevel);

  let topicIds = weakTopicIds;
  if (topicIds.length === 0) {
    const db = require('../config/db');
    const topicsRes = await db.query('SELECT id FROM topics LIMIT 5');
    topicIds = topicsRes.rows.map((r) => r.id);
  }

  let mix = difficultyMix;
  if (modeSlug) {
    const mode = await getPracticeModeBySlug(modeSlug);
    if (mode && mode.difficulty_mix) mix = mode.difficulty_mix;
  }

  const questions = await getQuestionsByTopicAndDifficulty({
    topicIds,
    difficultyMix: mix,
    excludeQuestionIds: attemptedIds,
    limit
  });

  const sanitized = questions.map((q) => ({
    id: q.id,
    topic_id: q.topic_id,
    topic_name: q.topic_name,
    question_text: q.question_text,
    options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
    difficulty: q.difficulty
  }));

  return {
    recommendations: sanitized,
    weak_topics_used: weakTopics.slice(0, 3).map((t) => t.topic_name),
    difficulty_level: userLevel
  };
}

/**
 * Get questions for a timed practice mode (Speed / Deep Thinking / Interview).
 */
async function getQuestionsForPracticeMode(userId, modeSlug, options = {}) {
  const { topic, difficulty, excludeAttempted = true } = options;
  
  const mode = await getPracticeModeBySlug(modeSlug);
  if (!mode) return null;

  let attemptedIds = [];
  if (excludeAttempted) attemptedIds = await getAttemptedQuestionIds(userId);

  // Build dynamic query parameters
  const queryParams = {
    topicIds: [],
    difficultyMix: mode.difficulty_mix || DEFAULT_MIX,
    excludeQuestionIds: attemptedIds,
    limit: mode.question_count,
    topicName: topic,
    specificDifficulty: difficulty
  };

  // If specific topic is requested, we'll need to handle it differently
  let questions = [];
  if (topic) {
    // If topic filter is provided, return ONLY questions from that topic
    questions = await getQuestionsByTopicAndDifficulty({
      topicIds: [],
      difficultyMix: difficulty ? { [difficulty]: 1.0 } : queryParams.difficultyMix,
      excludeQuestionIds: attemptedIds,
      limit: mode.question_count,
      topicName: topic,
      specificDifficulty: difficulty
    });
    
    // If less than required questions exist for that topic+difficulty, return however many exist
    // Never mix topics in a single session
  } else {
    // No specific topic requested, use the original logic
    questions = await getQuestionsByTopicAndDifficulty(queryParams);
  }

  return {
    mode: { name: mode.name, slug: mode.slug, question_count: mode.question_count, time_limit_seconds: mode.time_limit_seconds },
    questions: questions.map((q) => ({
      id: q.id,
      topic_id: q.topic_id,
      topic_name: q.topic_name,
      question_text: q.question_text,
      options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
      correct_answer: q.correct_answer,
      difficulty: q.difficulty
    }))
  };
}

module.exports = {
  getRecommendations,
  getQuestionsForPracticeMode,
  getAdaptiveDifficultyMix,
  getUserLevel
};
