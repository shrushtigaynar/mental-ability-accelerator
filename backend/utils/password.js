const bcrypt = require('bcryptjs');

const DEFAULT_SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || DEFAULT_SALT_ROUNDS.toString(), 10);
  return bcrypt.hash(plainPassword, saltRounds);
}

async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = {
  hashPassword,
  comparePassword
};

