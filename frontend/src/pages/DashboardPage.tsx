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
import { useAuth } from "../contexts/AuthContext";
import {
  useDashboardStats,
  useRecipeUsage,
  useCookingStatus,
  useDailyActivity,
} from "../hooks/useDashboard";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
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
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "3rem", md: "4.5rem" },
          }}
        >
          Kitchen Dashboard.
        </Typography>
        {isAuthenticated && (
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
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Recipes"
          value={stats.totalRecipes}
          subtitle="Active recipes in system"
          color="#1976d2"
        />
        <StatCard
          title="Active Devices"
          value={stats.activeDevices}
          subtitle="ESP32 devices connected"
          color="#2e7d32"
        />
        <StatCard
          title="Today's Cookings"
          value={stats.todaysCookings}
          subtitle="Recipes executed today"
          color="#ed6c02"
        />
        <StatCard
          title="Total Completions"
          value={stats.totalCompletions}
          subtitle="All-time recipe completions"
          color="#9c27b0"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 3,
          mb: 3,
        }}
      >
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
            sx={{
              "& .MuiCardHeader-title": {
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              },
              "& .MuiCardHeader-subheader": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
          />
          <CardContent>
            {recipeUsageData.length === 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={250}
              >
                <Typography
                  color="textSecondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  No recipe usage data available
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={recipeUsageData}
                  margin={{ bottom: 60, left: -20, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={9}
                    interval={0}
                    tickFormatter={(value) =>
                      value.length > 15 ? value.substring(0, 15) + "..." : value
                    }
                  />
                  <YAxis fontSize={9} width={40} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
            sx={{
              "& .MuiCardHeader-title": {
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              },
              "& .MuiCardHeader-subheader": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
          />
          <CardContent>
            {cookingStatusData.length === 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={250}
              >
                <Typography
                  color="textSecondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  No cooking status data available
                </Typography>
              </Box>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={cookingStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={70}
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
                        fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 3 }}>
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
            sx={{
              "& .MuiCardHeader-title": {
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              },
              "& .MuiCardHeader-subheader": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
          />
          <CardContent>
            {dailyActivityData.length === 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={250}
              >
                <Typography
                  color="textSecondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  No daily activity data available
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={dailyActivityData}
                  margin={{ left: -20, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    fontSize={9}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={9} width={40} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="recipes"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                    name="Recipes Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
