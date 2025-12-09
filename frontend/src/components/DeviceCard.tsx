import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  Divider,
} from "@mui/material";

interface EspDevice {
  id: string;
  name: string;
  status: string;
  current_recipe_id: string | null;
  recipe_name: string | null;
  current_step: number | null;
  last_seen: string;
  created_at: string;
}

interface DeviceCardProps {
  device: EspDevice;
  onClick: (device: EspDevice) => void;
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, "warning" | "success" | "error" | "default"> =
    {
      active: "warning",
      idle: "success",
      offline: "error",
    };
  return statusMap[status] || "default";
};

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: "Active",
    idle: "Idle",
    offline: "Offline",
  };
  return labelMap[status] || status;
};

const getLastSeen = (lastSeen: string) => {
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const getDeviceStatusText = (device: EspDevice) => {
  if (device.status === "active" && device.recipe_name) {
    return `Processing: ${device.recipe_name}`;
  }
  if (device.status === "idle") {
    return "Ready for recipes";
  }
  return "Device disconnected";
};

export default function DeviceCard({ device, onClick }: DeviceCardProps) {
  return (
    <Card
      elevation={0}
      onClick={() => onClick(device)}
      sx={{
        cursor: "pointer",
        border: "1px solid",
        borderColor: "transparent",
        borderRadius: 3,
        bgcolor: "background.paper",
        transition: "transform 0.3s ease, border-color 0.3s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              DEVICE
            </Typography>
            <Chip
              label={getStatusLabel(device.status)}
              color={getStatusColor(device.status)}
              size="small"
            />
          </Stack>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {device.name}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {getDeviceStatusText(device)}
          </Typography>
        </Box>

        <Divider />

        <Stack spacing={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Last seen:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {getLastSeen(device.last_seen)}
            </Typography>
          </Box>
          {device.status === "active" && device.current_step && (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Current step:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {device.current_step}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
