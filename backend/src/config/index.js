require("dotenv").config();

const config = {
  port: process.env.PORT || 4321,

  database: {
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
  },

  mqtt: {
    url: process.env.MQTT_URL || "mqtt://mqtt.nomaden.cloud:1883",
    baseTopic: process.env.MQTT_BASE_TOPIC || "sajipati",
    topics: {
      espRequest: "sajipati/esp/request",
      webMenus: "sajipati/web/menus",
      webRecipeSteps: "sajipati/web/recipe/steps",
      recipeExecute: "sajipati/recipe/execute",
    },
  },
};

module.exports = config;
