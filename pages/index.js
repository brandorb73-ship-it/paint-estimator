import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TakeoffCanvas from '../components/TakeoffCanvas';
import { MELBOURNE_RATES } from '../lib/rates';

export default function App() {
  const [settings, setSettings] = useState({
    ceilingType: 'standard',
    windowType: 'aluminum',
    addSkirting: false,
    addCornice: false
  });

  const [takeoffs, setTakeoffs] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState(null);

// Inside pages/index.js

const handleCompletePolygon = (points) => {
  // 1. Calculate Floor Area using Shoelace
  const floorArea = calculatePolygonArea(points, currentScale); 
  
  // 2. Calculate Perimeter (for Wall Surface Area)
  let perimeter = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    const dx = points[i+2] - points[i];
    const dy = points[i+3] - points[i+1];
    perimeter += Math.sqrt(dx*dx + dy*dy) * currentScale;
  }

  // 3. Apply Melbourne Quote Logic
  const h = settings.ceilingType === 'victorian' ? 3.3 : (settings.ceilingType === 'high' ? 2.7 : 2.4);
  const wallArea = perimeter * h;
  
  // Complexity factor for Timber/Preparation
  const complexity = settings.windowType === 'timber' ? 1.25 : 1.0;
  
  const newTakeoff = {
    label: `Room ${takeoffs.length + 1}`,
    points: points,
    floorArea: floorArea,
    wallArea: wallArea,
    totalEstimate: (wallArea * 35 * complexity) // $35/m2 base Melbourne rate
  };

  setTakeoffs([...takeoffs, newTakeoff]);
};

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar 
        currentSettings={settings} 
        setSettings={setSettings} 
        takeoffs={takeoffs}
        onSave={() => alert('Takeoff data captured for Excel export!')} 
      />
      <TakeoffCanvas 
        savedPolygons={takeoffs} 
        onCompletePolygon={handleCompletePolygon} 
      />
    </div>
  );
}
