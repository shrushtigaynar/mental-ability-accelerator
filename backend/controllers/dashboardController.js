const { getUserStats, getUserStatsForDashboard } = require('../models/dashboardModel');
const db = require('../config/db');

async function getDashboard(req, res, next) {
  try {

    const userId = req.user.id;

    const stats = await getUserStats(userId);

    res.json({
      total_tests: stats.total_tests || 0,
      avg_score: stats.avg_score || 0,
      avg_accuracy: stats.avg_accuracy || 0
    });

  } catch (err) {
    next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Total tests
    const totalTestsResult = await db.query(
      `SELECT COUNT(*) FROM tests WHERE user_id = $1`,
      [userId]
    );
    const totalTests = parseInt(totalTestsResult.rows[0].count) || 0;

    // 2. Overall accuracy
    const accuracyResult = await db.query(
      `SELECT AVG(accuracy_percentage) FROM tests WHERE user_id = $1`,
      [userId]
    );
    const overallAccuracy = Math.round(parseFloat(accuracyResult.rows[0].avg) || 0);

    // 3. Current streak - get tests grouped by date
    const streakResult = await db.query(
      `SELECT DATE(created_at) as test_date 
       FROM tests 
       WHERE user_id = $1 
       GROUP BY DATE(created_at) 
       ORDER BY test_date DESC`,
      [userId]
    );
    
    let streak = 0;
    if (streakResult.rows.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const testDates = streakResult.rows.map(row => new Date(row.test_date));
      
      // Check if tested today or yesterday to start streak
      const todayTest = testDates.find(date => 
        date.toDateString() === today.toDateString()
      );
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTest = testDates.find(date => 
        date.toDateString() === yesterday.toDateString()
      );
      
      if (todayTest || yesterdayTest) {
        streak = 1;
        let checkDate = todayTest ? new Date(today) : new Date(yesterday);
        
        // Count consecutive days backwards
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const prevDayTest = testDates.find(date => 
            date.toDateString() === checkDate.toDateString()
          );
          if (prevDayTest) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // 4. Avg session minutes
    const sessionTimeResult = await db.query(
      `SELECT AVG(time_taken) FROM tests WHERE user_id = $1`,
      [userId]
    );
    const avgSessionMinutes = Math.round(parseFloat(sessionTimeResult.rows[0].avg) / 60) || 0;

    // 5. Today's focus
    const todayFocusResult = await db.query(
      `SELECT focus_topic, focus_minutes 
       FROM user_daily_focus 
       WHERE user_id = $1 AND focus_date = CURRENT_DATE`,
      [userId]
    );
    const todayFocus = todayFocusResult.rows[0] || null;

    res.json({
      totalTests,
      overallAccuracy,
      streak,
      avgSessionMinutes,
      todayFocus
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats', 
      details: error.message 
    });
  }
}

module.exports = {
  getDashboard,
  getDashboardStats
};