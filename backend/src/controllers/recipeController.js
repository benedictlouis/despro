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
}

module.exports = new RecipeController();
