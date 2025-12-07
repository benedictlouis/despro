import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogContent,
  Stack,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
<<<<<<< HEAD
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayIcon, Delete as DeleteIcon } from '@mui/icons-material';
=======
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ScaleIcon from "@mui/icons-material/Scale";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrowRounded";
import config from "../utils/config";
>>>>>>> 8eb1a6827f0587bd451668971f031aca00e146a9

const API_BASE_URL = config.API_BASE_URL;

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

  // --- ORIGINAL LOGIC RESTORED ---
  const handleCardClick = async () => {
    setOpen(true);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/recipe/${recipe.id}`);

      if (response.ok) {
        const data = await response.json();
        setDetailedSteps(data.steps || []);
      } else {
        setDetailedSteps([]);
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
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
  // -------------------------------

<<<<<<< HEAD
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
=======
  // Helper to format date cleanly
  const formattedDate = recipe.createdAt
    ? new Date(recipe.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "";
>>>>>>> 8eb1a6827f0587bd451668971f031aca00e146a9

  return (
    <>
      <Card
        elevation={0}
        onClick={handleCardClick}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          transition: "transform 0.3s ease, border-color 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: "primary.main",
          },
        }}
      >
<<<<<<< HEAD
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography variant="h6" component="h2" gutterBottom>
                {recipe.name}
=======
        <CardContent
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 3,
          }}
        >
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                RECIPE {recipe.id.substring(0, 4)}
>>>>>>> 8eb1a6827f0587bd451668971f031aca00e146a9
              </Typography>
              {formattedDate && (
                <Typography variant="caption" color="text.secondary">
                  {formattedDate}
                </Typography>
              )}
<<<<<<< HEAD
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
=======
            </Stack>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, lineHeight: 1.1 }}
>>>>>>> 8eb1a6827f0587bd451668971f031aca00e146a9
            >
              {recipe.name}
            </Typography>
          </Box>

          {/* Action Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            endIcon={<ArrowOutwardIcon sx={{ fontSize: "16px !important" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleExecute();
            }}
            sx={{
              borderRadius: 3,
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              mt: "auto",
              boxShadow: "none",
            }}
          >
            Cook now
          </Button>
        </CardContent>
      </Card>

      {/* Clean Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: { xs: 1, md: 3 } } }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          pt={2}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
          >
            DETAILS
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            {recipe.name}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Preparation Steps
              </Typography>

              {detailedSteps.length === 0 ? (
                <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                  No steps available.
                </Typography>
              ) : (
                <List sx={{ px: 0 }}>
                  {detailedSteps.map((step, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        py: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 40 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={700}
                        >
                          {(index + 1).toString().padStart(2, "0")}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <ListItemText
                          primary={step.action.replace(/_/g, " ").toUpperCase()}
                          primaryTypographyProps={{
                            fontWeight: 700,
                            variant: "body1",
                          }}
                          secondary={step.ingredient}
                        />
                      </Box>

                      <Stack direction="row" spacing={1}>
                        {step.time && step.time > 0 && (
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={`${step.time}s`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                        {step.weight && step.weight > 0 && (
                          <Chip
                            icon={<ScaleIcon />}
                            label={`${step.weight}g`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                        {step.temperature && step.temperature > 0 && (
                          <Chip
                            label={`${step.temperature}°C`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={handleExecute}
                sx={{ mt: 4, borderRadius: 50, py: 2, fontSize: "1.1rem" }}
              >
                Start Cooking Process
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
