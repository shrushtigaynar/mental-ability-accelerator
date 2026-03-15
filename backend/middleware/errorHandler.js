// Centralized error handler to keep controllers clean
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details || null
    });
  }

  // Basic handling for common JWT and validation errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);

  return res.status(500).json({
    error: 'Internal server error'
  });
}

module.exports = errorHandler;

