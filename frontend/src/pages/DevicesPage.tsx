import { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Fade,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Divider,
  Card,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DevicesIcon from "@mui/icons-material/Devices";
import LinkIcon from "@mui/icons-material/Link";
import DeviceCard from "../components/DeviceCard";
import apiClient from "../utils/apiClient";

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

const getStatusChipColor = (status: string) => {
  const colorMap: Record<string, "warning" | "success" | "error" | "default"> =
    {
      active: "warning",
      idle: "success",
      offline: "error",
    };
  return colorMap[status] || "default";
};

const getStatusChipLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: "Active",
    idle: "Idle",
    offline: "Offline",
  };
  return labelMap[status] || status;
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<EspDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<EspDevice | null>(null);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<EspDevice[]>("/esp-devices");
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = useMemo(
    () =>
      devices.filter((device) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [devices, searchTerm]
  );

  const handleDeviceClick = (device: EspDevice) => {
    setSelectedDevice(device);
    setDeviceDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: "3rem", md: "4.5rem" },
          }}
        >
          Devices.
        </Typography>
        <Typography
          variant="h5"
          sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 600 }}
        >
          Monitor and manage your connected ESP32 devices.
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search devices..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", md: 300 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "background.paper",
              "& fieldset": { borderColor: "divider" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredDevices.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm
                  ? "No devices found matching your search."
                  : "No ESP devices found. Devices will appear here when they connect via MQTT."}
              </Typography>
            </Grid>
          ) : (
            filteredDevices.map((device, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={device.id}>
                <Fade
                  in
                  timeout={500}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Box height="100%">
                    <DeviceCard device={device} onClick={handleDeviceClick} />
                  </Box>
                </Fade>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog
        open={deviceDialogOpen}
        onClose={() => setDeviceDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: { xs: 1, md: 3 } } }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          pt={2}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
          >
            DEVICE DETAILS
          </Typography>
          <IconButton onClick={() => setDeviceDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          {selectedDevice && (
            <>
              <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <DevicesIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {selectedDevice.name}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      mt: 1,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: `${getStatusChipColor(
                        selectedDevice.status
                      )}.light`,
                      color: `${getStatusChipColor(
                        selectedDevice.status
                      )}.dark`,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {getStatusChipLabel(selectedDevice.status)}
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Device Information
              </Typography>

              <Stack spacing={2} mb={4}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1" color="text.secondary">
                    Device ID:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedDevice.id}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1" color="text.secondary">
                    Status:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedDevice.status === "active"
                      ? "Currently processing"
                      : selectedDevice.status === "idle"
                      ? "Ready for new recipes"
                      : "Disconnected from network"}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1" color="text.secondary">
                    Last Seen:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(selectedDevice.last_seen).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1" color="text.secondary">
                    Created At:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(selectedDevice.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>

              {selectedDevice.status === "active" &&
                selectedDevice.recipe_name && (
                  <>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Current Recipe
                    </Typography>

                    <Card
                      elevation={0}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                        mb: 2,
                      }}
                    >
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {selectedDevice.recipe_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Recipe ID: {selectedDevice.current_recipe_id}
                          </Typography>
                        </Box>
                        {selectedDevice.current_step && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Current Step:
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={700}
                              color="primary"
                            >
                              Step {selectedDevice.current_step}
                            </Typography>
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<LinkIcon />}
                          href="/recipes"
                          sx={{ borderRadius: 2 }}
                        >
                          View Recipe Details
                        </Button>
                      </Stack>
                    </Card>
                  </>
                )}

              {selectedDevice.status === "idle" && (
                <Box
                  sx={{
                    bgcolor: "success.light",
                    color: "success.dark",
                    p: 3,
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    This device is ready to process new recipes
                  </Typography>
                </Box>
              )}

              {selectedDevice.status === "offline" && (
                <Box
                  sx={{
                    bgcolor: "error.light",
                    color: "error.dark",
                    p: 3,
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    This device is currently offline
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Check power connection and network status
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
