// lib/calculations.js

/**
 * STEP 1: CALIBRATION ENGINE
 * Essential for Melbourne plans (typically scale 1:100 or 1:50).
 */
export const calculateScale = (pixelDistance, physicalLengthInMm) => {
  if (pixelDistance === 0) return 0;
  return physicalLengthInMm / pixelDistance; // Returns mm per pixel
};

/**
 * STEP 2: INTERIOR (POLYGON) ENGINE
 * Uses Shoelace formula to get exact floor area from plan coordinates.
 */
export const calculatePolygonArea = (points, scale) => {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i += 2) {
    const x1 = points[i], y1 = points[i + 1];
    const x2 = points[(i + 2) % n], y2 = points[(i + 3) % n];
    area += (x1 * y2) - (x2 * y1);
  }
  const pixelArea = Math.abs(area) / 2;
  // Convert mm2 to m2 by dividing by 1,000,000
  return (pixelArea * (scale * scale)) / 1000000;
};

/**
 * STEP 3: EXTERIOR & LINEAR ENGINE
 * Handles specific Melbourne housing features like Weatherboards and Picket Fences.
 */
export const calculateLinearFeature = (points, scale, height = 2.4, type) => {
  let totalLinearPixels = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    const dist = Math.sqrt(
      Math.pow(points[i + 2] - points[i], 2) + 
      Math.pow(points[i + 3] - points[i + 1], 2)
    );
    totalLinearPixels += dist;
  }
  
  const linearMeters = (totalLinearPixels * scale) / 1000;

  // Technical calculations for RAV Property Projects
  switch (type) {
    case 'weatherboard':
      return { meters: linearMeters, area: linearMeters * height, label: 'm²' };
    case 'picket_fence':
      // 2.5 factor accounts for double sides + thickness of pickets
      return { meters: linearMeters, area: linearMeters * height * 2.5, label: 'm² (Complex)' };
    case 'eaves':
    case 'fascia':
      return { meters: linearMeters, area: 0, label: 'Lineal m' };
    default:
      return { meters: linearMeters, area: linearMeters * height, label: 'm²' };
  }
};
export const calculatePaintRequirements = (totalArea, surfaceType) => {
  const coverageRates = {
    interior_wall: 12,
    ceiling: 11,
    weatherboard: 9,
    render: 7
  };
  
  const coverage = coverageRates[surfaceType] || 12;
  const litersPerCoat = totalArea / coverage;
  
  return {
    litersNeeded: Math.ceil(litersPerCoat * 2), // Total for 2 coats
    tins15L: Math.ceil((litersPerCoat * 2) / 15) // How many 15L drums to buy
  };
};
/**
 * STEP 4: QUOTE ENGINE
 * Applies Melbourne labor rates and material premiums.
 */
export const generateFinalQuote = (takeoffs) => {
  return takeoffs.reduce((total, item) => {
    let subTotal = 0;

    if (item.mode === 'interior') {
      // Wall Area calc (Perimeter * Height) minus basic deductions
      const wallCost = item.wallArea * 35; 
      const doorCost = (item.doors || 0) * 85;
      const windowCost = item.windowType === 'timber' ? (item.windows || 0) * 120 : (item.windows || 0) * 45;
      const cabinetCost = (item.cabinets || 0) * 65;

      subTotal = wallCost + doorCost + windowCost + cabinetCost;

      // Victorian/High Ceiling Premiums
      if (item.ceilingType === 'victorian') subTotal *= 1.25;
      else if (item.ceilingType === 'high') subTotal *= 1.15;

    } else if (item.mode === 'exterior') {
      // Exterior Rates
      const extRates = { 'weatherboard': 45, 'eaves': 22, 'fascia': 18, 'render': 55, 'picket_fence': 65 };
      const rate = extRates[item.exteriorType] || 35;
      
      // If it's a meter-based item (eaves) use meters, otherwise use calculated area
      const multiplier = (item.exteriorType === 'eaves' || item.exteriorType === 'fascia') ? item.meters : item.area;
      subTotal = multiplier * rate;
    }

    return total + subTotal;
  }, 0);
};
