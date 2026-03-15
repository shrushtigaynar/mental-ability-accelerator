module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  trial: {
    days: parseInt(process.env.TRIAL_DAYS || '7', 10)
  }
};

