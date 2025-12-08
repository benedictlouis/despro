const mqttService = require("../services/mqttService");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../utils/constants");

class MQTTController {
  async sendMenu(req, res) {
    try {
      const menuList = await mqttService.sendMenuList();

      res.json({
        message: SUCCESS_MESSAGES.MENU_SENT,
        total: menuList.length,
      });
    } catch (error) {
      console.error("Error sending menu:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.FAILED_TO_SEND_MENU });
    }
  }
}

module.exports = new MQTTController();
