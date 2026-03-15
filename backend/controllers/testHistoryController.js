const ApiError = require('../utils/ApiError');
const { getTestHistory } = require('../models/testHistoryModel');

async function getTestHistoryHandler(req, res, next) {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId, 10) : req.user?.id;
    if (!userId) throw new ApiError(400, 'userId required');
    if (req.user && req.user.id !== userId) throw new ApiError(403, 'Cannot view another user history');
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const { tests, total } = await getTestHistory(userId, limit, offset);
    return res.json({ tests, total });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTestHistoryHandler };
