const { Pool } = require("pg");
const config = require("../config");

class Database {
  constructor() {
    this.pool = new Pool(config.database);
    this.pool.on("error", (err) => {
      console.error("Unexpected database error:", err);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log("Executed query", { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const result = await this.query("SELECT NOW()");
      console.log("Database connected successfully at:", result.rows[0].now);
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }

  async close() {
    await this.pool.end();
    console.log("Database connection closed");
  }
}

module.exports = new Database();
