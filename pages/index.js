import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import { MELBOURNE_RATES } from '../lib/rates';
import { exportProfessionalReport } from '../components/ExportButton';

// FIX: This must be defined OUTSIDE the component function
const TakeoffCanvas = dynamic(() => import('../components/TakeoffCanvas'), {
  ssr: false,
  loading: () => <div style={{ height: '100vh', background: '#f0f0f0' }}>Loading Plan...</div>
});

// pages/index.js

export default function App() {
  // 1. Add the mode state here
  const [mode, setMode] = useState('interior'); 
  
  const [settings, setSettings] = useState({
    ceilingType: 'standard',
    windowType: 'aluminum',
    exteriorType: 'weatherboard', // Default for exterior
    wallHeight: 2.4,              // Used for weatherboards/fences
    doors: 0,
    windows: 0
  });

  const [takeoffs, setTakeoffs] = useState([]);

  // 2. This function now handles both types
  const handleSave = (points) => {
    let data;
    if (mode === 'interior') {
      const area = calculatePolygonArea(points, currentScale);
      data = { floorArea: area, wallArea: area * 2.5 }; // Simplified wall calc
    } else {
      data = calculateLinearFeature(points, currentScale, settings.wallHeight, settings.exteriorType);
    }

    setTakeoffs([...takeoffs, { ...settings, points, mode, ...data }]);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Pass mode and setMode to the Sidebar */}
      <Sidebar 
        currentSettings={settings} 
        setSettings={setSettings} 
        mode={mode} 
        setMode={setMode} 
        takeoffs={takeoffs}
        onSave={handleSave}
      />
      <TakeoffCanvas 
        mode={mode} // Pass mode to Canvas so it knows to close the polygon or not
        onComplete={handleSave} 
      />
    </div>
  );
}
