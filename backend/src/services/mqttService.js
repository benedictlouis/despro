const mqttClient = require("../utils/mqttClient");
const config = require("../config");
const recipeService = require("./recipeService");
const { ERROR_MESSAGES } = require("../utils/constants");

class MQTTService {
  async initializeHandlers() {
    mqttClient.registerMessageHandler(
      config.mqtt.topics.espRequest,
      this.handleEspRequest.bind(this)
    );
  }

  async handleEspRequest(data) {
    console.log("ESP Request Data:", data);

    if (data?.menu) {
      await this.sendMenuList();
    }

    if (data?.step_id && data?.step) {
      await this.sendRecipeStep(data.step_id, data.step);
    }
  }

  async sendMenuList() {
    try {
      const recipes = await recipeService.getAllRecipes();

      const menuList = recipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
      }));

      const message = { menus: menuList };

      await mqttClient.publish(config.mqtt.topics.webMenus, message);

      console.log(`${menuList.length} menu(s) sent to MQTT`);
      return menuList;
    } catch (error) {
      console.error("Error sending menu list:", error);
      throw error;
    }
  }

  async sendRecipeStep(recipeId, stepNumber) {
    try {
      const recipe = await recipeService.getRecipeById(recipeId);

      if (!recipe) {
        throw new Error(ERROR_MESSAGES.RECIPE_NOT_FOUND);
      }

      const step = recipe.steps[stepNumber - 1];

      if (!step) {
        throw new Error(`Step ${stepNumber} not found in recipe`);
      }

      const message = {
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        steps: step,
        timestamp: new Date().toISOString(),
      };

      await mqttClient.publish(config.mqtt.topics.webRecipeSteps, message);

      console.log(
        `Recipe "${recipe.name}" step ${stepNumber} sent to ESP32 via MQTT`
      );
      return message;
    } catch (error) {
      console.error("Error sending recipe step:", error);
      throw error;
    }
  }

  async executeRecipe(recipeId) {
    try {
      const recipeData = await recipeService.getRecipeForExecution(recipeId);

      if (!recipeData) {
        throw new Error(ERROR_MESSAGES.RECIPE_NOT_FOUND);
      }

      await mqttClient.publish(config.mqtt.topics.recipeExecute, recipeData);

      console.log(`Recipe "${recipeData.recipe_name}" sent to ESP32 via MQTT`);
      return recipeData;
    } catch (error) {
      console.error("Error executing recipe:", error);
      throw error;
    }
  }

  getConnectionStatus() {
    return mqttClient.getConnectionStatus();
  }
}

module.exports = new MQTTService();
