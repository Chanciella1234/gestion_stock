const jwt = require('jsonwebtoken');

const genererToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const verifierToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { genererToken, verifierToken };
