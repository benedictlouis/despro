import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import RecipeCard from '../components/RecipeCard';

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

const API_BASE_URL = "http://localhost:4321";

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [steps, setSteps] = useState<RecipeStep[]>([
    { action: '', temperature: 0, weight: 0, time: 0, motor: false, stove_on: 'off' }
  ]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    recipeId: string | null;
    recipeName: string;
  }>({
    open: false,
    recipeId: null,
    recipeName: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const actionOptions = [
    'turn_on', 'turn_off', 'wait', 'stir', 'crack', 'fry', 
    'set_temperature', 'add', 'mix', 'boil', 'bake', 'serve'
  ];

  // Fetch recipes from backend
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        console.error('Failed to fetch recipes');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendToESP32 = async (recipeId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/execute-recipe/${recipeId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setSnackbar({
          open: true,
          message: `Recipe "${result.recipe_name}" sent to ESP32 successfully!`,
          severity: 'success'
        });
      } else {
        const error = await response.json();
        setSnackbar({
          open: true,
          message: `Failed to send recipe: ${error.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error sending recipe to ESP32:', error);
      setSnackbar({
        open: true,
        message: 'Error sending recipe to ESP32',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (recipeId: string, recipeName: string) => {
    setDeleteDialog({
      open: true,
      recipeId,
      recipeName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.recipeId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${deleteDialog.recipeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Recipe "${deleteDialog.recipeName}" deleted successfully!`,
          severity: 'success'
        });
        fetchRecipes();
      } else {
        const error = await response.json();
        setSnackbar({
          open: true,
          message: error.error || 'Failed to delete recipe',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting recipe',
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, recipeId: null, recipeName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, recipeId: null, recipeName: '' });
  };

  const handleAddStep = () => {
    setSteps([...steps, { action: '', temperature: 0, weight: 0, time: 0, motor: false, stove_on: 'off' }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, field: keyof RecipeStep, value: string | number | boolean) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe: recipeName,
          steps: steps,
        }),
      });

      if (response.ok) {
        setOpenDialog(false);
        setRecipeName('');
        setSteps([{ action: '', temperature: 0, weight: 0, time: 0, motor: false, stove_on: 'off' }]);
        setSnackbar({
          open: true,
          message: 'Recipe created successfully!',
          severity: 'success'
        });
        fetchRecipes();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create recipe',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      setSnackbar({
        open: true,
        message: 'Error creating recipe',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Kitchen Recipes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add New Recipe
        </Button>
      </Box>

      {/* Recipes List */}
      {recipes.length === 0 ? (
        <Alert severity="info">
          No recipes found. Create your first recipe to get started!
        </Alert>
      ) : (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 2
          }}
        >
          {recipes.map((recipe) => (
            <Box key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                onSendToESP32={sendToESP32}
                onDelete={handleDeleteClick}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Create Recipe Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Recipe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Recipe Name"
            fullWidth
            variant="outlined"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant="h6" gutterBottom>
            Recipe Steps
          </Typography>

          {steps.map((step, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 2, 
                p: 2, 
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                border: '1px solid #ddd'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip 
                  label={`Step ${index + 1}`} 
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
                {steps.length > 1 && (
                  <IconButton 
                    onClick={() => handleRemoveStep(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              {/* Row 1: Action */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  select
                  label="Action *"
                  fullWidth
                  value={step.action}
                  onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                  required
                >
                  {actionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.replace(/_/g, ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Row 2: Temperature and Weight */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    label="Temperature (°C)"
                    type="number"
                    fullWidth
                    value={step.temperature}
                    onChange={(e) => handleStepChange(index, 'temperature', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    label="Weight (g)"
                    type="number"
                    fullWidth
                    value={step.weight}
                    onChange={(e) => handleStepChange(index, 'weight', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                  />
                </Box>
              </Box>

              {/* Row 3: Time */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Time (seconds)"
                  type="number"
                  fullWidth
                  value={step.time}
                  onChange={(e) => handleStepChange(index, 'time', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />
              </Box>

              {/* Row 4: Motor and Stove Switches */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={step.motor}
                      onChange={(e) => handleStepChange(index, 'motor', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body1">
                      Motor: <strong>{step.motor ? 'ON' : 'OFF'}</strong>
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={step.stove_on === 'on'}
                      onChange={(e) => handleStepChange(index, 'stove_on', e.target.checked ? 'on' : 'off')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body1">
                      Stove: <strong>{step.stove_on === 'on' ? 'ON' : 'OFF'}</strong>
                    </Typography>
                  }
                />
              </Box>
            </Box>
          ))}

          <Button
            onClick={handleAddStep}
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Step
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!recipeName.trim() || steps.some(step => !step.action)}
          >
            Create Recipe
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Recipe</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "<strong>{deleteDialog.recipeName}</strong>"?
            <br />
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}