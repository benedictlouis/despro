import { createTheme, type ThemeOptions } from "@mui/material/styles";

// Common Overrides for a Clean Look
const commonOverrides: ThemeOptions["components"] = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 12, // Small/Medium rounding
        padding: "10px 24px",
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
      },
      contained: {
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        boxShadow: "none",
        border: "1px solid",
      },
      elevation1: { boxShadow: "none" }, // Remove default shadows
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: "none",
        backgroundColor: "transparent", // Let background show through
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 600 },
      filled: { border: "none" },
    },
  },
};

// Earthy Terra - Warm, inviting, and natural.
const earthyTerraTheme: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#8d4025" }, // Terracotta
    secondary: { main: "#e6ccb2" }, // Sand
    background: { default: "#fbf7f4", paper: "#ffffff" },
    text: { primary: "#4a2c21", secondary: "#7d5a4f" },
    action: { selected: "#8d4025" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Space Grotesk", sans-serif',
    h1: { fontFamily: '"DM Serif Display", serif' },
    h2: { fontFamily: '"DM Serif Display", serif' },
    h3: { fontFamily: '"DM Serif Display", serif' },
    h4: { fontFamily: '"DM Serif Display", serif' },
    h5: { fontFamily: '"DM Serif Display", serif' },
    h6: { fontFamily: '"DM Serif Display", serif' },
  },
  components: {
    ...commonOverrides,
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: "#fbf7f4" } },
    },
    MuiPaper: { styleOverrides: { root: { borderColor: "#e6ccb2" } } },
  },
};

export const theme = createTheme(earthyTerraTheme);
