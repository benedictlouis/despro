const database = require("../utils/database");

class EspDeviceService {
  async updateOrCreateDevice(name, stepId, step) {
    try {
      const existingDevice = await database.query(
        "SELECT * FROM esp_devices WHERE name = $1",
        [name]
      );

      let device;
      if (existingDevice.rows.length === 0) {
        const result = await database.query(
          `INSERT INTO esp_devices (name, status, current_step, last_seen) 
           VALUES ($1, $2, $3, NOW()) 
           RETURNING *`,
          [name, stepId ? "active" : "idle", step || null]
        );
        device = result.rows[0];
      } else {
        const status = stepId ? "active" : "idle";
        const result = await database.query(
          `UPDATE esp_devices 
           SET status = $1, current_step = $2, last_seen = NOW() 
           WHERE name = $3 
           RETURNING *`,
          [status, step || null, name]
        );
        device = result.rows[0];
      }

      return device;
    } catch (error) {
      console.error("Error updating/creating ESP device:", error);
      throw error;
    }
  }

  async updateDeviceRecipe(name, recipeId, step) {
    try {
      const result = await database.query(
        `UPDATE esp_devices 
         SET current_recipe_id = $1, current_step = $2, status = 'active', last_seen = NOW() 
         WHERE name = $3 
         RETURNING *`,
        [recipeId, step, name]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating device recipe:", error);
      throw error;
    }
  }

  async setDeviceIdle(name) {
    try {
      const result = await database.query(
        `UPDATE esp_devices 
         SET status = 'idle', current_recipe_id = NULL, current_step = NULL, last_seen = NOW() 
         WHERE name = $1 
         RETURNING *`,
        [name]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error setting device idle:", error);
      throw error;
    }
  }

  async getAllDevices() {
    try {
      const result = await database.query(
        `SELECT ed.*, r.name as recipe_name 
         FROM esp_devices ed 
         LEFT JOIN recipes r ON ed.current_recipe_id = r.id 
         ORDER BY ed.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting all devices:", error);
      throw error;
    }
  }

  async getDeviceByName(name) {
    try {
      const result = await database.query(
        `SELECT ed.*, r.name as recipe_name 
         FROM esp_devices ed 
         LEFT JOIN recipes r ON ed.current_recipe_id = r.id 
         WHERE ed.name = $1`,
        [name]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting device by name:", error);
      throw error;
    }
  }

  async startRecipeExecution(deviceId, recipeId) {
    try {
      const result = await database.query(
        `INSERT INTO recipe_executions (esp_device_id, recipe_id, status, last_step) 
         VALUES ($1, $2, 'in_progress', 0) 
         RETURNING *`,
        [deviceId, recipeId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error starting recipe execution:", error);
      throw error;
    }
  }

  async updateRecipeExecution(
    deviceId,
    recipeId,
    step,
    status = "in_progress"
  ) {
    try {
      const result = await database.query(
        `UPDATE recipe_executions 
         SET last_step = $1, status = $2, completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END 
         WHERE esp_device_id = $3 AND recipe_id = $4 AND status = 'in_progress' 
         RETURNING *`,
        [step, status, deviceId, recipeId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating recipe execution:", error);
      throw error;
    }
  }

  async getDeviceExecutions(deviceId) {
    try {
      const result = await database.query(
        `SELECT re.*, r.name as recipe_name 
         FROM recipe_executions re 
         JOIN recipes r ON re.recipe_id = r.id 
         WHERE re.esp_device_id = $1 
         ORDER BY re.started_at DESC 
         LIMIT 10`,
        [deviceId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting device executions:", error);
      throw error;
    }
  }

  async markDeviceOffline(name) {
    try {
      const device = await this.getDeviceByName(name);
      if (!device) return null;

      if (device.status === "active" && device.current_recipe_id) {
        await database.query(
          `UPDATE recipe_executions 
           SET status = 'interrupted' 
           WHERE esp_device_id = $1 AND recipe_id = $2 AND status = 'in_progress'`,
          [device.id, device.current_recipe_id]
        );
      }

      const result = await database.query(
        `UPDATE esp_devices 
         SET status = 'offline' 
         WHERE name = $1 
         RETURNING *`,
        [name]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error marking device offline:", error);
      throw error;
    }
  }

  async checkOfflineDevices(timeoutMinutes = 5) {
    try {
      const result = await database.query(
        `UPDATE esp_devices 
         SET status = 'offline' 
         WHERE last_seen < NOW() - INTERVAL '${timeoutMinutes} minutes' 
         AND status != 'offline' 
         RETURNING *`
      );
      return result.rows;
    } catch (error) {
      console.error("Error checking offline devices:", error);
      throw error;
    }
  }

  async getInterruptedRecipe(deviceId) {
    try {
      const result = await database.query(
        `SELECT re.*, r.name as recipe_name 
         FROM recipe_executions re 
         JOIN recipes r ON re.recipe_id = r.id 
         WHERE re.esp_device_id = $1 AND re.status = 'interrupted' 
         ORDER BY re.started_at DESC 
         LIMIT 1`,
        [deviceId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting interrupted recipe:", error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const totalRecipes = await database.query(
        "SELECT COUNT(*) as count FROM recipes"
      );

      const activeDevices = await database.query(
        "SELECT COUNT(*) as count FROM esp_devices WHERE status IN ('active', 'idle')"
      );

      const todaysCookings = await database.query(
        `SELECT COUNT(*) as count FROM recipe_executions 
         WHERE DATE(started_at) = CURRENT_DATE`
      );

      const successRate = await database.query(
        `SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(*) as total
         FROM recipe_executions 
         WHERE started_at >= NOW() - INTERVAL '30 days'`
      );

      const completed = parseInt(successRate.rows[0].completed) || 0;
      const total = parseInt(successRate.rows[0].total) || 0;
      const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

      return {
        totalRecipes: parseInt(totalRecipes.rows[0].count),
        activeDevices: parseInt(activeDevices.rows[0].count),
        todaysCookings: parseInt(todaysCookings.rows[0].count),
        successRate: parseFloat(rate),
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  async getRecipeUsageStats(limit = 5) {
    try {
      const result = await database.query(
        `SELECT r.name, COUNT(*) as count 
         FROM recipe_executions re 
         JOIN recipes r ON re.recipe_id = r.id 
         WHERE re.started_at >= NOW() - INTERVAL '30 days'
         GROUP BY r.id, r.name 
         ORDER BY count DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting recipe usage stats:", error);
      throw error;
    }
  }

  async getCookingStatusStats() {
    try {
      const result = await database.query(
        `SELECT 
          status,
          COUNT(*) as value
         FROM recipe_executions 
         WHERE started_at >= NOW() - INTERVAL '30 days'
         GROUP BY status`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting cooking status stats:", error);
      throw error;
    }
  }

  async getDailyActivityStats(days = 7) {
    try {
      const result = await database.query(
        `SELECT 
          TO_CHAR(started_at, 'Dy') as day,
          COUNT(*) as recipes,
          SUM(last_step) as actions
         FROM recipe_executions 
         WHERE started_at >= NOW() - INTERVAL '${days} days'
         GROUP BY DATE(started_at), TO_CHAR(started_at, 'Dy'), TO_CHAR(started_at, 'D')
         ORDER BY TO_CHAR(started_at, 'D')`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting daily activity stats:", error);
      throw error;
    }
  }
}

module.exports = new EspDeviceService();
