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
  steps: RecipeStep[];
  createdAt: string;
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

  return (
    <>
      <Card 
        sx={{ 
          mb: 2, 
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
                {recipe.steps.length} step{recipe.steps.length !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(recipe.createdAt).toLocaleDateString()}
              </Typography>
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
            Recipe Steps ({recipe.steps.length} steps)
          </Typography>
          
          <List>
            {recipe.steps.map((step, index) => (
              <ListItem key={index} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box display="flex" alignItems="center" width="100%" mb={1}>
                  <Chip 
                    label={`Step ${index + 1}`} 
                    size="small" 
                    color="primary" 
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6" component="span">
                    {step.action.replace(/_/g, ' ').toUpperCase()}
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

          <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong> {new Date(recipe.createdAt).toLocaleString()}
            </Typography>
       
          </Box>
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