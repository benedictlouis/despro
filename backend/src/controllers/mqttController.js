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

  async executeRecipe(req, res) {
    try {
      const { id } = req.params;
      const recipeData = await mqttService.executeRecipe(id);

      res.json({
        message: SUCCESS_MESSAGES.RECIPE_SENT,
        recipe_name: recipeData.recipe_name,
      });
    } catch (error) {
      console.error("Error executing recipe:", error);

      if (error.message === ERROR_MESSAGES.RECIPE_NOT_FOUND) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: ERROR_MESSAGES.RECIPE_NOT_FOUND });
      }

      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.FAILED_TO_EXECUTE_RECIPE });
    }
  }
}

module.exports = new MQTTController();
