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
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import RecipeCard from '../components/RecipeCard';

interface RecipeStep {
  action: string;
  time?: number;
  ingredient?: string;
  temperature?: number;
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
    { action: '', time: 0, ingredient: '', temperature: 0 }
  ]);

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
        alert(`Recipe "${result.recipe_name}" sent to ESP32 successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to send recipe: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending recipe to ESP32:', error);
      alert('Error sending recipe to ESP32');
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, { action: '', time: 0, ingredient: '', temperature: 0 }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, field: keyof RecipeStep, value: string | number) => {
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
        setSteps([{ action: '', time: 0, ingredient: '', temperature: 0 }]);
        fetchRecipes();
      } else {
        console.error('Failed to create recipe');
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
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
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom>
            Recipe Steps
          </Typography>

          {steps.map((step, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Step {index + 1}
                </Typography>
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

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <TextField
                    select
                    label="Action"
                    fullWidth
                    value={step.action}
                    onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                  >
                    {actionOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <TextField
                    label="Time (seconds)"
                    type="number"
                    fullWidth
                    value={step.time || ''}
                    onChange={(e) => handleStepChange(index, 'time', parseInt(e.target.value) || 0)}
                  />
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <TextField
                    label="Ingredient"
                    fullWidth
                    value={step.ingredient || ''}
                    onChange={(e) => handleStepChange(index, 'ingredient', e.target.value)}
                  />
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <TextField
                    label="Temperature (°C)"
                    type="number"
                    fullWidth
                    value={step.temperature || ''}
                    onChange={(e) => handleStepChange(index, 'temperature', parseInt(e.target.value) || 0)}
                  />
                </Box>
              </Box>
            </Box>
          ))}

          <Button
            onClick={handleAddStep}
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{ mb: 3 }}
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
    </Container>
  );
}