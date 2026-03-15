const express = require('express');
const {
  createSessionHandler,
  inviteHandler,
  joinByTokenHandler,
  joinBySessionIdHandler,
  getMySessionsHandler
} = require('../controllers/collaborationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-session', authMiddleware, createSessionHandler);
router.post('/invite', authMiddleware, inviteHandler);
router.get('/join', authMiddleware, joinByTokenHandler);
router.get('/join/:sessionId', authMiddleware, joinBySessionIdHandler);
router.get('/my-sessions', authMiddleware, getMySessionsHandler);

module.exports = router;
