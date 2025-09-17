require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mqtt = require("mqtt");
const pool = require("./connection");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Import UUID untuk id unik
const { v4: uuidv4 } = require("uuid");

// POST /recipes - simpan resep baru
app.post("/recipes", async (req, res) => {
  const { recipe, steps } = req.body;

  if (!recipe || !steps) {
    return res.status(400).json({ error: "recipe dan steps wajib diisi" });
  }

  // Data resep
  const newRecipe = {
    id: uuidv4(),
    name: recipe,
    steps: steps,
    createdAt: new Date().toISOString(),
  };

  // Kalau masih pakai file JSON (lowdb)
  // db.data.recipes.push(newRecipe);
  // await db.write();

  // Kalau pakai PostgreSQL (connection.js)
  try {
    const pool = require("./connection");
    await pool.query(
      "INSERT INTO recipes (id, name, steps, created_at) VALUES ($1, $2, $3, $4)",
      [
        newRecipe.id,
        newRecipe.name,
        JSON.stringify(newRecipe.steps),
        newRecipe.createdAt,
      ]
    );
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "gagal simpan ke database" });
  }
});

// REST endpoint simple
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// GET /recipes - ambil semua resep
app.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");

    // Kalau kolom steps sudah berupa JSON/JSONB, tidak perlu di-parse lagi
    const recipes = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      steps: r.steps, // langsung pakai
      createdAt: r.created_at,
    }));

    res.json(recipes);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "gagal mengambil data dari database" });
  }
});

// MQTT connect
const mqttClient = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT");
  mqttClient.subscribe(`${process.env.MQTT_BASE_TOPIC}/+/sensor/#`);
});

mqttClient.on("message", (topic, msg) => {
  console.log("MQTT <-", topic, msg.toString());
  io.emit("device_event", { topic, payload: msg.toString() });
});

// WebSocket
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// Jalankan server
const PORT = process.env.PORT || 4321;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
