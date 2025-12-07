import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    activeDevices: 0,
    todaysCookings: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<{
        totalRecipes: number;
        activeDevices: number;
        todaysCookings: number;
        successRate: number;
      }>("/dashboard/stats");
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};

export const useRecipeUsage = (limit: number = 5) => {
  const [data, setData] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const result = await apiClient.get<
        Array<{ name: string; count: number }>
      >(`/dashboard/recipe-usage?limit=${limit}`);
      setData(result);
    } catch (error) {
      console.error("Error fetching recipe usage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  return { data, loading, refetch: fetchData };
};

export const useCookingStatus = () => {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const result = await apiClient.get<
        Array<{ status: string; value: number }>
      >("/dashboard/cooking-status");
      const statusMapping: Record<string, string> = {
        completed: "Completed",
        in_progress: "In Progress",
        interrupted: "Interrupted",
      };
      const formatted = result.map((item) => ({
        name: statusMapping[item.status] || item.status,
        value: parseInt(item.value.toString()),
      }));
      setData(formatted);
    } catch (error) {
      console.error("Error fetching cooking status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
};

export const useDailyActivity = (days: number = 7) => {
  const [data, setData] = useState<
    Array<{ day: string; recipes: number; actions: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const result = await apiClient.get<
        Array<{ day: string; recipes: number; actions: number }>
      >(`/dashboard/daily-activity?days=${days}`);
      const formatted = result.map((item) => ({
        day: item.day,
        recipes: parseInt(item.recipes.toString()),
        actions: parseInt(item.actions.toString()) || 0,
      }));
      setData(formatted);
    } catch (error) {
      console.error("Error fetching daily activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  return { data, loading, refetch: fetchData };
};
