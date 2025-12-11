const { verifyAccessToken } = require("../utils/authTokens");
const database = require("../utils/database");

/**
 * Optional authentication middleware
 * Attempts to authenticate the user but allows the request to continue even if authentication fails
 * Sets req.user if authentication is successful, otherwise req.user remains undefined
 */
async function optionalAuth(req, res, next) {
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers["authorization"];
    token = authHeader && authHeader.split(" ")[1];
  }

  // If no token, continue as unauthenticated user
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = await verifyAccessToken(token);

    // Verify user still exists
    const userResult = await database.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [decoded.sub]
    );

    if (userResult.rowCount === 0) {
      req.user = null;
    } else {
      req.user = decoded;
    }

    next();
  } catch (err) {
    // Authentication failed, but continue as unauthenticated user
    console.log("Optional auth failed:", err.message);
    req.user = null;
    next();
  }
}

module.exports = optionalAuth;
