const ApiError = require('../utils/ApiError');
const { getRecommendations, getQuestionsForPracticeMode } = require('../services/recommendationService');
const {
  getCompanyPatternBySlug,
  getCompanyPatterns,
  getQuestionsForCompanyPattern,
  getAttemptedQuestionIds,
  getPracticeModes,
  getPracticeModeBySlug
} = require('../models/practiceModel');

async function getRecommendationsHandler(req, res, next) {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId, 10) : req.user?.id;
    if (!userId) throw new ApiError(400, 'userId required');
    if (req.user && req.user.id !== userId) throw new ApiError(403, 'Forbidden');
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const modeSlug = req.query.mode || null;
    const result = await getRecommendations(userId, { limit, modeSlug });
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getPracticeModeQuestionsHandler(req, res, next) {
  try {
    // TEMPORARY userId for development
    const userId = 1;

    const { modeSlug } = req.params;
    const { topic, difficulty } = req.query;
    
    const payload = await getQuestionsForPracticeMode(userId, modeSlug, { topic, difficulty });

    if (!payload) throw new ApiError(404, 'Practice mode not found');

    return res.json(payload);

  } catch (err) {
    next(err);
  }
}

async function listPracticeModesHandler(req, res, next) {
  try {
    const modes = await getPracticeModes();
    return res.json({ modes });
  } catch (err) {
    next(err);
  }
}

async function listCompanyPatternsHandler(req, res, next) {
  try {
    const patterns = await getCompanyPatterns();
    return res.json({ patterns });
  } catch (err) {
    next(err);
  }
}

async function createCompanyPatternTestHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Authentication required');

    const { company_slug } = req.body;
    const slug = company_slug || req.body.slug;

    if (!slug) throw new ApiError(400, 'company_slug or slug required');

    const pattern = await getCompanyPatternBySlug(slug);

    if (!pattern) throw new ApiError(404, 'Company pattern not found');

    const attemptedIds = await getAttemptedQuestionIds(userId);

    const questions = await getQuestionsForCompanyPattern(pattern, attemptedIds);

    const sanitized = questions.map((q) => ({
      id: q.id,
      topic_id: q.topic_id,
      topic_name: q.topic_name,
      question_text: q.question_text,
      options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
      difficulty: q.difficulty
    }));

    return res.status(201).json({
      company_pattern: {
        name: pattern.name,
        slug: pattern.slug,
        time_limit_seconds: pattern.time_limit_seconds,
        question_count: pattern.question_count
      },
      questions: sanitized
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRecommendationsHandler,
  getPracticeModeQuestionsHandler,
  listPracticeModesHandler,
  listCompanyPatternsHandler,
  createCompanyPatternTestHandler
};
