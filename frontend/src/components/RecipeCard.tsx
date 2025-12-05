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
  IconButton
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayIcon } from '@mui/icons-material';

interface RecipeStep {
  action: string;
  time?: number;
  ingredient?: string;
  temperature?: number;
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
}

export default function RecipeCard({ recipe, onSendToESP32 }: RecipeCardProps) {
  const [open, setOpen] = useState(false);

  const handleCardClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleExecute = () => {
    onSendToESP32(recipe.id);
    handleClose();
  };

  const formatStepDetails = (step: RecipeStep) => {
    const details = [];
    if (step.ingredient) details.push(`Ingredient: ${step.ingredient}`);
    if (step.time && step.time > 0) details.push(`Time: ${step.time}s`);
    if (step.temperature && step.temperature > 0) details.push(`Temperature: ${step.temperature}°C`);
    return details.join(' | ');
  };

  // Parse steps if it's a string
  const parseSteps = (): RecipeStep[] => {
    if (!recipe.steps) return [];
    
    if (typeof recipe.steps === 'string') {
      try {
        const parsed = JSON.parse(recipe.steps);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse steps:', e);
        return [];
      }
    }
    
    return Array.isArray(recipe.steps) ? recipe.steps : [];
  };

  const steps = parseSteps();

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
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="h6" component="h2" gutterBottom>
                {recipe.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {steps.length} step{steps.length !== 1 ? 's' : ''}
              </Typography>
              {recipe.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(recipe.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PlayIcon />}
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
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Recipe Steps ({steps.length} steps)
          </Typography>
          
          {steps.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No steps available for this recipe.
            </Typography>
          ) : (
            <List>
              {Array.isArray(steps) && steps.map((step: RecipeStep, index: number) => (
                <ListItem key={index} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <Chip 
                      label={`Step ${index + 1}`} 
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
            <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong> {new Date(recipe.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Recipe ID:</strong> {recipe.id}
              </Typography>
            </Box>
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
          >
            Execute Recipe
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}