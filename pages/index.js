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

  const handleCompletePolygon = (points) => {
    // Calculate simple area based on bounding box for this demo
    // In production, use Shoelace Formula for polygon area
    const area = 15.5; // Placeholder for actual math
    
    const newTakeoff = {
      label: `Room ${takeoffs.length + 1}`,
      points: points,
      area: area,
      ...settings
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
