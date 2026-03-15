const express = require('express');
const {
  getLeaderboardHandler,
  getMyStreakHandler,
  getFriendsHandler,
  inviteFriendHandler,
  acceptFriendRequestHandler
} = require('../controllers/leaderboardController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getLeaderboardHandler);

router.get('/streak', authMiddleware, getMyStreakHandler);

router.get('/friends', authMiddleware, getFriendsHandler);

router.post('/friends/invite', authMiddleware, inviteFriendHandler);

/*
NEW ROUTE
Accept Friend Request
*/
router.post('/friends/accept', authMiddleware, acceptFriendRequestHandler);

module.exports = router;
