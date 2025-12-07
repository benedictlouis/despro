import { useState, type ReactNode } from "react";
import {
  Box,
  CssBaseline,
  useTheme,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/MenuRounded";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />

      {/* Sidebar - Clean & Flat */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        drawerWidth={280}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: { md: `calc(100% - 280px)` }, // Adjust width to respect sidebar
          minHeight: "100vh",
        }}
      >
        {/* Mobile Toggle (Only visible on small screens) */}
        {isMobile && (
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Navbar - Transparent & Text Based */}
        <Navbar />

        {/* Content Body - with plenty of breathing room */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3, lg: 4 },
            maxWidth: "1600px",
            mx: "auto",
            width: "100%",
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
