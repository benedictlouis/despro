import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
} from "@mui/material";
import {
  Restaurant,
  Devices,
  Cloud,
} from "@mui/icons-material";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Recipe Management",
      description: "Create and organize your recipes effortlessly.",
    },
    {
      icon: <Devices sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Device Control",
      description: "Control kitchen devices in real-time via MQTT.",
    },
    {
      icon: <Cloud sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Cloud Sync",
      description: "Access your recipes from anywhere, anytime.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(180deg, #fbf7f4 0%, #f5ebe3 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(141, 64, 37, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(30%, -30%)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(230, 204, 178, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(-30%, 30%)",
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", position: "relative", zIndex: 1, py: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: "4rem", md: "6rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Sajipati.
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                mb: 6,
                lineHeight: 1.7,
                fontWeight: 400,
                maxWidth: "750px",
                mx: "auto",
                px: 2,
              }}
            >
              Your intelligent kitchen companion for managing recipes and controlling devices.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/signin")}
              sx={{
                px: 5,
                py: 1.75,
                fontSize: "1.05rem",
                boxShadow: "0 4px 14px rgba(141, 64, 37, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(141, 64, 37, 0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: "background.paper", py: { xs: 10, md: 14 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 8,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Features
          </Typography>

          <Grid container spacing={5}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 4 }} key={index}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(141, 64, 37, 0.03)",
                      transform: "translateY(-8px)",
                    },
                  }}
                >
                  <Box 
                    sx={{ 
                      mb: 2.5,
                      display: "inline-flex",
                      p: 2.5,
                      borderRadius: "16px",
                      bgcolor: "rgba(141, 64, 37, 0.08)",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "700",
                      color: "text.primary",
                      mb: 1.5,
                      fontSize: "1.15rem",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.7,
                      fontSize: "0.95rem",
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 15 },
          background: "linear-gradient(135deg, #8d4025 0%, #a0522d 100%)",
          color: "background.paper",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            opacity: 0.4,
          },
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.25rem" },
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              opacity: 0.95,
              fontSize: "1.1rem",
            }}
          >
            Join Sajipati and streamline your kitchen operations today.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/signin")}
            sx={{
              bgcolor: "background.paper",
              color: "primary.main",
              px: 5,
              py: 1.75,
              fontSize: "1.05rem",
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                bgcolor: "#f5ebe3",
                transform: "translateY(-3px)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Sign In
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          mt: "auto",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "text.secondary" }}
          >
            © {new Date().getFullYear()} Sajipati. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
