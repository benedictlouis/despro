const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  RECIPE_NOT_FOUND: "Recipe not found",
  FAILED_TO_FETCH_RECIPES: "Failed to fetch recipes",
  FAILED_TO_FETCH_RECIPE: "Failed to fetch recipe",
  FAILED_TO_CREATE_RECIPE: "Failed to create recipe",
  RECIPE_NAME_AND_STEPS_REQUIRED: "Recipe name and steps are required",
  FAILED_TO_SEND_MENU: "Failed to send menu to MQTT",
  FAILED_TO_EXECUTE_RECIPE: "Failed to execute recipe",
  NO_RECIPES_FOUND: "No recipes found",
  ROUTE_NOT_FOUND: "Route not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

const SUCCESS_MESSAGES = {
  RECIPE_CREATED: "Recipe created successfully",
  MENU_SENT: "Menu sent to MQTT successfully",
  RECIPE_SENT: "Recipe sent to ESP32 successfully",
};

const DATABASE_ERRORS = {
  CONNECTION_FAILED: "Database connection failed",
  QUERY_ERROR: "Database query error",
};

const MQTT_ERRORS = {
  CONNECTION_ERROR: "MQTT connection error",
  PUBLISH_ERROR: "MQTT publish error",
  NOT_CONNECTED: "MQTT client not connected",
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATABASE_ERRORS,
  MQTT_ERRORS,
};
