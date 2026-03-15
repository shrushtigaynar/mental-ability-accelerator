const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { createUser, findUserByEmail } = require('../models/userModel');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email and password are required');
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new ApiError(409, 'A user with this email already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    const token = signToken({ id: user.id, email: user.email });

    return res.status(201).json({
      user,
      token
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const passwordValid = await comparePassword(password, user.password_hash);
    if (!passwordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = signToken({ id: user.id, email: user.email });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login
};

