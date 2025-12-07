const config = require("./config");
const createApp = require("./app");
const database = require("./utils/database");
const mqttClient = require("./utils/mqttClient");
const mqttService = require("./services/mqttService");

class Server {
  constructor() {
    this.app = createApp();
    this.port = config.port;
    this.server = null;
  }

  async initialize() {
    try {
      await database.testConnection();

      await mqttClient.connect();

      await mqttService.initializeHandlers();

      const userController = require("./controllers/userController");
      await userController.cleanupExpiredTokens();

      console.log("Server initialization completed successfully");
    } catch (error) {
      console.error("Server initialization failed:", error);
      throw error;
    }
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`Server running on http://localhost:${this.port}`);
    });
  }

  async shutdown() {
    console.log("Shutting down gracefully...");

    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }

    mqttClient.disconnect();

    await database.close();

    console.log("Server shutdown completed");
    process.exit(0);
  }
}

const server = new Server();

const startServer = async () => {
  try {
    await server.initialize();
    server.start();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => server.shutdown());
process.on("SIGTERM", () => server.shutdown());

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  server.shutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  server.shutdown();
});

startServer();

module.exports = server;
