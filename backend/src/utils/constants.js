const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  // Recipe errors
  RECIPE_NOT_FOUND: "Recipe not found",
  FAILED_TO_FETCH_RECIPES: "Failed to fetch recipes",
  FAILED_TO_FETCH_RECIPE: "Failed to fetch recipe",
  FAILED_TO_CREATE_RECIPE: "Failed to create recipe",
  RECIPE_NAME_AND_STEPS_REQUIRED: "Recipe name and steps are required",
  FAILED_TO_SEND_MENU: "Failed to send menu to MQTT",
  FAILED_TO_EXECUTE_RECIPE: "Failed to execute recipe",
  NO_RECIPES_FOUND: "No recipes found",

  // Auth errors
  USERNAME_PASSWORD_REQUIRED: "Username and password are required",
  USERNAME_ALREADY_EXISTS: "Username already exists",
  INVALID_CREDENTIALS: "Invalid username or password",
  ACCESS_TOKEN_MISSING: "Access token missing",
  INVALID_ACCESS_TOKEN: "Invalid or expired access token",
  REFRESH_TOKEN_REQUIRED: "Refresh token is required",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "Unauthorized",
  ACCESS_DENIED: "Access denied. Admin privileges required.",

  // General errors
  ROUTE_NOT_FOUND: "Route not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

const SUCCESS_MESSAGES = {
  RECIPE_CREATED: "Recipe created successfully",
  RECIPE_DELETED: "Recipe deleted successfully",
  MENU_SENT: "Menu sent to MQTT successfully",
  RECIPE_SENT: "Recipe sent to ESP32 successfully",

  USER_REGISTERED: "User registered successfully",
  LOGIN_SUCCESSFUL: "Login successful",
  LOGOUT_SUCCESSFUL: "Logout successful",
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
