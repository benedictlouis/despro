const validateRecipeStep = (step, index) => {
  if (!step.action || typeof step.action !== "string") {
    return {
      isValid: false,
      error: `Each step must have an 'action' (string). Problem at index ${index}`,
    };
  }

  if (step.stove_on !== undefined && typeof step.stove_on !== "boolean") {
    return {
      isValid: false,
      error: `stove_on must be a boolean (problem at step index ${index})`,
    };
  }

  if (step.temperature !== undefined && typeof step.temperature !== "number") {
    return {
      isValid: false,
      error: `temperature must be a number (step index ${index})`,
    };
  }

  if (step.weight !== undefined && typeof step.weight !== "number") {
    return {
      isValid: false,
      error: `weight must be a number (step index ${index})`,
    };
  }

  if (step.time !== undefined && typeof step.time !== "number") {
    return {
      isValid: false,
      error: `time must be a number (step index ${index})`,
    };
  }

  if (step.motor !== undefined && typeof step.motor !== "boolean") {
    return {
      isValid: false,
      error: `motor must be a boolean (step index ${index})`,
    };
  }

  return { isValid: true };
};

const validateRecipeSteps = (steps) => {
  if (!Array.isArray(steps)) {
    return {
      isValid: false,
      error: "Steps must be an array",
    };
  }

  for (let i = 0; i < steps.length; i++) {
    const validation = validateRecipeStep(steps[i], i);
    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true };
};

const normalizeRecipeStep = (step, index) => ({
  step: index + 1,
  action: step.action ?? "",
  temperature: step.temperature ?? 0,
  weight: step.weight ?? 0,
  time: step.time ?? 0,
  motor: step.motor ?? false,
  stove_on: step.stove_on ?? false,
});

const normalizeRecipeSteps = (steps) => {
  if (!Array.isArray(steps)) {
    return [];
  }
  return steps.map((step, index) => normalizeRecipeStep(step, index));
};

module.exports = {
  validateRecipeStep,
  validateRecipeSteps,
  normalizeRecipeStep,
  normalizeRecipeSteps,
};
