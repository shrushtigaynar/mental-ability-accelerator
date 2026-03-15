const ApiError = require('../utils/ApiError');
const { getWeakTopics } = require('../services/weakTopicService');
const { getOrComputeCognitiveProfile } = require('../services/cognitiveService');

async function getWeakTopicsHandler(req, res, next) {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId, 10) : req.user?.id;
    if (!userId) throw new ApiError(400, 'userId required');
    if (req.user && req.user.id !== userId) throw new ApiError(403, 'Cannot view another user weak topics');
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const weakTopics = await getWeakTopics(userId, limit);
    return res.json({ weak_topics: weakTopics });
  } catch (err) {
    next(err);
  }
}

async function getCognitiveProfileHandler(req, res, next) {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId, 10) : req.user?.id;
    if (!userId) throw new ApiError(400, 'userId required');
    if (req.user && req.user.id !== userId) throw new ApiError(403, 'Cannot view another user cognitive profile');
    const forceRecompute = req.query.recompute === 'true';
    const profile = await getOrComputeCognitiveProfile(userId, forceRecompute);
    return res.json(profile);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWeakTopicsHandler,
  getCognitiveProfileHandler
};
