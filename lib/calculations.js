// lib/calculations.js

export const calculatePaintableArea = (perimeter, height, deductions = 0) => {
  return (perimeter * height) - deductions;
};

export const getMaterialMultiplier = (materialType) => {
  // Timber windows require more prep/sanding than Aluminum
  const rates = {
    'timber': 1.4, // 40% more labor time
    'aluminum': 1.0,
    'pvc': 1.1
  };
  return rates[materialType] || 1.0;
};

export const estimateLaborCost = (area, baseRate, difficultyFactor) => {
  return area * baseRate * difficultyFactor;
};
