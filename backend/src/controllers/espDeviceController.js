const espDeviceService = require("../services/espDeviceService");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../utils/constants");

class EspDeviceController {
  async getAllDevices(req, res) {
    try {
      const devices = await espDeviceService.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error("Error getting devices:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch devices" });
    }
  }

  async getDeviceByName(req, res) {
    try {
      const { name } = req.params;
      const device = await espDeviceService.getDeviceByName(name);

      if (!device) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: "Device not found" });
      }

      res.json(device);
    } catch (error) {
      console.error("Error getting device:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch device" });
    }
  }

  async getDeviceExecutions(req, res) {
    try {
      const { id } = req.params;
      const executions = await espDeviceService.getDeviceExecutions(id);
      res.json(executions);
    } catch (error) {
      console.error("Error getting device executions:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch device executions" });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await espDeviceService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch dashboard stats" });
    }
  }

  async getRecipeUsageStats(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const stats = await espDeviceService.getRecipeUsageStats(limit);
      res.json(stats);
    } catch (error) {
      console.error("Error getting recipe usage stats:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch recipe usage stats" });
    }
  }

  async getCookingStatusStats(req, res) {
    try {
      const stats = await espDeviceService.getCookingStatusStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting cooking status stats:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch cooking status stats" });
    }
  }

  async getDailyActivityStats(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const stats = await espDeviceService.getDailyActivityStats(days);
      res.json(stats);
    } catch (error) {
      console.error("Error getting daily activity stats:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch daily activity stats" });
    }
  }
}

module.exports = new EspDeviceController();
