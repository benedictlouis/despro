import React, { useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Box,
} from "@mui/material";

interface FormData {
  name: string;
  email: string;
  role: string;
  subscribe: boolean;
}

export default function MyForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    subscribe: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: 300 }}
    >
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <TextField
        select
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange}
      >
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="user">User</MenuItem>
        <MenuItem value="guest">Guest</MenuItem>
      </TextField>

      <FormControlLabel
        control={
          <Checkbox
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleChange}
          />
        }
        label="Subscribe to newsletter"
      />

      <Button variant="contained" type="submit">
        Submit
      </Button>
    </Box>
  );
}
