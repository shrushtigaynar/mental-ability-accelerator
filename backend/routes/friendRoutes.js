const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// Search users by email
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { email } = req.query;
    const result = await pool.query(
      `SELECT id, name, email, 
              subscription_status,
              (SELECT COUNT(*) FROM tests WHERE user_id = u.id 
               AND DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days') as recent_sessions
       FROM users u
       WHERE email ILIKE $1 AND id != $2
       LIMIT 10`,
      [`%${email}%`, req.user.id]
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.body;
    
    // Check if already friends or request exists
    const existing = await pool.query(
      `SELECT * FROM friendships 
       WHERE (user_id = $1 AND friend_id = $2)
       OR (user_id = $2 AND friend_id = $1)`,
      [req.user.id, friendId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Request already exists' });
    }
    
    await pool.query(
      `INSERT INTO friendships (user_id, friend_id, status) 
       VALUES ($1, $2, 'pending')`,
      [req.user.id, friendId]
    );
    
    res.json({ success: true, message: 'Friend request sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Accept/reject friend request
router.put('/request/:id', authenticateToken, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const status = action === 'accept' ? 'accepted' : 'rejected';
    
    await pool.query(
      `UPDATE friendships SET status = $1 
       WHERE id = $2 AND friend_id = $3`,
      [status, req.params.id, req.user.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Get friends list with streaks
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        f.id as friendship_id,
        f.status,
        u.id, u.name, u.email,
        (
          SELECT COUNT(DISTINCT DATE(created_at)) 
          FROM tests 
          WHERE user_id = u.id 
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        ) as streak,
        (
          SELECT COALESCE(ROUND(AVG(accuracy_percentage)::numeric, 1), 0)
          FROM tests WHERE user_id = u.id
        ) as avg_accuracy,
        (
          SELECT COUNT(*) FROM tests WHERE user_id = u.id
        ) as total_sessions
       FROM friendships f
       JOIN users u ON (
         CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END = u.id
       )
       WHERE (f.user_id = $1 OR f.friend_id = $1)
       AND f.status = 'accepted'
       ORDER BY streak DESC`,
      [req.user.id]
    );
    
    res.json({ friends: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Get pending requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id as friendship_id, f.created_at,
              u.id, u.name, u.email
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Send invite email
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const inviterUserId = req.user.id;

    // Get inviter's name
    const inviterResult = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [inviterUserId]
    );
    const inviter = inviterResult.rows[0];
    const inviterName = inviter?.name || inviter?.email || 'A friend';

    // Check if user already exists in system
    const existingUser = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      // User exists — return their info so frontend can send friend request
      return res.status(400).json({ 
        error: 'User already on MAA',
        existingUser: existingUser.rows[0]
      });
    }

    // Send invite email via nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const appLink = process.env.APP_URL || 'http://localhost:5173';

    const mailOptions = {
      from: `"Mental Ability Accelerator" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${inviterName} invited you to join Mental Ability Accelerator! 🧠`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
          <h1 style="color: #06b6d4; font-size: 24px; margin-bottom: 8px;">
            🧠 Mental Ability Accelerator
          </h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px;">
            Aptitude Training for Job Seekers
          </p>
          
          <h2 style="color: #f1f5f9; font-size: 20px;">
            ${inviterName} wants to practice with you! ⚔️
          </h2>
          
          <p style="color: #cbd5e1; line-height: 1.6; margin: 16px 0;">
            You've been invited to join <strong style="color: #06b6d4;">Mental Ability Accelerator</strong> — 
            the #1 aptitude training platform for job seekers preparing for technical interviews.
          </p>

          <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #f1f5f9; margin: 0 0 12px 0;">What you'll get:</h3>
            <ul style="color: #94a3b8; line-height: 2; margin: 0; padding-left: 20px;">
              <li>⚡ Speed Training — Solve aptitude questions fast</li>
              <li>🧠 Memory Training — Number series, patterns</li>
              <li>💡 Logic Training — Reasoning & puzzles</li>
              <li>📊 Performance Analytics — Track your progress</li>
              <li>⚔️ Battle Mode — Compete with ${inviterName}!</li>
            </ul>
          </div>

          <a href="${appLink}/register" 
             style="display: inline-block; background: #06b6d4; color: white; 
                    padding: 14px 32px; border-radius: 50px; text-decoration: none; 
                    font-weight: bold; font-size: 16px; margin: 16px 0;">
            🚀 Join MAA & Accept Challenge
          </a>

          <p style="color: #64748b; font-size: 12px; margin-top: 32px;">
            If you didn't expect this email, you can ignore it.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Store pending invite in DB
    await pool.query(
      `INSERT INTO pending_invites (inviter_id, invited_email, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (invited_email) DO UPDATE SET inviter_id = $1, created_at = NOW()`,
      [inviterUserId, email]
    );

    res.json({ 
      success: true, 
      message: `Invite sent to ${email}!` 
    });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

module.exports = router;
