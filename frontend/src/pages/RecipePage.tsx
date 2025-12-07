import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Fade,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  MenuItem,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import RecipeCard from "../components/RecipeCard";
import apiClient from "../utils/apiClient";

// --- ORIGINAL INTERFACES ---
interface RecipeStep {
  action: string;
  temperature: number;
  weight: number;
  time: number;
  motor: boolean;
  stove_on: string;
}

interface Recipe {
  id: string;
  name: string;
  steps: RecipeStep[];
  createdAt: string;
}

export default function RecipePage() {
  // --- ORIGINAL STATE ---
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [steps, setSteps] = useState<RecipeStep[]>([
    {
      action: "",
      temperature: 0,
      weight: 0,
      time: 0,
      motor: false,
      stove_on: "off",
    },
  ]);

  const actionOptions = [
    "turn_on",
    "turn_off",
    "wait",
    "stir",
    "crack",
    "fry",
    "set_temperature",
    "add",
    "mix",
    "boil",
    "bake",
    "serve",
  ];

  // --- ORIGINAL LOGIC RESTORED ---
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Recipe[]>("/recipes");
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendToESP32 = useCallback(async (recipeId: string) => {
    try {
      const result = await apiClient.post<{ recipe_name: string }>(
        `/execute-recipe/${recipeId}`
      );
      alert(`Recipe "${result.recipe_name}" sent to ESP32 successfully!`);
    } catch (error) {
      console.error("Error sending recipe to ESP32:", error);
      const message = error instanceof Error ? error.message : "Error sending recipe to ESP32";
      alert(`Failed to send recipe: ${message}`);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      await apiClient.post("/recipes", {
        recipe: recipeName,
        steps: steps,
      });
      
      setOpenDialog(false);
      setRecipeName("");
      setSteps([
        {
          action: "",
          temperature: 0,
          weight: 0,
          time: 0,
          motor: false,
          stove_on: "off",
        },
      ]);
      fetchRecipes();
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe");
    }
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        action: "",
        temperature: 0,
        weight: 0,
        time: 0,
        motor: false,
        stove_on: "off",
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (
    index: number,
    field: keyof RecipeStep,
    value: string | number | boolean
  ) => {
    const newSteps = [...steps];
    // @ts-ignore
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [recipes, searchTerm]
  );
  // -----------------------------

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: "3rem", md: "4.5rem" },
          }}
        >
          Recipes.
        </Typography>
        <Typography
          variant="h5"
          sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 600 }}
        >
          Manage your automated kitchen workflow.
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search recipes..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", md: 300 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "background.paper",
              "& fieldset": { borderColor: "divider" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 3,
            px: 3,
            borderWidth: 1,
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderWidth: 1,
              borderColor: "primary.main",
              bgcolor: "transparent",
            },
          }}
        >
          Create New
        </Button>
      </Box>

      {/* Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredRecipes.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" color="text.secondary">
                No recipes found.
              </Typography>
            </Grid>
          ) : (
            filteredRecipes.map((recipe, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={recipe.id}>
                <Fade
                  in
                  timeout={500}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Box height="100%">
                    <RecipeCard recipe={recipe} onSendToESP32={sendToESP32} />
                  </Box>
                </Fade>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* CREATE RECIPE DIALOG (Restored Logic, New Design) */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h5" component="div" fontWeight={700}>
            New Recipe
          </Typography>
          <IconButton onClick={() => setOpenDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Recipe Name"
            fullWidth
            variant="outlined"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            sx={{ mb: 4, mt: 2 }}
          />

          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              fontWeight: 700,
              letterSpacing: 1,
              color: "text.secondary",
            }}
          >
            STEPS SEQUENCE
          </Typography>

          {steps.map((step, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 4,
                bgcolor: "action.hover", // Subtle gray/transparency
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Step {index + 1}
                </Typography>
                {steps.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveStep(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Action"
                    fullWidth
                    size="small"
                    value={step.action}
                    onChange={(e) =>
                      handleStepChange(index, "action", e.target.value)
                    }
                  >
                    {actionOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.replace(/_/g, " ").toUpperCase()}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    type="number"
                    label="Time (s)"
                    fullWidth
                    size="small"
                    value={step.time}
                    onChange={(e) =>
                      handleStepChange(index, "time", Number(e.target.value))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    type="number"
                    label="Temp (°C)"
                    fullWidth
                    size="small"
                    value={step.temperature}
                    onChange={(e) =>
                      handleStepChange(
                        index,
                        "temperature",
                        Number(e.target.value)
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    type="number"
                    label="Weight (g)"
                    fullWidth
                    size="small"
                    value={step.weight}
                    onChange={(e) =>
                      handleStepChange(index, "weight", Number(e.target.value))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    select
                    label="Stove"
                    fullWidth
                    size="small"
                    value={step.stove_on}
                    onChange={(e) =>
                      handleStepChange(index, "stove_on", e.target.value)
                    }
                  >
                    <MenuItem value="off">OFF</MenuItem>
                    <MenuItem value="on">ON</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddStep}
            fullWidth
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              color: "text.secondary",
            }}
          >
            Add Next Step
          </Button>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={!recipeName}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Create Recipe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
