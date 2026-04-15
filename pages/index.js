import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import { exportProfessionalReport } from '../components/ExportButton';
import { calculatePolygonArea, calculateLinearFeature } from '../lib/calculations';

const TakeoffCanvas = dynamic(() => import('../components/TakeoffCanvas'), {
  ssr: false,
  loading: () => <div style={{ height: '100vh', background: '#1a202c' }} />
});

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('interior');
  const [takeoffs, setTakeoffs] = useState([]);
  const [settings, setSettings] = useState({
    ceilingType: 'standard',
    windowType: 'aluminum',
    exteriorType: 'weatherboard',
    wallHeight: 2.4, // Standard Melbourne wall/fence height
    doors: 0,
    windows: 0,
    cabinets: 0
  });

  useEffect(() => { setMounted(true); }, []);

  const handleSave = (points) => {
    if (points.length < 4) return;
    
    // SCALE: In a real app, this comes from your calibration tool. 
    // Here we use a mock scale (1 pixel = 10mm)
    const currentScale = 10; 
    let calcData;

    if (mode === 'interior') {
      const area = calculatePolygonArea(points, currentScale);
      calcData = { wallArea: area * 2.5, floorArea: area }; // 2.5 is avg wall/floor ratio
    } else {
      calcData = calculateLinearFeature(points, currentScale, settings.wallHeight, settings.exteriorType);
    }

    const newEntry = {
      ...settings,
      ...calcData,
      points,
      mode,
      label: `${mode === 'interior' ? 'Room' : settings.exteriorType} ${takeoffs.length + 1}`
    };
    setTakeoffs([...takeoffs, newEntry]);
  };

  const undoLastTakeoff = () => {
    setTakeoffs(takeoffs.slice(0, -1));
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f7fafc' }}>
      <Sidebar 
        currentSettings={settings} 
        setSettings={setSettings} 
        mode={mode} 
        setMode={setMode}
        takeoffs={takeoffs}
        onSave={() => alert("Double-click the drawing to finish an area!")}
        onUndo={undoLastTakeoff}
        onExport={() => exportProfessionalReport(takeoffs, 0)} // Total calculated in Excel logic
      />
      <TakeoffCanvas 
        mode={mode}
        savedTakeoffs={takeoffs} 
        onComplete={handleSave} 
      />
    </div>
  );
}
