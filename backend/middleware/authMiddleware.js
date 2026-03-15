const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const { findUserById } = require('../models/userModel');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired authentication token');
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User associated with token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;

