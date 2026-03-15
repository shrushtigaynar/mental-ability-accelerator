const express = require('express');
const { getWeakTopicsHandler, getCognitiveProfileHandler } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/weak-topics/:userId', authMiddleware, getWeakTopicsHandler);
router.get('/cognitive-profile/:userId', authMiddleware, getCognitiveProfileHandler);

module.exports = router;
