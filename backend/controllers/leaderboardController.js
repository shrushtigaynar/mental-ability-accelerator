const ApiError = require('../utils/ApiError');
const {
  getLeaderboard,
  getFriendIds,
  getFriendsWithStatus,
  getStreak,
  upsertStreak,
  sendFriendRequest,
  acceptFriendRequest
} = require('../models/leaderboardModel');

const { findUserByEmail } = require('../models/userModel');


async function getLeaderboardHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const friendsOnly = req.query.friends === 'true';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    let friendIds = null;

    if (userId && friendsOnly) {
      friendIds = await getFriendIds(userId);
    }

    const leaderboard = await getLeaderboard({ friendIds, limit });

    return res.json({ leaderboard });

  } catch (err) {
    next(err);
  }
}


async function getMyStreakHandler(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const streak = await getStreak(userId);

    return res.json({
      user_id: userId,
      streak_count: streak ? streak.streak_count : 0,
      last_activity_date: streak ? streak.last_activity_date : null
    });

  } catch (err) {
    next(err);
  }
}


async function getFriendsHandler(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const friends = await getFriendsWithStatus(userId);

    return res.json({ friends });

  } catch (err) {
    next(err);
  }
}


async function inviteFriendHandler(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const { email } = req.body || {};

    if (!email) {
      throw new ApiError(400, 'email required');
    }

    const friend = await findUserByEmail(email);

    if (!friend) {
      throw new ApiError(404, 'User with this email not found');
    }

    await sendFriendRequest(userId, friend.id);

    return res.status(201).json({
      message: 'Friend request sent',
      friend_id: friend.id
    });

  } catch (err) {
    next(err);
  }
}


/*
✅ NEW FUNCTION
Accept Friend Request
*/
async function acceptFriendRequestHandler(req, res, next) {
  try {

    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const { requestId } = req.body;

    if (!requestId) {
      throw new ApiError(400, 'requestId is required');
    }

    const result = await acceptFriendRequest(requestId, userId);

    return res.json({
      message: "Friend request accepted",
      data: result
    });

  } catch (err) {
    next(err);
  }
}


module.exports = {
  getLeaderboardHandler,
  getMyStreakHandler,
  getFriendsHandler,
  inviteFriendHandler,
  acceptFriendRequestHandler
};