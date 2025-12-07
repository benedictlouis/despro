import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Stack,
} from "@mui/material";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  drawerWidth: number;
}

export default function Sidebar({
  mobileOpen,
  onClose,
  drawerWidth,
}: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { text: "Home", path: "/" },
    { text: "Dashboard", path: "/dashboard" },
    { text: "Recipes", path: "/recipes" },
  ];

  const drawerContent = (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 4 }}
    >
      {/* Brand - Pure Typography, No Logos/Gradients */}
      <Box sx={{ mb: 8, mt: 2 }}>
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

      {/* Navigation - Clean Links */}
      <List sx={{ px: 0 }}>
        {menuItems.map(({ text, path }) => {
          const isActive = location.pathname === path;
          return (
            <ListItemButton
              key={text}
              component={Link}
              to={path}
              onClick={onClose}
              sx={{
                py: 2,
                px: 2,
                mx: 2,
                borderRadius: 2,
                mb: 1,
                border: "solid",
                borderWidth: isActive ? "0px" : "1px",
                borderColor: "transparent",
                bgcolor: isActive ? "action.selected" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateX(4px)",
                  bgcolor: isActive ? "primary.main" : "transparent",
                },
              }}
            >
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
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer / User - Minimal */}
      <Box sx={{ mt: "auto" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Admin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Kitchen Lead
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
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
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default", // Matches page background
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
