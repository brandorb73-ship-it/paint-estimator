// lib/calculations.js

// 1. YOUR EXISTING SHOELACE FORMULA
export const calculatePolygonArea = (points, scale) => {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    const x2 = points[(i + 2) % n];
    const y2 = points[(i + 3) % n];
    area += (x1 * y2) - (x2 * y1);
  }
  const pixelArea = Math.abs(area) / 2;
  return pixelArea * (scale * scale);
};

// 2. NEW: CALCULATE WALL SURFACE AREA (Net of Deductions)
export const calculateWallArea = (perimeter, height, doorCount, windowCount) => {
  const totalGrossArea = perimeter * height;
  // Average deductions for Melbourne residential: 
  // Doors ~2.1m x 0.9m | Windows ~1.2m x 1.5m
  const deductions = (doorCount * 1.89) + (windowCount * 1.8);
  return totalGrossArea - deductions;
};

// 3. NEW: EXTERIOR SPECIFIC CALCULATIONS
export const calculateExteriorQuote = (linearMeters, type) => {
  const rates = {
    'weatherboard': 45, // $ per linear meter (includes overlap prep)
    'eaves': 22,        // $ per linear meter
    'fascia': 18,
    'render': 55        // $ per m2
  };
  return linearMeters * (rates[type] || 0);
};
// ADD THIS: For Weatherboards, Fences, and Eaves
export const calculateLinearFeature = (points, scale, height = 1, type) => {
  let totalLinearPixels = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    const dist = Math.sqrt(
      Math.pow(points[i + 2] - points[i], 2) + 
      Math.pow(points[i + 3] - points[i + 1], 2)
    );
    totalLinearPixels += dist;
  }
  
  const linearMeters = (totalLinearPixels * scale) / 1000;

  // Technical logic for different Melbourne exteriors
  if (type === 'weatherboard') {
    return { meters: linearMeters, area: linearMeters * height, label: 'm²' };
  }
  if (type === 'picket_fence') {
    // Both sides + picket surface area factor (approx 2.5x linear)
    return { meters: linearMeters, area: linearMeters * height * 2.5, label: 'm² (Both Sides)' };
  }
  return { meters: linearMeters, area: linearMeters, label: 'Lineal m' };
};
// 4. NEW: THE MASTER QUOTE ENGINE
export const generateFinalQuote = (takeoffs) => {
  return takeoffs.reduce((total, item) => {
    let subTotal = 0;

    // Interior Logic
    if (item.type === 'interior') {
      const wallCost = item.wallArea * 35; // Melbourne base rate per m2
      const doorCost = item.doors * 85;    // Enamel finish per side
      const windowCost = item.windowType === 'timber' ? item.windows * 120 : item.windows * 45;
      const cabinetCost = item.cabinets * 65;

      subTotal = wallCost + doorCost + windowCost + cabinetCost;

      // Apply Ceiling Premium
      if (item.ceilingType === 'victorian') subTotal *= 1.25;
      if (item.ceilingType === 'high') subTotal *= 1.15;
    } 
    
    // Exterior Logic
    else if (item.type === 'exterior') {
      subTotal = calculateExteriorQuote(item.measurement, item.exteriorType);
    }

    return total + subTotal;
  }, 0);
};
