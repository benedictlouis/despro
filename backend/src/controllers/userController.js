const database = require("../utils/database");
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/authTokens");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../utils/constants");

class UserController {
  async register(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: ERROR_MESSAGES.USERNAME_PASSWORD_REQUIRED });
      }

      // Check if user exists
      const existing = await database.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (existing.rowCount > 0) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ error: ERROR_MESSAGES.USERNAME_ALREADY_EXISTS });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Insert user
      const result = await database.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, 'user') RETURNING id, username, role",
        [username, passwordHash]
      );

      const newUser = result.rows[0];

      res.status(HTTP_STATUS.CREATED).json({
        message: SUCCESS_MESSAGES.USER_REGISTERED,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: ERROR_MESSAGES.USERNAME_PASSWORD_REQUIRED });
      }

      // Find user
      const result = await database.query(
        "SELECT id, username, password, role FROM users WHERE username = $1",
        [username]
      );

      if (result.rowCount === 0) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
      }

      const user = result.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
      }

      // Remove password from user object before generating tokens
      const { password: _, ...userWithoutPassword } = user;

      // Generate tokens
      const accessToken = generateAccessToken(userWithoutPassword);
      const refreshToken = generateRefreshToken(userWithoutPassword);

      // Store refresh token
      await database.query(
        "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
        [user.id, refreshToken]
      );

      // Set HttpOnly cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED });
      }

      // Check if token exists in database
      const tokenResult = await database.query(
        "SELECT user_id, created_at FROM refresh_tokens WHERE token = $1",
        [refreshToken]
      );

      if (tokenResult.rowCount === 0) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ error: ERROR_MESSAGES.INVALID_REFRESH_TOKEN });
      }

      // Verify token using promise-based method
      let decoded;
      try {
        decoded = await verifyRefreshToken(refreshToken);
      } catch (err) {
        console.error("Refresh token verify error:", err.message);
        // Delete invalid token from database
        await database.query("DELETE FROM refresh_tokens WHERE token = $1", [
          refreshToken,
        ]);
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ error: ERROR_MESSAGES.INVALID_REFRESH_TOKEN });
      }

      const userId = decoded.sub;

      // Get user data
      const userResult = await database.query(
        "SELECT id, username, role FROM users WHERE id = $1",
        [userId]
      );

      if (userResult.rowCount === 0) {
        // Clean up orphaned token
        await database.query("DELETE FROM refresh_tokens WHERE token = $1", [
          refreshToken,
        ]);
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      const user = userResult.rows[0];

      // Generate new tokens (rotation)
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Delete old refresh token and store new one (rotation)
      await database.query(
        "DELETE FROM refresh_tokens WHERE token = $1",
        [refreshToken]
      );
      
      await database.query(
        "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
        [user.id, newRefreshToken]
      );

      // Set new HttpOnly cookies
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(HTTP_STATUS.OK).json({
        message: "Token refreshed successfully",
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        // Clear cookies anyway with proper options
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED });
      }

      // Check if token exists in database
      const checkResult = await database.query(
        "SELECT id FROM refresh_tokens WHERE token = $1",
        [refreshToken]
      );

      if (checkResult.rowCount === 0) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ error: ERROR_MESSAGES.INVALID_REFRESH_TOKEN });
      }

      // Delete the refresh token
      await database.query("DELETE FROM refresh_tokens WHERE token = $1", [
        refreshToken,
      ]);

      // Clear cookies with matching options
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res
        .status(HTTP_STATUS.OK)
        .json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL });
    } catch (error) {
      console.error("Logout error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async getMe(req, res) {
    try {
      // req.user is set by authenticate middleware
      res.status(HTTP_STATUS.OK).json({
        user: req.user,
      });
    } catch (error) {
      console.error("GetMe error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  // Cleanup expired refresh tokens
  async cleanupExpiredTokens() {
    try {
      // Parse expiry from JWT format (e.g., "7d") to days
      const expiryString = process.env.REFRESH_TOKEN_EXPIRES || "7d";
      const expiryDays = parseInt(expiryString) || 7;
      
      // Use string concatenation for interval since parameterized queries don't work with intervals
      const result = await database.query(
        `DELETE FROM refresh_tokens WHERE created_at < NOW() - INTERVAL '${expiryDays} days'`
      );
      console.log(`Cleaned up ${result.rowCount} expired refresh tokens`);
    } catch (error) {
      console.error("Token cleanup error:", error);
    }
  }

  // Revoke all refresh tokens for a user
  async revokeAllUserTokens(userId) {
    try {
      await database.query("DELETE FROM refresh_tokens WHERE user_id = $1", [
        userId,
      ]);
    } catch (error) {
      console.error("Revoke tokens error:", error);
      throw error;
    }
  }
}

module.exports = new UserController();
