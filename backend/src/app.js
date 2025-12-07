const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const setupRoutes = require("./routes");

const createApp = () => {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  setupRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
