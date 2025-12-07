import { Box } from "@mui/material";

export default function Navbar() {
  return (
    <Box
      component="header"
      sx={{
        py: 3,
        px: { xs: 2, md: 3, lg: 4 },
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {/* Navbar content removed as requested (theme switcher) */}
    </Box>
  );
}
