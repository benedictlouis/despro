// components/MainLayout.tsx
import { useState, type ReactNode } from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [open, setOpen] = useState(true);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar (This component is correct as-is) */}
      <Sidebar open={open} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // This correctly fills the remaining space
        }}
      >
        {/* Navbar */}
        <Navbar onToggle={handleToggle} />

        {/* Content Body */}
        <Box sx={{ marginTop: 8, p: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}