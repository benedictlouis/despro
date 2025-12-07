const mqttClient = require("../utils/mqttClient");
const config = require("../config");
const recipeService = require("./recipeService");
const espDeviceService = require("./espDeviceService");
const { ERROR_MESSAGES } = require("../utils/constants");

class MQTTService {
  async initializeHandlers() {
    mqttClient.registerMessageHandler(
      config.mqtt.topics.espRequest,
      this.handleEspRequest.bind(this)
    );

    setInterval(() => {
      espDeviceService.checkOfflineDevices(5);
    }, 60000);
  }

  async handleEspRequest(data) {
    console.log("ESP Request Data:", data);

    const { name, menu, step_id, step } = data;

    if (name) {
      const device = await espDeviceService.getDeviceByName(name);
      const wasOffline = device && device.status === "offline";

      await espDeviceService.updateOrCreateDevice(name, step_id, step);

      if (wasOffline && !step_id && !step) {
        const updatedDevice = await espDeviceService.getDeviceByName(name);
        if (updatedDevice) {
          const interruptedRecipe = await espDeviceService.getInterruptedRecipe(
            updatedDevice.id
          );

          if (interruptedRecipe) {
            console.log(
              `ESP "${name}" reconnected. Interrupted recipe found: ${interruptedRecipe.recipe_name} at step ${interruptedRecipe.last_step}`
            );

            const resumeMessage = {
              resume: true,
              recipe_id: interruptedRecipe.recipe_id,
              recipe_name: interruptedRecipe.recipe_name,
              last_step: interruptedRecipe.last_step,
              message: `Resume recipe: ${interruptedRecipe.recipe_name} from step ${interruptedRecipe.last_step}`,
            };

            await mqttClient.publish(
              config.mqtt.topics.webRecipeSteps,
              resumeMessage
            );

            return;
          }
        }
      }

      if (step_id && step) {
        const device = await espDeviceService.getDeviceByName(name);
        if (device) {
          await espDeviceService.updateDeviceRecipe(name, step_id, step);

          const existingExecution =
            await espDeviceService.updateRecipeExecution(
              device.id,
              step_id,
              step
            );

          if (!existingExecution) {
            await espDeviceService.startRecipeExecution(device.id, step_id);
            await espDeviceService.updateRecipeExecution(
              device.id,
              step_id,
              step
            );
          }
        }
      } else if (!step_id) {
        const device = await espDeviceService.getDeviceByName(name);
        if (device && device.current_recipe_id) {
          await espDeviceService.updateRecipeExecution(
            device.id,
            device.current_recipe_id,
            device.current_step || 0,
            "completed"
          );
        }
        await espDeviceService.setDeviceIdle(name);
      }
    }

    if (menu) {
      await this.sendMenuList();
    }

    if (step_id && step) {
      await this.sendRecipeStep(step_id, step);
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
        const errorMessage = ERROR_MESSAGES.RECIPE_NOT_FOUND;
        console.error(errorMessage);
        return { error: errorMessage };
      }

      if (
        !recipe.steps ||
        !Array.isArray(recipe.steps) ||
        recipe.steps.length === 0
      ) {
        const errorMessage = `Recipe "${recipe.name}" has no steps`;
        console.error(errorMessage);
        return { error: errorMessage };
      }

      if (stepNumber < 1 || stepNumber > recipe.steps.length) {
        const errorMessage = `Step ${stepNumber} is out of bounds. Recipe has ${recipe.steps.length} step(s)`;
        console.error(errorMessage);
        return { error: errorMessage };
      }

      const step = recipe.steps[stepNumber - 1];

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
      return { error: error.message || "Failed to send recipe step" };
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
