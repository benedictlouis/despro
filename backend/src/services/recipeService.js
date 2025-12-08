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

  async deleteRecipe(id) {
    const recipe = await this.getRecipeById(id);

    if (!recipe) {
      return null;
    }

    await database.query("DELETE FROM recipes WHERE id = $1", [id]);

    return recipe;
  }

  async updateRecipe(id, recipeName, steps) {
    const recipe = await this.getRecipeById(id);

    if (!recipe) {
      return null;
    }

    const validation = validateRecipeSteps(steps);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    await database.query(
      "UPDATE recipes SET name = $1, steps = $2 WHERE id = $3",
      [recipeName, JSON.stringify(steps), id]
    );

    return {
      id,
      name: recipeName,
      steps: normalizeRecipeSteps(steps),
    };
  }
}

module.exports = new RecipeService();
