// server.js
const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const pool = require("./connection");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 4321;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MQTT Configuration
// Default broker changed to mqtt.nomaden.cloud per request
const mqttUrl = process.env.MQTT_URL || "mqtt://mqtt.nomaden.cloud:1883";
const baseTopic = process.env.MQTT_BASE_TOPIC || "sajipati";
const client = mqtt.connect(mqttUrl);

client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

client.on("error", (error) => {
  console.error("MQTT connection error:", error);
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected successfully at:", res.rows[0].now);
  }
});

// Routes

// Get all recipes (list)
app.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM recipes ORDER BY created_at DESC"
    );
    const recipes = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      // intentionally omitting steps here for list view; include if needed
    }));
    res.json(recipes);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// Send menu to MQTT (list)
app.post("/send-menu", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM recipes ORDER BY created_at DESC"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No recipes found" });
    }

    const recipes = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    const mqttMessage = {
      menus: recipes,
    };

    client.publish(
      `${baseTopic}/web/menus`,
      JSON.stringify(mqttMessage),
      (error) => {
        if (error) {
          console.error("MQTT publish error:", error);
          return res.status(500).json({ error: "Failed to send menu to MQTT" });
        }

        console.log(`${recipes.length} menu sent to MQTT`);
        res.json({
          message: "Menu sent to MQTT successfully",
          total: recipes.length,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new recipe
app.post("/recipes", async (req, res) => {
  try {
    const { recipe, steps } = req.body;

    if (!recipe || !steps || !Array.isArray(steps)) {
      return res
        .status(400)
        .json({ error: "Recipe name and steps are required" });
    }

    // Validate each step and stove_on
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];

      // Basic shape validation (you can extend as needed)
      if (!s.action || typeof s.action !== "string") {
        return res.status(400).json({
          error: `Each step must have an 'action' (string). Problem at index ${i}`,
        });
      }

      // If stove_on exists, must be "on" or "off"; otherwise default is allowed later
      if (s.stove_on !== undefined && !["on", "off"].includes(s.stove_on)) {
        return res.status(400).json({
          error: `stove_on must be either 'on' or 'off' (problem at step index ${i})`,
        });
      }

      // Validate types of numeric fields if provided
      if (s.temperature !== undefined && typeof s.temperature !== "number") {
        return res.status(400).json({
          error: `temperature must be a number (step index ${i})`,
        });
      }
      if (s.weight !== undefined && typeof s.weight !== "number") {
        return res.status(400).json({
          error: `weight must be a number (step index ${i})`,
        });
      }
      if (s.time !== undefined && typeof s.time !== "number") {
        return res.status(400).json({
          error: `time must be a number (step index ${i})`,
        });
      }
      if (s.motor !== undefined && typeof s.motor !== "boolean") {
        return res.status(400).json({
          error: `motor must be a boolean (step index ${i})`,
        });
      }
    }

    // All validations passed -> create recipe
    const id = uuidv4();

    await pool.query(
      "INSERT INTO recipes (id, name, steps) VALUES ($1, $2, $3)",
      [id, recipe, JSON.stringify(steps)]
    );

    res.status(201).json({
      message: "Recipe created successfully",
      id: id,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

//API for create user
app.post("/users", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username dan password wajib diisi" });
    }

    await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, 'user')",
      [username, password]
    );

    res.json({ message: "User created" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single recipe with formatted steps (ensure stove_on present)
app.get("/recipe/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM recipes WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = result.rows[0];

    // Ensure steps is parsed if stored as text
    const steps =
      typeof recipe.steps === "string"
        ? JSON.parse(recipe.steps)
        : recipe.steps;

    // Always include ALL expected fields with defaults, including stove_on
    const formattedSteps = (steps || []).map((step, index) => ({
      step: index + 1,
      action: step.action ?? "",
      temperature: step.temperature ?? 0,
      weight: step.weight ?? 0,
      time: step.time ?? 0,
      motor: step.motor ?? false,
      stove_on: step.stove_on ?? "off", // <-- ensure default
    }));

    res.json({
      id: recipe.id,
      name: recipe.name,
      steps: formattedSteps,
      createdAt: recipe.created_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// Execute recipe (send to ESP32 via MQTT) - ensures stove_on included
app.post("/execute-recipe/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM recipes WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = result.rows[0];

    // Parse steps if string
    const rawSteps =
      typeof recipe.steps === "string"
        ? JSON.parse(recipe.steps)
        : recipe.steps;

    // Map and ensure defaults for stove_on and other fields
    const normalizedSteps = (rawSteps || []).map((s, idx) => ({
      step: idx + 1,
      action: s.action ?? "",
      temperature: s.temperature ?? 0,
      weight: s.weight ?? 0,
      time: s.time ?? 0,
      motor: s.motor ?? false,
      stove_on: s.stove_on ?? "off", // <-- ensure presence
    }));

    // Publish recipe to MQTT
    const mqttMessage = {
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      steps: normalizedSteps,
      timestamp: new Date().toISOString(),
    };

    client.publish(
      `${baseTopic}/recipe/execute`,
      JSON.stringify(mqttMessage),
      (error) => {
        if (error) {
          console.error("MQTT publish error:", error);
          return res
            .status(500)
            .json({ error: "Failed to send recipe to ESP32" });
        }

        console.log(`Recipe "${recipe.name}" sent to ESP32 via MQTT`);
        res.json({
          message: "Recipe sent to ESP32 successfully",
          recipe_name: recipe.name,
        });
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to execute recipe" });
  }
});

// DELETE /recipes/:id - delete a recipe
app.delete("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if recipe exists
    const check = await pool.query("SELECT id FROM recipes WHERE id = $1", [
      id,
    ]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Delete the recipe
    await pool.query("DELETE FROM recipes WHERE id = $1", [id]);

    res.json({
      message: "Recipe deleted successfully",
      deleted_id: id,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: "connected",
    mqtt: client.connected ? "connected" : "disconnected",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  client.end();
  pool.end();
  process.exit(0);
});
