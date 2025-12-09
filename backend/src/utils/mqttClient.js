const mqtt = require("mqtt");
const config = require("../config");

class MQTTClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(config.mqtt.url);

      this.client.on("connect", () => {
        console.log("Connected to MQTT broker");
        this.isConnected = true;

        this.subscribe(config.mqtt.topics.espInit, () => {
          console.log("Subscribed to ESP init topic");
        });

        this.subscribe(config.mqtt.topics.espRequestMenu, () => {
          console.log("Subscribed to ESP request menu topic");
        });

        this.subscribe(config.mqtt.topics.espRequestMenuDetail, () => {
          console.log("Subscribed to ESP request menu detail topic");
        });

        resolve();
      });

      this.client.on("message", (topic, payload) => {
        this.handleMessage(topic, payload);
      });

      this.client.on("error", (error) => {
        console.error("MQTT connection error:", error);
        this.isConnected = false;
        reject(error);
      });

      this.client.on("close", () => {
        this.isConnected = false;
        console.log("MQTT connection closed");
      });
    });
  }

  subscribe(topic, callback) {
    this.client.subscribe([topic], callback);
  }

  publish(topic, message, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        return reject(new Error("MQTT client not connected"));
      }

      const payload =
        typeof message === "string" ? message : JSON.stringify(message);

      this.client.publish(topic, payload, options, (error) => {
        if (error) {
          console.error("MQTT publish error:", error);
          return reject(error);
        }
        resolve();
      });
    });
  }

  registerMessageHandler(topic, handler) {
    this.messageHandlers.set(topic, handler);
  }

  handleMessage(topic, payload) {
    const handler = this.messageHandlers.get(topic);
    if (handler) {
      try {
        const data = JSON.parse(payload.toString());
        handler(data);
      } catch (error) {
        console.error("Error handling MQTT message:", error);
      }
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      console.log("MQTT client disconnected");
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

module.exports = new MQTTClient();
