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

  // Temporary check: PDF rendering requires extra libraries. Let's stick to Images for now.
  if (file.type === "application/pdf") {
    alert("PDF support coming soon! Please use a PNG or JPG screenshot of the plan for now.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    console.log("File loaded successfully"); // Debugging
    setPlanImage(e.target.result);
  };
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
// Inside handleSave in pages/index.js
if (mode === 'interior') {
  const floorArea = calculatePolygonArea(points, settings.scale);
  
  // Perimter logic: Sum of distances between all points
  let perimeterPixels = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    perimeterPixels += Math.sqrt(
      Math.pow(points[i+2] - points[i], 2) + 
      Math.pow(points[i+3] - points[i+1], 2)
    );
  }
  const perimeterMeters = (perimeterPixels * settings.scale) / 1000;
  
  // Wall Area = Perimeter * Height (standard 2.4m)
  const wallArea = perimeterMeters * settings.wallHeight;

  calcData = { 
    floorArea: floorArea, 
    wallArea: wallArea // This is what the paint volume should use!
  }; 
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
  onSave={() => alert("Double-click the drawing to finish!")}
  onUndo={undoTask}
  onExport={() => exportProfessionalReport(takeoffs, totalProjectQuote)}
  onUpload={handleFileUpload} // <--- THIS LINE IS CRITICAL
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
