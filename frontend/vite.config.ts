import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "mui-core": ["@mui/material", "@mui/system", "@mui/styled-engine"],
          "mui-icons": ["@mui/icons-material"],
          charts: ["recharts"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
