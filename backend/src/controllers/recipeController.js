const recipeService = require("../services/recipeService");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../utils/constants");

class RecipeController {
  async getAllRecipes(req, res) {
    try {
      const recipes = await recipeService.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.FAILED_TO_FETCH_RECIPES });
    }
  }

  async getRecipeById(req, res) {
    try {
      const { id } = req.params;
      const recipe = await recipeService.getRecipeById(id);

      if (!recipe) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: ERROR_MESSAGES.RECIPE_NOT_FOUND });
      }

      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.FAILED_TO_FETCH_RECIPE });
    }
  }

  async createRecipe(req, res) {
    try {
      const { recipe, steps } = req.body;

      if (!recipe || !steps) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: ERROR_MESSAGES.RECIPE_NAME_AND_STEPS_REQUIRED,
        });
      }

      const newRecipe = await recipeService.createRecipe(recipe, steps);

      res.status(HTTP_STATUS.CREATED).json({
        message: SUCCESS_MESSAGES.RECIPE_CREATED,
        ...newRecipe,
      });
    } catch (error) {
      console.error("Error creating recipe:", error);

      if (
        error.message.includes("step") ||
        error.message.includes("stove_on")
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: error.message });
      }

      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: ERROR_MESSAGES.FAILED_TO_CREATE_RECIPE });
    }
  }

  async deleteRecipe(req, res) {
    try {
      const { id } = req.params;
      const recipe = await recipeService.deleteRecipe(id);

      if (!recipe) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: ERROR_MESSAGES.RECIPE_NOT_FOUND });
      }

      res.json({
        message: SUCCESS_MESSAGES.RECIPE_DELETED,
        recipe,
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to delete recipe" });
    }
  }

  async updateRecipe(req, res) {
    try {
      const { id } = req.params;
      const { recipe, steps } = req.body;

      if (!recipe || !steps) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: ERROR_MESSAGES.RECIPE_NAME_AND_STEPS_REQUIRED,
        });
      }

      const updatedRecipe = await recipeService.updateRecipe(id, recipe, steps);

      if (!updatedRecipe) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: ERROR_MESSAGES.RECIPE_NOT_FOUND });
      }

      res.json({
        message: "Recipe updated successfully",
        ...updatedRecipe,
      });
    } catch (error) {
      console.error("Error updating recipe:", error);

      if (
        error.message.includes("step") ||
        error.message.includes("stove_on")
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: error.message });
      }

      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to update recipe" });
    }
  }
}

module.exports = new RecipeController();
