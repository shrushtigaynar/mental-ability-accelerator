const express = require('express');
const {
  getRecommendationsHandler,
  getPracticeModeQuestionsHandler,
  listPracticeModesHandler,
  listCompanyPatternsHandler,
  createCompanyPatternTestHandler
} = require('../controllers/practiceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/available-topics', async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query(
      `SELECT t.name, t.id, COUNT(q.id) as question_count
       FROM topics t
       LEFT JOIN questions q ON q.topic_id = t.id
       GROUP BY t.id, t.name
       ORDER BY t.id`
    );
    res.json({ topics: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recommendations/:userId', authMiddleware, getRecommendationsHandler);
router.get('/modes', listPracticeModesHandler);

// Authentication temporarily removed for testing
router.get('/modes/:modeSlug/questions', getPracticeModeQuestionsHandler);

router.get('/company-patterns', listCompanyPatternsHandler);
router.post('/company-pattern', authMiddleware, createCompanyPatternTestHandler);

router.get('/questions-test', async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query('SELECT * FROM questions');

    res.json({
      questions: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;