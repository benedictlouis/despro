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
  const { name, steps } = req.body;

  if (!name || !steps) {
    return res.status(400).json({
      error: "name dan steps wajib diisi",
    });
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({
      error: "steps harus berupa array dan tidak boleh kosong",
    });
  }

  // VALIDASI isi tiap step
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];

    if (
      s.step === undefined ||
      s.action === undefined ||
      s.temperature === undefined ||
      s.weight === undefined ||
      s.time === undefined ||
      s.motor === undefined
    ) {
      return res.status(400).json({
        error: `Step ke-${
          i + 1
        } tidak lengkap. Semua field (step, action, temperature, weight, time, motor) wajib ada.`,
        step_error: s,
      });
    }
  }

  const newRecipe = {
    id: uuidv4(),
    name,
    steps,
    createdAt: new Date().toISOString(),
  };

  try {
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
    console.error("Insert error:", err);
    res.status(500).json({ error: "gagal simpan ke database" });
  }
});

// GET /recipes - get all recipes
app.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");

    const recipes = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      steps: r.steps,
      createdAt: r.created_at,
    }));

    res.json(recipes);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "gagal mengambil data dari database" });
  }
});

// GET /recipes/:id - get recipe by id
app.get("/recipes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM recipes WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resep tidak ditemukan" });
    }

    const r = result.rows[0];

    res.json({
      id: r.id,
      name: r.name,
      steps: r.steps,
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "gagal mengambil data dari database" });
  }
});

// PUT /recipes/:id - update resep
app.put("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const { name, steps } = req.body;

  if (!name && !steps) {
    return res.status(400).json({
      error: "Minimal harus ada name atau steps untuk update",
    });
  }

  try {
    const result = await pool.query("SELECT * FROM recipes WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resep tidak ditemukan" });
    }

    const existing = result.rows[0];

    const updatedRecipe = {
      id,
      name: name || existing.name,
      steps: steps || existing.steps,
      createdAt: existing.created_at,
    };

    await pool.query("UPDATE recipes SET name = $1, steps = $2 WHERE id = $3", [
      updatedRecipe.name,
      JSON.stringify(updatedRecipe.steps),
      id,
    ]);

    res.json(updatedRecipe);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "gagal update data di database" });
  }
});

// DELETE /recipes/:id - hapus resep
app.delete("/recipes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM recipes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resep tidak ditemukan" });
    }

    res.json({
      message: "Resep berhasil dihapus",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "gagal menghapus data dari database" });
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
