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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const drawerWidth = 280;
  const collapsedWidth = 80;
  const currentWidth = sidebarCollapsed ? collapsedWidth : drawerWidth;

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
        drawerWidth={drawerWidth}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: { md: `calc(100% - ${currentWidth}px)` },
          minHeight: "100vh",
          transition: "width 0.3s ease",
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
