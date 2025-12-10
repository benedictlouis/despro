import { useState, useEffect, useMemo } from "react";
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
  DialogContentText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import RecipeCard from "../components/RecipeCard";
import apiClient from "../utils/apiClient";
import { useToast } from "../contexts/ToastContext";

interface RecipeStep {
  step?: number;
  action: string;
  parameter_type?: string;
  parameter_value?: number | string | boolean;
  mix_duration?: number | string;
  time?: number;
  ingredient?: string;
  temperature?: number;
  weight?: number;
  motor?: boolean;
  stove_on?: boolean;
}

interface Recipe {
  id: string;
  name: string;
  steps?: RecipeStep[];
  createdAt?: string;
}

export default function RecipePage() {
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [steps, setSteps] = useState<RecipeStep[]>([
    {
      action: "",
      parameter_type: "",
      parameter_value: 0,
      mix_duration: "",
    },
  ]);

  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  const parameterTypes = ["time", "temperature", "weight", "stove", "mix"];

  const getParameterPlaceholder = (type: string) => {
    switch (type) {
      case "time":
        return "Enter time in seconds";
      case "temperature":
        return "Enter temperature in °C";
      case "weight":
        return "Enter weight in grams";
      case "stove":
        return "on/off";
      case "mix":
        return "on/off";
      default:
        return "";
    }
  };

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

  const handleSubmit = async () => {
    try {
      // Convert parameter_type and parameter_value back to original format
      const formattedSteps = steps.map((step) => {
        const baseStep: any = { action: step.action };

        if (step.parameter_type && step.parameter_value !== undefined && step.parameter_value !== "") {
          switch (step.parameter_type) {
            case "time":
              baseStep.time = Number(step.parameter_value);
              break;
            case "temperature":
              baseStep.temperature = Number(step.parameter_value);
              break;
            case "weight":
              baseStep.weight = Number(step.parameter_value);
              break;
            case "stove":
              baseStep.stove_on = step.parameter_value === "on" || step.parameter_value === true;
              break;
            case "mix":
              baseStep.motor = step.parameter_value === "on" || step.parameter_value === true;
              if (step.mix_duration) {
                baseStep.time = Number(step.mix_duration);
              }
              break;
          }
        }

        return baseStep;
      });

      if (editingRecipe) {
        await apiClient.put(`/recipes/${editingRecipe.id}`, {
          recipe: recipeName,
          steps: formattedSteps,
        });
        showToast("Recipe updated successfully", "success");
      } else {
        await apiClient.post("/recipes", {
          recipe: recipeName,
          steps: formattedSteps,
        });
        showToast("Recipe created successfully", "success");
      }

      setOpenDialog(false);
      setRecipeName("");
      setSteps([
        {
          action: "",
          parameter_type: "",
          parameter_value: 0,
          mix_duration: "",
        },
      ]);
      setEditingRecipe(null);
      fetchRecipes();
    } catch (error) {
      console.error("Error saving recipe:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save recipe";
      showToast(message, "error");
    }
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        action: "",
        parameter_type: "",
        parameter_value: 0,
        mix_duration: "",
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

  const handleEdit = async (recipe: Recipe) => {
    try {
      const fullRecipe = await apiClient.get<Recipe>(`/recipe/${recipe.id}`);
      setEditingRecipe(fullRecipe);
      setRecipeName(fullRecipe.name);
      const recipeSteps = Array.isArray(fullRecipe.steps)
        ? fullRecipe.steps
        : [];

      // Convert backend format to UI format
      const convertedSteps = recipeSteps.map((step) => {
        const converted: RecipeStep = { action: step.action || "" };

        // Priority-based detection: check which field has meaningful value
        // Motor takes priority (even if motor=true with time=0)
        if (step.motor === true) {
          converted.parameter_type = "mix";
          converted.parameter_value = "on";
          converted.mix_duration = step.time || "";
        } 
        // Stove takes priority (explicit on/off)
        else if (step.stove_on === true) {
          converted.parameter_type = "stove";
          converted.parameter_value = true;
        }
        // Check for non-zero values in order of priority
        else if (step.weight !== undefined && step.weight > 0) {
          converted.parameter_type = "weight";
          converted.parameter_value = step.weight;
        } 
        else if (step.temperature !== undefined && step.temperature > 0) {
          converted.parameter_type = "temperature";
          converted.parameter_value = step.temperature;
        } 
        else if (step.time !== undefined && step.time > 0) {
          converted.parameter_type = "time";
          converted.parameter_value = step.time;
        }
        // Last resort: stove off (if explicitly set and nothing else)
        else if (step.stove_on === false && step.temperature === 0 && step.weight === 0 && step.time === 0 && !step.motor) {
          converted.parameter_type = "stove";
          converted.parameter_value = false;
        }
        // No parameter selected
        else {
          converted.parameter_type = "";
          converted.parameter_value = 0;
          converted.mix_duration = "";
        }

        return converted;
      });

      setSteps(
        convertedSteps.length > 0
          ? convertedSteps
          : [
              {
                action: "",
                parameter_type: "",
                parameter_value: 0,
                mix_duration: "",
              },
            ]
      );
      setOpenDialog(true);
    } catch (error) {
      console.error("Error loading recipe:", error);
      showToast("Failed to load recipe details", "error");
    }
  };

  const handleDeleteClick = (recipeId: string) => {
    setRecipeToDelete(recipeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      await apiClient.delete(`/recipes/${recipeToDelete}`);
      showToast("Recipe deleted successfully", "success");
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
      fetchRecipes();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      showToast("Failed to delete recipe", "error");
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setRecipeName("");
    setSteps([
      {
        action: "",
        parameter_type: "",
        parameter_value: 0,
        mix_duration: "",
      },
    ]);
    setEditingRecipe(null);
  };

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
                    <RecipeCard
                      recipe={recipe}
                      onDelete={handleDeleteClick}
                      onEdit={handleEdit}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
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
            {editingRecipe ? "Edit Recipe" : "New Recipe"}
          </Typography>
          <IconButton onClick={handleDialogClose}>
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
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Action"
                    fullWidth
                    size="small"
                    value={step.action}
                    onChange={(e) =>
                      handleStepChange(index, "action", e.target.value)
                    }
                    placeholder="e.g., Add water, Mix ingredients, Turn on stove..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Parameter Type"
                    fullWidth
                    size="small"
                    value={step.parameter_type || ""}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newSteps = [...steps];
                      newSteps[index] = {
                        ...newSteps[index],
                        parameter_type: newType,
                        parameter_value:
                          newType === "mix" ? true : newType === "stove" ? false : "",
                        mix_duration: "",
                      };
                      setSteps(newSteps);
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {parameterTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {step.parameter_type === "stove" ||
                  step.parameter_type === "mix" ? (
                    <TextField
                      select
                      label="Value"
                      fullWidth
                      size="small"
                      disabled={!step.parameter_type}
                      value={step.parameter_value === true ? "on" : "off"}
                      onChange={(e) =>
                        handleStepChange(
                          index,
                          "parameter_value",
                          e.target.value === "on"
                        )
                      }
                    >
                      <MenuItem value="off">OFF</MenuItem>
                      <MenuItem value="on">ON</MenuItem>
                    </TextField>
                  ) : (
                    <TextField
                      label="Value"
                      fullWidth
                      size="small"
                      disabled={!step.parameter_type}
                      value={step.parameter_value ?? ""}
                      placeholder={
                        step.parameter_type
                          ? getParameterPlaceholder(step.parameter_type)
                          : "Select parameter type first"
                      }
                      onChange={(e) => {
                        let value: string | number = e.target.value;
                        if (
                          step.parameter_type === "time" ||
                          step.parameter_type === "temperature" ||
                          step.parameter_type === "weight"
                        ) {
                          value = e.target.value;
                        }
                        handleStepChange(index, "parameter_value", value);
                      }}
                    />
                  )}
                </Grid>
                {step.parameter_type === "mix" && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Mix Duration (seconds)"
                      fullWidth
                      size="small"
                      value={step.mix_duration ?? ""}
                      placeholder="Enter duration in seconds"
                      onChange={(e) =>
                        handleStepChange(index, "mix_duration", e.target.value)
                      }
                    />
                  </Grid>
                )}
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
          <Button onClick={handleDialogClose} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={!recipeName}
            sx={{ borderRadius: 3, px: 4 }}
          >
            {editingRecipe ? "Update Recipe" : "Create Recipe"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Delete Recipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this recipe? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}