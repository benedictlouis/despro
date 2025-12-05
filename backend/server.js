const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const pool = require('./connection');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4321;

// Middleware
app.use(cors());
app.use(express.json());

// MQTT Configuration
// Default broker changed to mqtt.nomaden.cloud per request
const mqttUrl = process.env.MQTT_URL || 'mqtt://mqtt.nomaden.cloud:1883';
const baseTopic = process.env.MQTT_BASE_TOPIC || 'kitchen';
const client = mqtt.connect(mqttUrl);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
  console.error('MQTT connection error:', error);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Routes

// Get all recipes
app.get('/recipes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
    const recipes = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      // steps: row.steps,
      // createdAt: row.created_at
    }));
    res.json(recipes);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.post('/send-menu', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recipes ORDER BY created_at DESC'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No recipes found' });
    }

    const recipes = result.rows.map(row => ({
      id: row.id,
      name: row.name,
    }));

    const mqttMessage = {
      menus: recipes
    };

    client.publish(
      `${baseTopic}/web/menus`,
      JSON.stringify(mqttMessage),
      (error) => {
        if (error) {
          console.error('MQTT publish error:', error);
          return res.status(500).json({ error: 'Failed to send menu to MQTT' });
        }

        console.log(`${recipes.length} menu sent to MQTT`);
        res.json({
          message: 'Menu sent to MQTT successfully',
          total: recipes.length
        });
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new recipe
app.post('/recipes', async (req, res) => {
  try {
    const { recipe, steps } = req.body;
    
    if (!recipe || !steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Recipe name and steps are required' });
    }

    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO recipes (id, name, steps) VALUES ($1, $2, $3)',
      [id, recipe, JSON.stringify(steps)]
    );
    
    res.status(201).json({ 
      message: 'Recipe created successfully',
      id: id 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

app.get('/recipe/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM recipes WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = result.rows[0];

    // Ensure steps is parsed if stored as text
    const steps = typeof recipe.steps === "string"
      ? JSON.parse(recipe.steps)
      : recipe.steps;

    // Always include ALL fields with defaults
    const formattedSteps = steps.map((step, index) => ({
      step: index + 1,

      action: step.action ?? "",
      temperature: step.temperature ?? 0,
      weight: step.weight ?? 0,
      time: step.time ?? 0,
      motor: step.motor ?? false
    }));

    res.json({
      id: recipe.id,
      name: recipe.name,
      steps: formattedSteps,
      createdAt: recipe.created_at
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// Execute recipe (send to ESP32 via MQTT)
app.post('/execute-recipe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = result.rows[0];
    
    // Publish recipe to MQTT
    const mqttMessage = {
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      steps: recipe.steps,
      timestamp: new Date().toISOString()
    };

    client.publish(`${baseTopic}/recipe/execute`, JSON.stringify(mqttMessage), (error) => {
      if (error) {
        console.error('MQTT publish error:', error);
        return res.status(500).json({ error: 'Failed to send recipe to ESP32' });
      }
      
      console.log(`Recipe "${recipe.name}" sent to ESP32 via MQTT`);
      res.json({ 
        message: 'Recipe sent to ESP32 successfully',
        recipe_name: recipe.name
      });
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to execute recipe' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    mqtt: client.connected ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  client.end();
  pool.end();
  process.exit(0);
});