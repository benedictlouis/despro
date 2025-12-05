import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import config from "./utils/config";

interface Recipe {
  id: string;
  name: string;
  steps: string[];
  createdAt: string;
}

export default function RecipeForm() {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const API_BASE_URL = config.API_BASE_URL;

  // Load recipes dari backend saat component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !steps.every(step => step.trim())) {
      setMessage("Nama resep dan semua langkah harus diisi!");
      setShowMessage(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipe: name,
          steps: steps.filter(step => step.trim()),
        }),
      });

      if (response.ok) {
        const newRecipe = await response.json();
        setRecipes([...recipes, newRecipe]);
        setName("");
        setSteps([""]);
        setMessage("Resep berhasil disimpan!");
        setShowMessage(true);
      } else {
        throw new Error("Gagal menyimpan resep");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      setMessage("Gagal menyimpan resep ke database");
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const sendToESP32 = async (recipeId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/execute-recipe/${recipeId}`, {
        method: "POST",
      });

      if (response.ok) {
        setMessage("Resep berhasil dikirim ke ESP32!");
        setShowMessage(true);
      } else {
        throw new Error("Gagal mengirim resep");
      }
    } catch (error) {
      console.error("Error sending recipe to ESP32:", error);
      setMessage("Gagal mengirim resep ke ESP32");
      setShowMessage(true);
    }
  };

  return (
    <Box maxWidth={800} mx="auto">
      {/* Form untuk tambah resep */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <RestaurantIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Tambah Resep
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nama Resep"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={loading}
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Langkah-langkah:
          </Typography>
          {steps.map((step, idx) => (
            <Box key={idx} display="flex" alignItems="center" mb={1}>
              <TextField
                label={`Langkah ${idx + 1}`}
                value={step}
                onChange={e => handleStepChange(idx, e.target.value)}
                required
                fullWidth
                size="small"
                disabled={loading}
              />
              {steps.length > 1 && (
                <IconButton
                  aria-label="Hapus langkah"
                  onClick={() => removeStep(idx)}
                  sx={{ ml: 1 }}
                  color="error"
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addStep}
            sx={{ mt: 1, mb: 2 }}
            variant="outlined"
            disabled={loading}
          >
            Tambah Langkah
          </Button>
          <Box>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Resep"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Daftar resep */}
      <Typography variant="h6" gutterBottom>
        Daftar Resep ({recipes.length})
      </Typography>
      <Box display="grid" gap={2}>
        {recipes.map((recipe) => (
          <Card key={recipe.id} elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" component="h3">
                  {recipe.name}
                </Typography>
                <Chip 
                  label={new Date(recipe.createdAt).toLocaleDateString('id-ID')} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Langkah-langkah:
              </Typography>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {recipe.steps.map((step, sidx) => (
                  <li key={sidx} style={{ marginBottom: 4 }}>{step}</li>
                ))}
              </ol>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<SendIcon />}
                onClick={() => sendToESP32(recipe.id)}
                variant="contained"
                color="secondary"
                size="small"
              >
                Kirim ke ESP32
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Snackbar untuk pesan */}
      <Snackbar
        open={showMessage}
        autoHideDuration={4000}
        onClose={() => setShowMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowMessage(false)} 
          severity={message.includes("berhasil") ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}