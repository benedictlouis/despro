const express = require("express");
const recipeController = require("../controllers/recipeController");
const mqttController = require("../controllers/mqttController");
const healthController = require("../controllers/healthController");

const setupRoutes = (app) => {
  app.get("/recipes", recipeController.getAllRecipes.bind(recipeController));
  app.get("/recipe/:id", recipeController.getRecipeById.bind(recipeController));
  app.post("/recipes", recipeController.createRecipe.bind(recipeController));

  app.post("/send-menu", mqttController.sendMenu.bind(mqttController));
  app.post(
    "/execute-recipe/:id",
    mqttController.executeRecipe.bind(mqttController)
  );

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
