const { verifyAccessToken } = require("../utils/authTokens");
const database = require("../utils/database");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../utils/constants");

async function authenticate(req, res, next) {
  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers["authorization"];
    token = authHeader && authHeader.split(" ")[1];
  }

  if (!token) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ error: ERROR_MESSAGES.ACCESS_TOKEN_MISSING });
  }

  try {
    const decoded = await verifyAccessToken(token);
    
    // Verify user still exists 
    const userResult = await database.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [decoded.sub]
    );
    
    if (userResult.rowCount === 0) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ error: ERROR_MESSAGES.INVALID_ACCESS_TOKEN });
  }
}

module.exports = authenticate;
