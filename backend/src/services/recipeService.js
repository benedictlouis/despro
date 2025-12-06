const { v4: uuidv4 } = require("uuid");
const database = require("../utils/database");
const {
  validateRecipeSteps,
  normalizeRecipeSteps,
} = require("../utils/validators");

class RecipeService {
  async getAllRecipes() {
    const result = await database.query(
      "SELECT * FROM recipes ORDER BY created_at DESC"
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
    }));
  }

  async getRecipeById(id) {
    const result = await database.query("SELECT * FROM recipes WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const recipe = result.rows[0];
    const steps =
      typeof recipe.steps === "string"
        ? JSON.parse(recipe.steps)
        : recipe.steps;

    return {
      id: recipe.id,
      name: recipe.name,
      steps: normalizeRecipeSteps(steps),
      createdAt: recipe.created_at,
    };
  }

  async createRecipe(recipeName, steps) {
    const validation = validateRecipeSteps(steps);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const id = uuidv4();

    await database.query(
      "INSERT INTO recipes (id, name, steps) VALUES ($1, $2, $3)",
      [id, recipeName, JSON.stringify(steps)]
    );

    return {
      id,
      name: recipeName,
      steps: normalizeRecipeSteps(steps),
    };
  }

  async getRecipeSteps(id) {
    const recipe = await this.getRecipeById(id);

    if (!recipe) {
      return null;
    }

    return recipe.steps;
  }

  async getRecipeForExecution(id) {
    const recipe = await this.getRecipeById(id);

    if (!recipe) {
      return null;
    }

    return {
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      steps: recipe.steps,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new RecipeService();
