import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Chip,
  LinearProgress,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import "../styles/dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import apiClient from "../utils/apiClient";

// Sample data - replace with real API calls
const recipeUsageData = [
  { name: "Nasi Goreng", count: 45, color: "#8884d8" },
  { name: "Ayam Bakar", count: 32, color: "#82ca9d" },
  { name: "Rendang", count: 28, color: "#ffc658" },
  { name: "Soto Ayam", count: 23, color: "#ff7300" },
  { name: "Gado-gado", count: 18, color: "#00ff88" },
];

const dailyActivityData = [
  { day: "Mon", recipes: 12, actions: 45 },
  { day: "Tue", recipes: 19, actions: 52 },
  { day: "Wed", recipes: 15, actions: 38 },
  { day: "Thu", recipes: 22, actions: 61 },
  { day: "Fri", recipes: 18, actions: 42 },
  { day: "Sat", recipes: 25, actions: 68 },
  { day: "Sun", recipes: 14, actions: 35 },
];

const temperatureData = [
  { time: "00:00", temp: 25 },
  { time: "04:00", temp: 23 },
  { time: "08:00", temp: 28 },
  { time: "12:00", temp: 35 },
  { time: "16:00", temp: 38 },
  { time: "20:00", temp: 32 },
  { time: "23:59", temp: 27 },
];

const cookingStatusData = [
  { name: "Completed", value: 68, color: "#00C49F" },
  { name: "In Progress", value: 15, color: "#FFBB28" },
  { name: "Failed", value: 12, color: "#FF8042" },
  { name: "Cancelled", value: 5, color: "#8884d8" },
];

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface DashboardStats {
  totalRecipes: number;
  activeDevices: number;
  todaysCookings: number;
  successRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRecipes: 0,
    activeDevices: 0,
    todaysCookings: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sendingMenu, setSendingMenu] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch total recipes from API
      const recipes = await apiClient.get<Array<{ id: string }>>("/recipes");

      setStats({
        totalRecipes: recipes.length, // Get actual count from API
        activeDevices: 3,
        todaysCookings: 25,
        successRate: 92.5,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to default values
      setStats({
        totalRecipes: 0,
        activeDevices: 3,
        todaysCookings: 25,
        successRate: 92.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMenuToMQTT = async () => {
    setSendingMenu(true);
    try {
      const data = await apiClient.post<{ total: number }>("/send-menu");

      setSnackbar({
        open: true,
        message: `Successfully sent ${data.total} recipes to MQTT broker!`,
        severity: "success",
      });
      // Refresh stats after sending menu
      fetchStats();
    } catch (error) {
      console.error("Error sending menu:", error);
      const message = error instanceof Error ? error.message : "Failed to send menu to MQTT";
      setSnackbar({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setSendingMenu(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    color = "primary.main",
    progress,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    progress?: number;
  }) => (
    <Card sx={{ height: "100%" }} className="dashboard-card">
      <CardContent>
        <Typography color="textSecondary" gutterBottom variant="overline">
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{ color, fontWeight: "bold" }}
        >
          {loading ? <CircularProgress size={24} /> : value}
        </Typography>
        {subtitle && (
          <Typography color="textSecondary" variant="body2">
            {subtitle}
          </Typography>
        )}
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: color,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading && stats.totalRecipes === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" component="h1">
          Kitchen Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            sendingMenu ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          onClick={handleSendMenuToMQTT}
          disabled={sendingMenu}
          sx={{
            px: 3,
            py: 1.5,
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {sendingMenu ? "Sending..." : "Send Menu"}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
          <StatCard
            title="Total Recipes"
            value={stats.totalRecipes}
            subtitle="Active recipes in system"
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
          <StatCard
            title="Active Devices"
            value={stats.activeDevices}
            subtitle="ESP32 devices connected"
            color="#2e7d32"
          />
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
          <StatCard
            title="Today's Cookings"
            value={stats.todaysCookings}
            subtitle="Recipes executed today"
            color="#ed6c02"
          />
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            subtitle="Recipe completion rate"
            color="#00C49F"
            progress={stats.successRate}
          />
        </Box>
      </Box>

      {/*
<Box mb={4}>
  <Card sx={{ backgroundColor: '#e3f2fd' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <RestaurantIcon sx={{ fontSize: 40, color: '#1976d2' }} />
          <Box>
            <Typography variant="h6" color="primary">
              Send all menu
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            sendingMenu ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          onClick={handleSendMenuToMQTT}
          disabled={sendingMenu}
          size="large"
        >
          {sendingMenu ? 'Sending...' : 'Send'}
        </Button>
      </Box>
    </CardContent>
  </Card>
</Box>
*/}

      {/* Charts Row 1 */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {/* Recipe Usage Chart */}
        <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
          <Card className="dashboard-card">
            <CardHeader
              title="Most Used Recipes"
              subheader="Recipe execution frequency this month"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recipeUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Cooking Status Pie Chart */}
        <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
          <Card>
            <CardHeader
              title="Cooking Status Distribution"
              subheader="Recipe execution results"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cookingStatusData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 2,
                  justifyContent: "center",
                }}
              >
                {cookingStatusData.map((entry, index) => (
                  <Chip
                    key={entry.name}
                    label={`${entry.name}: ${entry.value}`}
                    size="small"
                    sx={{
                      backgroundColor: COLORS[index % COLORS.length],
                      color: "white",
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts Row 2 */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {/* Daily Activity Line Chart */}
        <Box sx={{ flex: "1 1 500px", minWidth: "500px" }}>
          <Card>
            <CardHeader
              title="Weekly Activity"
              subheader="Daily recipes and actions executed"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="recipes"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 5 }}
                    name="Recipes"
                  />
                  <Line
                    type="monotone"
                    dataKey="actions"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    dot={{ fill: "#82ca9d", strokeWidth: 2, r: 5 }}
                    name="Actions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Temperature Monitor */}
        <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
          <Card>
            <CardHeader
              title="Kitchen Temperature"
              subheader="Temperature monitoring throughout the day"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value}°C`, "Temperature"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#ff7300"
                    fill="#ff7300"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Device Status Cards */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Device Status
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">ESP32-Kitchen-01</Typography>
                  <Typography color="textSecondary" variant="body2">
                    Main cooking unit
                  </Typography>
                </Box>
                <Chip label="Online" color="success" size="small" />
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Last seen: 2 minutes ago
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Temp: 28°C | Status: Idle
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">ESP32-Kitchen-02</Typography>
                  <Typography color="textSecondary" variant="body2">
                    Secondary unit
                  </Typography>
                </Box>
                <Chip label="Online" color="success" size="small" />
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Last seen: 5 minutes ago
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Temp: 32°C | Status: Cooking
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">ESP32-Kitchen-03</Typography>
                  <Typography color="textSecondary" variant="body2">
                    Backup unit
                  </Typography>
                </Box>
                <Chip label="Offline" color="error" size="small" />
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Last seen: 2 hours ago
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Temp: -- | Status: Disconnected
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
