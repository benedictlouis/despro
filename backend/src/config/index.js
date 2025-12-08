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
      espInit: "sajipati/esp/init",
      espRequestMenu: "sajipati/esp/request/menu",
      espRequestMenuDetail: "sajipati/esp/request/menu/detail",
      espStatus: "sajipati/esp/status",
      webMenu: "sajipati/web/menu",
      webMenuDetail: "sajipati/web/menu/detail",
    },
  },
};

module.exports = config;
