import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          p: 4,
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "primary.main",
            fontWeight: "bold",
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          Sajipati
        </Typography>

        <Box component="form">
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ textAlign: "left", mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              mb: 3,
              borderRadius: 3,
            }}
          >
            Sign In
          </Button>

          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Box
              component="span"
              sx={{ color: "primary.main", cursor: "pointer", fontWeight: 600 }}
            >
              Sign Up
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
