const express = require("express");
const recipeController = require("../controllers/recipeController");
const mqttController = require("../controllers/mqttController");
const healthController = require("../controllers/healthController");
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");

const setupRoutes = (app) => {
  // User routes
  app.post("/register", userController.register.bind(userController));
  app.post("/login", userController.login.bind(userController));
  app.post("/refresh", userController.refreshToken.bind(userController));
  app.post("/logout", userController.logout.bind(userController));
  app.get("/me", authenticate, userController.getMe.bind(userController));

  // Recipe routes
  app.get("/recipes", recipeController.getAllRecipes.bind(recipeController));
  app.get("/recipe/:id", recipeController.getRecipeById.bind(recipeController));
  app.post("/recipes", recipeController.createRecipe.bind(recipeController));

  // MQTT routes
  app.post("/send-menu", mqttController.sendMenu.bind(mqttController));
  app.post(
    "/execute-recipe/:id",
    mqttController.executeRecipe.bind(mqttController)
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
  app.post(
    "/api/mqtt/execute-recipe/:id",
    mqttController.executeRecipe.bind(mqttController)
  );
  app.get("/api/health", healthController.getHealth.bind(healthController));
};

module.exports = setupRoutes;
