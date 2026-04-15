import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import { exportProfessionalReport } from '../components/ExportButton';
import { 
  calculatePolygonArea, 
  calculateLinearFeature, 
  calculateScale, 
  generateFinalQuote 
} from '../lib/calculations';

const TakeoffCanvas = dynamic(() => import('../components/TakeoffCanvas'), {
  ssr: false,
  loading: () => <div style={{ height: '100vh', background: '#1a202c' }} />
});

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('interior');
  const [takeoffs, setTakeoffs] = useState([]);
  const [planImage, setPlanImage] = useState(null);
  
  const [settings, setSettings] = useState({
    scale: null,         // Millimeters per pixel
    ceilingType: 'standard',
    windowType: 'aluminum',
    exteriorType: 'weatherboard',
    wallHeight: 2.4,     // Standard height for RAV Property Projects
    doors: 0,
    windows: 0,
    cabinets: 0
  });

  useEffect(() => { 
    setMounted(true); 
  }, []);

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPlanImage(e.target.result);
    reader.readAsDataURL(file);
  };

  // --- CALIBRATION LOGIC ---
  const handleCalibration = (pixelDist, physicalMm) => {
    const newScale = calculateScale(pixelDist, physicalMm);
    setSettings(prev => ({ ...prev, scale: newScale }));
    setMode('interior'); 
    alert(`Scale set! 1 pixel = ${newScale.toFixed(3)}mm`);
  };

  // --- SAVE TAKEOFF LOGIC ---
  const handleSave = (points) => {
    if (!settings.scale) {
      alert("Please Calibrate the plan scale first!");
      setMode('calibrate');
      return;
    }

    if (points.length < 4) return;
    
    let calcData;
    if (mode === 'interior') {
      const area = calculatePolygonArea(points, settings.scale);
      // Logic for RAV: Wall area estimate based on perimeter/standard ratios
      calcData = { wallArea: area * 2.5, floorArea: area }; 
    } else {
      calcData = calculateLinearFeature(points, settings.scale, settings.wallHeight, settings.exteriorType);
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

  // --- UNDO / RESET LOGIC ---
  const undoTask = () => {
    if (takeoffs.length > 0) {
      setTakeoffs(takeoffs.slice(0, -1));
    } else {
      setSettings(prev => ({ ...prev, scale: null }));
      alert("Takeoff history empty. Scale has been reset.");
    }
  };

  if (!mounted) return null;

  // Calculate the total project price for the export
  const totalProjectQuote = generateFinalQuote(takeoffs);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f7fafc' }}>
      <Sidebar 
        currentSettings={settings} 
        setSettings={setSettings} 
        mode={mode} 
        setMode={setMode}
        takeoffs={takeoffs}
        onSave={() => alert("Double-click the drawing to finish a measurement!")}
        onUndo={undoTask}
        onExport={() => exportProfessionalReport(takeoffs, totalProjectQuote)}
        onUpload={handleFileUpload} 
      />
      <TakeoffCanvas 
        mode={mode}
        savedTakeoffs={takeoffs} 
        onComplete={handleSave} 
        onCalibrate={handleCalibration}
        backgroundImage={planImage}
      />
    </div>
  );
}
