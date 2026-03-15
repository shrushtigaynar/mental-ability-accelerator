const express = require('express');
const { getDashboard, getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

const router = express.Router();

router.get('/', authMiddleware, getDashboard);
router.get('/stats', authMiddleware, getDashboardStats);

// Get today's focus
router.get('/focus', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT focus_topic, focus_minutes, focus_date
       FROM user_daily_focus 
       WHERE user_id = $1 AND focus_date = CURRENT_DATE`,
      [userId]
    );
    
    if (result.rows.length > 0) {
      res.json({
        topic: result.rows[0].focus_topic,
        minutes: result.rows[0].focus_minutes,
        date: result.rows[0].focus_date
      });
    } else {
      res.json({ topic: null, minutes: 30, date: null });
    }
  } catch (err) {
    console.error('Get focus error:', err);
    res.status(500).json({ error: 'Failed to get focus' });
  }
});

// Set today's focus
router.post('/focus', authMiddleware, async (req, res) => {
  try {
    const { topic, minutes } = req.body;
    const userId = req.user.id;

    await pool.query(
      `INSERT INTO user_daily_focus (user_id, focus_topic, focus_minutes, focus_date)
       VALUES ($1, $2, $3, CURRENT_DATE)
       ON CONFLICT (user_id, focus_date) 
       DO UPDATE SET focus_topic = $2, focus_minutes = $3`,
      [userId, topic, minutes || 30]
    );

    res.json({ success: true, topic, minutes: minutes || 30 });
  } catch (err) {
    console.error('Set focus error:', err);
    res.status(500).json({ error: 'Failed to set focus' });
  }
});

module.exports = router;