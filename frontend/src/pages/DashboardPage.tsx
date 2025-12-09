import { useState } from "react";
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
} from "recharts";
import apiClient from "../utils/apiClient";
import { useToast } from "../contexts/ToastContext";
import {
  useDashboardStats,
  useRecipeUsage,
  useCookingStatus,
  useDailyActivity,
} from "../hooks/useDashboard";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const { showToast } = useToast();
  const [sendingMenu, setSendingMenu] = useState(false);

  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStats();
  const { data: recipeUsageData, loading: recipeUsageLoading } =
    useRecipeUsage(5);
  const { data: cookingStatusData, loading: cookingStatusLoading } =
    useCookingStatus();
  const { data: dailyActivityData, loading: dailyActivityLoading } =
    useDailyActivity(7);

  const loading =
    statsLoading ||
    recipeUsageLoading ||
    cookingStatusLoading ||
    dailyActivityLoading;

  const handleSendMenuToMQTT = async () => {
    setSendingMenu(true);
    try {
      const data = await apiClient.post<{ total: number }>("/send-menu");
      showToast(
        `Successfully sent ${data.total} recipes to MQTT broker!`,
        "success"
      );
      refetchStats();
    } catch (error) {
      console.error("Error sending menu:", error);
      const message =
        error instanceof Error ? error.message : "Failed to send menu to MQTT";
      showToast(message, "error");
    } finally {
      setSendingMenu(false);
    }
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
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: 2,
      }}
    >
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
    <Container maxWidth="xl" style={{ overflowY: "auto" }}>
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
            title="Total Completions"
            value={stats.totalCompletions}
            subtitle="All-time recipe completions"
            color="#9c27b0"
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 2,
            }}
          >
            <CardHeader
              title="Most Used Recipes"
              subheader="Recipe execution frequency this month"
            />
            <CardContent>
              {recipeUsageData.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={300}
                >
                  <Typography color="textSecondary">
                    No recipe usage data available
                  </Typography>
                </Box>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 2,
            }}
          >
            <CardHeader
              title="Device Status"
              subheader="Current device distribution"
            />
            <CardContent>
              {cookingStatusData.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={300}
                >
                  <Typography color="textSecondary">
                    No cooking status data available
                  </Typography>
                </Box>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: "1 1 500px", minWidth: "500px" }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 2,
            }}
          >
            <CardHeader
              title="Weekly Activity"
              subheader="Daily recipe completions"
            />
            <CardContent>
              {dailyActivityData.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={300}
                >
                  <Typography color="textSecondary">
                    No daily activity data available
                  </Typography>
                </Box>
              ) : (
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
                      name="Recipes Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
