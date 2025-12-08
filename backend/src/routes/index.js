const express = require("express");
const recipeController = require("../controllers/recipeController");
const mqttController = require("../controllers/mqttController");
const healthController = require("../controllers/healthController");
const userController = require("../controllers/userController");
const espDeviceController = require("../controllers/espDeviceController");
const authenticate = require("../middleware/authenticate");
const adminOnly = require("../middleware/adminOnly");

const setupRoutes = (app) => {
  // User routes
  app.post("/register", userController.register.bind(userController));
  app.post("/login", userController.login.bind(userController));
  app.post("/refresh", userController.refreshToken.bind(userController));
  app.post("/logout", userController.logout.bind(userController));
  app.get("/me", authenticate, userController.getMe.bind(userController));
  app.get(
    "/users",
    authenticate,
    adminOnly,
    userController.getAllUsers.bind(userController)
  );
  app.post(
    "/users",
    authenticate,
    adminOnly,
    userController.adminCreateUser.bind(userController)
  );
  app.delete(
    "/users/:id",
    authenticate,
    adminOnly,
    userController.deleteUser.bind(userController)
  );

  // Recipe routes
  app.get("/recipes", recipeController.getAllRecipes.bind(recipeController));
  app.get("/recipe/:id", recipeController.getRecipeById.bind(recipeController));
  app.post("/recipes", recipeController.createRecipe.bind(recipeController));
  app.delete(
    "/recipes/:id",
    recipeController.deleteRecipe.bind(recipeController)
  );
  app.put("/recipes/:id", recipeController.updateRecipe.bind(recipeController));

  // MQTT routes
  app.post("/send-menu", mqttController.sendMenu.bind(mqttController));

  // ESP Device routes
  app.get(
    "/esp-devices",
    espDeviceController.getAllDevices.bind(espDeviceController)
  );
  app.get(
    "/esp-devices/:name",
    espDeviceController.getDeviceByName.bind(espDeviceController)
  );
  app.get(
    "/esp-devices/:id/executions",
    espDeviceController.getDeviceExecutions.bind(espDeviceController)
  );

  // Dashboard stats routes
  app.get(
    "/dashboard/stats",
    espDeviceController.getDashboardStats.bind(espDeviceController)
  );
  app.get(
    "/dashboard/recipe-usage",
    espDeviceController.getRecipeUsageStats.bind(espDeviceController)
  );
  app.get(
    "/dashboard/cooking-status",
    espDeviceController.getCookingStatusStats.bind(espDeviceController)
  );
  app.get(
    "/dashboard/daily-activity",
    espDeviceController.getDailyActivityStats.bind(espDeviceController)
  );

  // Health check
  app.get("/health", healthController.getHealth.bind(healthController));

  app.get(
    "/api/recipes",
    recipeController.getAllRecipes.bind(recipeController)
  );
  app.get(
    "/api/recipes/:id",
    recipeController.getRecipeById.bind(recipeController)
  );
  app.post(
    "/api/recipes",
    recipeController.createRecipe.bind(recipeController)
  );
  app.post("/api/mqtt/send-menu", mqttController.sendMenu.bind(mqttController));
  app.get("/api/health", healthController.getHealth.bind(healthController));
};

module.exports = setupRoutes;
