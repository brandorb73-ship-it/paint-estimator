// lib/calculations.js

export const calculatePolygonArea = (points, scale) => {
  // points is a flat array [x1, y1, x2, y2, ...]
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    
    // Get the next pair, or loop back to the first pair
    const x2 = points[(i + 2) % n];
    const y2 = points[(i + 3) % n];

    area += (x1 * y2) - (x2 * y1);
  }

  // Absolute value / 2 gives pixel area
  // Then multiply by (scale * scale) to convert to m2
  const pixelArea = Math.abs(area) / 2;
  return pixelArea * (scale * scale);
};
