import { Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import type { ReactNode } from "react";

const drawerWidthOpen = 240;
const drawerWidthClosed = 60;

interface SidebarProps {
  open: boolean;
}

interface MenuItem {
  text: string;
  icon: ReactNode;
  path?: string;
}

export default function Sidebar({ open }: SidebarProps) {
  const menuItems: MenuItem[] = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Recipe", icon: <LocalDiningIcon />, path: "/recipes" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidthOpen : drawerWidthClosed,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidthOpen : drawerWidthClosed,
          transition: "width 0.3s",
          overflowX: "hidden",
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map(({ text, icon, path }) => (
          <ListItemButton
            key={text}
            component={Link}
            to={path || "/"}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              {icon}
            </ListItemIcon>
            {open && <ListItemText primary={text} />}
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
