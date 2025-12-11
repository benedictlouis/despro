import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Stack,
  Avatar,
  Divider,
  Button,
  IconButton,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PeopleIcon from "@mui/icons-material/People";
import DevicesIcon from "@mui/icons-material/Devices";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  drawerWidth: number;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({
  mobileOpen,
  onClose,
  drawerWidth,
  onCollapsedChange,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isGuest } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const collapsedWidth = 80;
  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

  const menuItems = [
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { text: "Recipes", path: "/recipes", icon: <RestaurantMenuIcon /> },
    { text: "Devices", path: "/devices", icon: <DevicesIcon /> },
    ...(user?.role === "admin"
      ? [{ text: "Users", path: "/users", icon: <PeopleIcon /> }]
      : []),
  ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: collapsed ? 2 : 4,
      }}
    >
      <Box
        sx={{
          mb: collapsed ? 4 : 8,
          mt: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!collapsed && (
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "primary.main",
              }}
            >
              Sajipati.
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              KITCHEN AUTOMATION
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={toggleCollapse}
          sx={{
            display: { xs: "none", md: "flex" },
            ml: collapsed ? "auto" : 0,
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <List sx={{ px: 0 }}>
        {menuItems.map(({ text, path, icon }) => {
          const isActive = location.pathname === path;
          const button = (
            <ListItemButton
              key={text}
              component={Link}
              to={path}
              onClick={onClose}
              sx={{
                py: 2,
                px: 2,
                mx: collapsed ? 0 : 2,
                borderRadius: 2,
                mb: 1,
                border: "solid",
                borderWidth: isActive ? "0px" : "1px",
                borderColor: "transparent",
                bgcolor: isActive ? "action.selected" : "transparent",
                transition: "all 0.2s ease",
                justifyContent: collapsed ? "center" : "flex-start",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: collapsed ? "scale(1.05)" : "translateX(4px)",
                  bgcolor: isActive ? "primary.main" : "transparent",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? "auto" : 56,
                  color: isActive ? "background.default" : "primary.main",
                  justifyContent: "center",
                }}
              >
                {icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    variant: "h6",
                    sx: {
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "background.default" : "primary.main",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: isActive ? "background.default" : "primary.main",
                      },
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={text} title={text} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ mb: 2 }} />
        {!collapsed ? (
          <Stack spacing={2}>
            {isGuest ? (
              <>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: "grey.500" }}>
                    <AccountCircleIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Guest
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Read-only access
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AccountCircleIcon />}
                  onClick={() => navigate("/signin")}
                  sx={{
                    py: 1,
                    bgcolor: "primary.main",
                    color: "background.default",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{ width: 40, height: 40, bgcolor: "primary.main" }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.role === "admin" ? "Administrator" : "User"}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    py: 1,
                    borderColor: "divider",
                    color: "text.primary",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center">
            {isGuest ? (
              <>
                <Tooltip title="Guest" placement="right">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: "grey.500" }}>
                    <AccountCircleIcon />
                  </Avatar>
                </Tooltip>
                <Tooltip title="Login" placement="right">
                  <IconButton
                    onClick={() => navigate("/signin")}
                    color="primary"
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={user?.username || ""} placement="right">
                  <Avatar
                    sx={{ width: 40, height: 40, bgcolor: "primary.main" }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                </Tooltip>
                <Tooltip title="Logout" placement="right">
                  <IconButton onClick={handleLogout} color="primary">
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: currentWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
            bgcolor: "background.default",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: currentWidth,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            transition: "width 0.3s ease",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
