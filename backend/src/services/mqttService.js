const mqttClient = require("../utils/mqttClient");
const config = require("../config");
const recipeService = require("./recipeService");
const espDeviceService = require("./espDeviceService");

class MQTTService {
  async initializeHandlers() {
    mqttClient.registerMessageHandler(
      config.mqtt.topics.espInit,
      this.handleEspInit.bind(this)
    );

    mqttClient.registerMessageHandler(
      config.mqtt.topics.espRequestMenu,
      this.handleEspRequestMenu.bind(this)
    );

    mqttClient.registerMessageHandler(
      config.mqtt.topics.espRequestMenuDetail,
      this.handleEspRequestMenuDetail.bind(this)
    );
  }

  async handleEspInit(data) {
    console.log("ESP Init Data:", data);

    const { name, id } = data;

    if (!name || !id) {
      console.error("Invalid ESP init data: missing name or id");
      return;
    }

    try {
      await espDeviceService.registerOrUpdateDevice(id, name);
      console.log(`ESP device registered: ${name} (ID: ${id})`);

      const device = await espDeviceService.getDeviceByDeviceId(id);

      if (device && device.current_menu_id && device.current_step > 0) {
        const recipe = await recipeService.getRecipeById(
          device.current_menu_id
        );

        if (recipe) {
          await espDeviceService.updateDeviceMenuAndStep(
            id,
            device.current_menu_id,
            device.current_step - 1
          );

          const statusMessage = {
            esp_id: id,
            menu_id: device.current_menu_id,
            resume: true,
          };

          await mqttClient.publish(config.mqtt.topics.espStatus, statusMessage);
          console.log(
            `Recovery status sent to ESP ${id}: menu "${recipe.name}" at step ${device.current_step}`
          );
        } else {
          await mqttClient.publish(config.mqtt.topics.espStatus, {
            esp_id: id,
            menu: null,
            resume: false,
          });
        }
      } else {
        await mqttClient.publish(config.mqtt.topics.espStatus, {
          esp_id: id,
          menu: null,
          resume: false,
        });
        console.log(`ESP ${id} is idle, no recovery needed`);
      }
    } catch (error) {
      console.error("Error handling ESP init:", error);
    }
  }

  async handleEspRequestMenu(data) {
    console.log("ESP Request Menu Data:", data);

    const { id } = data;

    if (!id) {
      console.error("Invalid ESP request menu: missing id");
      return;
    }

    try {
      const recipes = await recipeService.getAllRecipes();

      const menuList = recipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
      }));

      const message = {
        esp_id: id,
        menus: menuList,
      };

      await mqttClient.publish(config.mqtt.topics.webMenu, message);

      console.log(`Menu list sent to ESP ${id}: ${menuList.length} items`);
    } catch (error) {
      console.error("Error handling ESP request menu:", error);
    }
  }

  async handleEspRequestMenuDetail(data) {
    console.log("ESP Request Menu Detail Data:", data);

    const { id, menu_id } = data;

    if (!id || !menu_id) {
      console.error("Invalid ESP request menu detail: missing id or menu_id");
      return;
    }

    try {
      let currentStep = await espDeviceService.getDeviceCurrentStep(
        id,
        menu_id
      );

      const recipe = await recipeService.getRecipeById(menu_id);

      if (!recipe) {
        console.error(`Recipe not found: ${menu_id}`);
        return;
      }

      if (
        !recipe.steps ||
        !Array.isArray(recipe.steps) ||
        recipe.steps.length === 0
      ) {
        console.error(`Recipe "${recipe.name}" has no steps`);
        return;
      }

      currentStep++;

      if (currentStep > recipe.steps.length) {
        await espDeviceService.clearDeviceMenu(id);
        console.log(`Recipe ${menu_id} completed for ESP ${id}`);
        return;
      }

      const isLastStep = currentStep === recipe.steps.length;

      if (isLastStep) {
        const device = await espDeviceService.getDeviceByDeviceId(id);
        if (device) {
          await espDeviceService.recordRecipeCompletion(device.id, menu_id);
          console.log(`Recipe completion recorded for ESP ${id}`);
        }
      }

      await espDeviceService.updateDeviceMenuAndStep(id, menu_id, currentStep);

      const step = recipe.steps[currentStep - 1];

      const message = {
        esp_id: id,
        menu_id: menu_id,
        menu_name: recipe.name,
        step_number: currentStep,
        total_steps: recipe.steps.length,
        step: step,
        last_step: isLastStep,
      };

      console.log(message.step);

      await mqttClient.publish(config.mqtt.topics.webMenuDetail, message);

      console.log(
        `Step ${currentStep}/${recipe.steps.length} sent to ESP ${id} for recipe "${recipe.name}"`
      );
    } catch (error) {
      console.error("Error handling ESP request menu detail:", error);
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

      await mqttClient.publish(config.mqtt.topics.webMenu, message);

      console.log(`${menuList.length} menu(s) sent to MQTT`);
      return menuList;
    } catch (error) {
      console.error("Error sending menu list:", error);
      throw error;
    }
  }

  getConnectionStatus() {
    return mqttClient.getConnectionStatus();
  }
}

module.exports = new MQTTService();
