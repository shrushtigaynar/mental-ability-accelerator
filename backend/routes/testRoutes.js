const express = require('express');

const {
  getDiagnosticQuestions,
  submitDiagnosticTest,
  getTestResult
} = require('../controllers/testController');
const { getTestHistoryHandler } = require('../controllers/testHistoryController');

const authMiddleware = require('../middleware/authMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.get('/diagnostic/questions', authMiddleware, getDiagnosticQuestions);

router.post(
  '/diagnostic/submit',
  authMiddleware,
  submitDiagnosticTest
);

router.get('/result/:testId', authMiddleware, getTestResult);
router.get('/history/:userId', authMiddleware, getTestHistoryHandler);

module.exports = router;

