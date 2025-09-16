require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// REST endpoint simple
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// MQTT connect
const mqttClient = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
});

mqttClient.on('connect', () => {
  console.log("Connected to MQTT");
  mqttClient.subscribe(`${process.env.MQTT_BASE_TOPIC}/+/sensor/#`);
});

mqttClient.on('message', (topic, msg) => {
  console.log("MQTT <-", topic, msg.toString());
  io.emit("device_event", { topic, payload: msg.toString() });
});

// WebSocket
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// Jalankan server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
