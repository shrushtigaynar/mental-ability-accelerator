const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

// Get subscription status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT subscription_status, subscription_expiry FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const user = result.rows[0];
    res.json({
      subscription_status: user?.subscription_status || 'free',
      subscription_expiry: user?.subscription_expiry
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Process payment
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { plan, payment_method } = req.body;
    
    // Update subscription status
    await pool.query(
      'UPDATE users SET subscription_status = $1, subscription_expiry = NOW() + INTERVAL \'30 days\' WHERE id = $2',
      [plan === 'premium' ? 'premium' : 'pro', req.user.id]
    );
    
    res.json({ success: true, message: 'Payment processed successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

module.exports = router;
