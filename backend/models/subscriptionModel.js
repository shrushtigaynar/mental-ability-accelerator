const db = require('../config/db');

async function getActiveSubscriptionForUser(userId, referenceDate = new Date()) {
  const result = await db.query(
    `SELECT *
     FROM subscriptions
     WHERE user_id = $1
       AND status = 'active'
       AND expiry_date >= $2::date
     ORDER BY expiry_date DESC
     LIMIT 1`,
    [userId, referenceDate]
  );
  return result.rows[0] || null;
}

module.exports = {
  getActiveSubscriptionForUser
};

