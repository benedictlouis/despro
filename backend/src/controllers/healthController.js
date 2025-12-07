const database = require("../utils/database");
const mqttService = require("../services/mqttService");

class HealthController {
  async getHealth(req, res) {
    try {
      const mqttStatus = mqttService.getConnectionStatus();

      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        database: "connected",
        mqtt: mqttStatus ? "connected" : "disconnected",
      });
    } catch (error) {
      console.error("Error checking health:", error);
      res.status(500).json({
        status: "ERROR",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new HealthController();
