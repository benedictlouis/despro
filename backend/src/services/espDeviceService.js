const database = require("../utils/database");

class EspDeviceService {
  async registerOrUpdateDevice(deviceId, name) {
    try {
      const existingDevice = await database.query(
        "SELECT * FROM esp_devices WHERE device_id = $1",
        [deviceId]
      );

      let device;
      if (existingDevice.rows.length === 0) {
        const result = await database.query(
          `INSERT INTO esp_devices (device_id, name, status, last_seen) 
           VALUES ($1, $2, $3, NOW()) 
           RETURNING *`,
          [deviceId, name, "idle"]
        );
        device = result.rows[0];
        console.log(`New ESP device registered: ${name} (${deviceId})`);
      } else {
        const result = await database.query(
          `UPDATE esp_devices 
           SET name = $1, status = 'idle', last_seen = NOW() 
           WHERE device_id = $2 
           RETURNING *`,
          [name, deviceId]
        );
        device = result.rows[0];
        console.log(`ESP device updated: ${name} (${deviceId})`);
      }

      return device;
    } catch (error) {
      console.error("Error registering/updating ESP device:", error);
      throw error;
    }
  }

  async getAllDevices() {
    try {
      const result = await database.query(
        `SELECT ed.*, r.name as current_menu_name 
         FROM esp_devices ed 
         LEFT JOIN recipes r ON ed.current_menu_id = r.id 
         ORDER BY ed.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting all devices:", error);
      throw error;
    }
  }

  async getDeviceByDeviceId(deviceId) {
    try {
      const result = await database.query(
        `SELECT * FROM esp_devices WHERE device_id = $1`,
        [deviceId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting device by device_id:", error);
      throw error;
    }
  }

  async getDeviceByName(name) {
    try {
      const result = await database.query(
        `SELECT * FROM esp_devices WHERE name = $1`,
        [name]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting device by name:", error);
      throw error;
    }
  }

  async updateDeviceMenuAndStep(deviceId, menuId, step) {
    try {
      const result = await database.query(
        `UPDATE esp_devices 
         SET current_menu_id = $1, current_step = $2, status = 'active', last_seen = NOW() 
         WHERE device_id = $3 
         RETURNING *`,
        [menuId, step, deviceId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating device menu and step:", error);
      throw error;
    }
  }

  async clearDeviceMenu(deviceId) {
    try {
      const result = await database.query(
        `UPDATE esp_devices 
         SET current_menu_id = NULL, current_step = 0, status = 'idle', last_seen = NOW() 
         WHERE device_id = $1 
         RETURNING *`,
        [deviceId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error clearing device menu:", error);
      throw error;
    }
  }

  async getDeviceCurrentStep(deviceId, menuId) {
    try {
      const result = await database.query(
        `SELECT current_step FROM esp_devices 
         WHERE device_id = $1 AND current_menu_id = $2`,
        [deviceId, menuId]
      );
      return result.rows[0]?.current_step || 0;
    } catch (error) {
      console.error("Error getting device current step:", error);
      throw error;
    }
  }

  async recordRecipeCompletion(espDeviceId, recipeId) {
    try {
      const result = await database.query(
        `INSERT INTO recipe_completions (esp_device_id, recipe_id) 
         VALUES ($1, $2) 
         RETURNING *`,
        [espDeviceId, recipeId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error recording recipe completion:", error);
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
        `SELECT COUNT(*) as count FROM recipe_completions 
         WHERE DATE(completed_at) = CURRENT_DATE`
      );

      const totalCompletions = await database.query(
        "SELECT COUNT(*) as count FROM recipe_completions"
      );

      return {
        totalRecipes: parseInt(totalRecipes.rows[0].count),
        activeDevices: parseInt(activeDevices.rows[0].count),
        todaysCookings: parseInt(todaysCookings.rows[0].count),
        totalCompletions: parseInt(totalCompletions.rows[0].count),
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
         FROM recipe_completions rc 
         JOIN recipes r ON rc.recipe_id = r.id 
         WHERE rc.completed_at >= NOW() - INTERVAL '30 days'
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
         FROM esp_devices 
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
          TO_CHAR(completed_at, 'Dy') as day,
          COUNT(*) as recipes
         FROM recipe_completions 
         WHERE completed_at >= NOW() - INTERVAL '${days} days'
         GROUP BY DATE(completed_at), TO_CHAR(completed_at, 'Dy'), TO_CHAR(completed_at, 'D')
         ORDER BY TO_CHAR(completed_at, 'D')`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting daily activity stats:", error);
      throw error;
    }
  }

  async getDeviceExecutions(deviceId) {
    try {
      return [];
    } catch (error) {
      console.error("Error getting device executions:", error);
      throw error;
    }
  }
}

module.exports = new EspDeviceService();
