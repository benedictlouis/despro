import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayIcon, Delete as DeleteIcon } from '@mui/icons-material';

const API_BASE_URL = "http://localhost:4321";

interface RecipeStep {
  step?: number;
  action: string;
  time?: number;
  ingredient?: string;
  temperature?: number;
  weight?: number;
  motor?: boolean;
  stove_on?: string;
}

interface Recipe {
  id: string;
  name: string;
  steps?: RecipeStep[] | string;
  createdAt?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onSendToESP32: (recipeId: string) => void;
  onDelete: (recipeId: string, recipeName: string) => void;
}

export default function RecipeCard({ recipe, onSendToESP32, onDelete }: RecipeCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailedSteps, setDetailedSteps] = useState<RecipeStep[]>([]);

  const handleCardClick = async () => {
    setOpen(true);
    setLoading(true);
    
    try {
      // Fetch detailed recipe data including steps
      const response = await fetch(`${API_BASE_URL}/recipe/${recipe.id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched recipe details:', data);
        setDetailedSteps(data.steps || []);
      } else {
        console.error('Failed to fetch recipe details');
        setDetailedSteps([]);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setDetailedSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDetailedSteps([]);
  };

  const handleExecute = () => {
    onSendToESP32(recipe.id);
    handleClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(recipe.id, recipe.name);
  };

  const formatStepDetails = (step: RecipeStep) => {
    const details = [];
    if (step.ingredient) details.push(`Ingredient: ${step.ingredient}`);
    if (step.time && step.time > 0) details.push(`Time: ${step.time}s`);
    if (step.temperature && step.temperature > 0) details.push(`Temperature: ${step.temperature}°C`);
    if (step.weight && step.weight > 0) details.push(`Weight: ${step.weight}g`);
    if (step.motor !== undefined) details.push(`Motor: ${step.motor ? 'ON' : 'OFF'}`);
    if (step.stove_on) details.push(`Stove: ${step.stove_on.toUpperCase()}`);
    return details.join(' | ');
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
        onClick={handleCardClick}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography variant="h6" component="h2" gutterBottom>
                {recipe.name}
              </Typography>
              {recipe.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(recipe.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={handleDelete}
              color="error"
              size="small"
              sx={{ ml: 1 }}
              aria-label="delete recipe"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
          
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PlayIcon />}
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onSendToESP32(recipe.id);
              }}
            >
              Execute
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recipe Details Modal */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{recipe.name}</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Recipe Steps ({detailedSteps.length} steps)
              </Typography>
              
              {detailedSteps.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No steps available for this recipe.
                </Typography>
              ) : (
                <List>
                  {detailedSteps.map((step: RecipeStep, index: number) => (
                    <ListItem key={index} divider sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                      <Box display="flex" alignItems="center" width="100%" mb={1}>
                        <Chip 
                          label={`Step ${step.step || index + 1}`} 
                          size="small" 
                          color="primary" 
                          sx={{ mr: 2 }}
                        />
                        <Typography variant="h6" component="span">
                          {step.action?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN ACTION'}
                        </Typography>
                      </Box>
                      
                      {formatStepDetails(step) && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ ml: 2 }}
                        >
                          {formatStepDetails(step)}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}

              {recipe.createdAt && (
                <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid #e0e0e0">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {new Date(recipe.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Recipe ID:</strong> {recipe.id}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
          <Button 
            onClick={handleExecute}
            variant="contained" 
            color="primary"
            startIcon={<PlayIcon />}
            disabled={loading}
          >
            Execute Recipe
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}