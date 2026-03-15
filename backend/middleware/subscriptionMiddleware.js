const ApiError = require('../utils/ApiError');
const config = require('../config');
const { getActiveSubscriptionForUser } = require('../models/subscriptionModel');

async function subscriptionMiddleware(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, 'User context missing for subscription check');
    }

    const createdAt = new Date(user.created_at);
    const now = new Date();
    const trialEnd = new Date(createdAt);
    trialEnd.setDate(trialEnd.getDate() + config.trial.days);

    if (now <= trialEnd) {
      return next();
    }

    const activeSubscription = await getActiveSubscriptionForUser(user.id, now);
    if (!activeSubscription) {
      throw new ApiError(
        402,
        'Trial expired and no active subscription found. Please subscribe to access this feature.'
      );
    }

    req.subscription = activeSubscription;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = subscriptionMiddleware;

