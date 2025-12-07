const { HTTP_STATUS, ERROR_MESSAGES } = require("../utils/constants");

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ error: ERROR_MESSAGES.UNAUTHORIZED });
  }

  if (req.user.role !== "admin") {
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ error: ERROR_MESSAGES.ACCESS_DENIED });
  }

  next();
};

module.exports = adminOnly;
