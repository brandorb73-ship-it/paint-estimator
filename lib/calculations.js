/**
 * lib/calculations.js
 * Forensic Trade Analytics for RAV Property Projects
 */

// 1. CALIBRATION LOGIC
export const calculateScale = (pixelDist, physicalMm) => {
  if (!pixelDist || !physicalMm) return null;
  return physicalMm / pixelDist;
};

// 2. INTERIOR AREA LOGIC
export const calculatePolygonArea = (points, scale) => {
  if (points.length < 6) return 0; // Need at least a triangle
  
  let area = 0;
  for (let i = 0; i < points.length; i += 2) {
    let x1 = points[i];
    let y1 = points[i + 1];
    let x2 = points[(i + 2) % points.length];
    let y2 = points[(i + 3) % points.length];
    area += (x1 * y2 - x2 * y1);
  }
  
  // Convert square pixels to square millimeters, then to square meters
  const areaInMm2 = (Math.abs(area) / 2) * Math.pow(scale, 2);
  return areaInMm2 / 1000000; 
};

// 3. EXTERIOR & LINEAR LOGIC (Fences, Weatherboards, Eaves)
export const calculateLinearFeature = (points, scale, height, type) => {
  let totalPixelDist = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    const d = Math.sqrt(
      Math.pow(points[i+2] - points[i], 2) + 
      Math.pow(points[i+3] - points[i+1], 2)
    );
    totalPixelDist += d;
  }
  
  const lengthMeters = (totalPixelDist * scale) / 1000;
  const surfaceArea = lengthMeters * height;

  return {
    linearMeters: lengthMeters,
    wallArea: surfaceArea,
    label: type
  };
};

// 4. DEDUCTION & PAINT LOGIC (Forensic Depth)
export const calculatePaintVolume = (m2, surfaceType = 'standard') => {
  // Coverage rates per Litre for 1 coat
  const rates = {
    standard: 12,    // Smooth plaster
    render: 8,      // Rough exterior
    weatherboard: 10, 
    fence: 7        // Picket fences / porous timber
  };

  const coverage = rates[surfaceType] || 12;
  const coats = 2;
  const totalLiters = (m2 / coverage) * coats;
  
  // Wastage factor (10% for cutting in and tray loss)
  const totalWithWastage = totalLiters * 1.10;

  return {
    liters: totalWithWastage.toFixed(2),
    drums15L: Math.ceil(totalWithWastage / 15),
    tins4L: Math.ceil(totalWithWastage / 4)
  };
};

// 5. QUOTING ENGINE (The Money Side)
export const generateFinalQuote = (takeoffs) => {
  const rates = {
    interior: 35,       // $ per m2
    weatherboard: 45,
    render: 55,
    eaves: 25,
    picket_fence: 40
  };

  return takeoffs.reduce((total, t) => {
    // 1. Calculate base area
    const area = t.wallArea || t.floorArea || 0;
    
    // 2. Apply deductions (Subbing out windows/doors)
    // Average Door = 1.6m2, Average Window = 2.0m2
    const deductions = (t.doors * 1.6) + (t.windows * 2.0);
    const netArea = Math.max(0, area - deductions);
    
    // 3. Determine rate per mode
    const rate = rates[t.mode] || rates[t.exteriorType] || 30;
    
    return total + (netArea * rate);
  }, 0);
};

// 6. DECKING CALCULATOR (Optional but helpful for Exterior mode)
export const calculateDeckingTimber = (areaM2, boardWidthMm = 90, gapMm = 5) => {
  const effectiveWidthMeters = (boardWidthMm + gapMm) / 1000;
  const linealMeters = areaM2 / effectiveWidthMeters;
  return {
    linealMeters: Math.ceil(linealMeters * 1.10), // 10% wastage
    description: `${boardWidthMm}mm boards @ ${gapMm}mm gap`
  };
};
