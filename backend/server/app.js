const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('../routes/authRoutes');
const testRoutes = require('../routes/testRoutes');
const analyticsRoutes = require('../routes/analyticsRoutes');
const practiceRoutes = require('../routes/practiceRoutes');
const collaborationRoutes = require('../routes/collaborationRoutes');
const leaderboardRoutes = require('../routes/leaderboardRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');
const recommendationRoutes = require('../routes/recommendationRoutes');
const friendRoutes = require('../routes/friendRoutes');
const errorHandler = require('../middleware/errorHandler');

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

/* Health Check Route */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Mental Ability Accelerator API'
  });
});

/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/friends', friendRoutes);

/* Global Error Handler */
app.use(errorHandler);

module.exports = app;

