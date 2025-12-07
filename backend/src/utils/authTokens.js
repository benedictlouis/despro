const jwt = require("jsonwebtoken");
const config = require("../config");

function validateJWTEnvironment() {
  const required = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required JWT environment variables: ${missing.join(', ')}`);
  }
  
  if (process.env.ACCESS_TOKEN_SECRET.length < 32) {
    console.warn('WARNING: ACCESS_TOKEN_SECRET should be at least 32 characters long');
  }
  if (process.env.REFRESH_TOKEN_SECRET.length < 32) {
    console.warn('WARNING: REFRESH_TOKEN_SECRET should be at least 32 characters long');
  }
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );
}

function verifyAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

function verifyRefreshToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = { 
  generateAccessToken, 
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  validateJWTEnvironment
};
