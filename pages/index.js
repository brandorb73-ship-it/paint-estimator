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
  if (!settings.scale) return alert("Please Calibrate Scale First!");

  // 1. CALCULATE FLOOR AREA (Used for Ceilings and Porches)
  const floorArea = calculatePolygonArea(points, settings.scale);
  
  // 2. CALCULATE PERIMETER (Used for Walls)
  let perimeterPixels = 0;
  for (let i = 0; i < points.length; i += 2) {
    const x1 = points[i], y1 = points[i+1];
    const x2 = points[(i+2)%points.length], y2 = points[(i+3)%points.length];
    perimeterPixels += Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  }
  const perimeterMeters = (perimeterPixels * settings.scale) / 1000;

  // 3. PORCH LOGIC & INTERIOR CALCULATION
  let finalSurfaceArea = 0;
  
  if (mode === 'exterior' && settings.exteriorType === 'porch') {
    // For Porches, we paint the flat floor/ceiling surface area
    finalSurfaceArea = floorArea;
  } else if (mode === 'exterior') {
    // For Weatherboard/Render Walls outside
    finalSurfaceArea = perimeterMeters * settings.wallHeight;
  } else {
    // Interior: (Perimeter x Height) - (Deductions for doors/windows/cabinets)
    const grossWallArea = perimeterMeters * settings.wallHeight; 
    const doorDeduction = (settings.doors || 0) * 1.6;
    const windowDeduction = (settings.windows || 0) * 1.5;
    const cabinetDeduction = (settings.cabinets || 0) * 2.0;
    
    finalSurfaceArea = Math.max(0, grossWallArea - doorDeduction - windowDeduction - cabinetDeduction);
  }

  // 4. CREATE THE FORENSIC ENTRY
  const newEntry = {
    id: Date.now(),
    label: prompt("Enter Area Name (e.g. Master Bed, Porch, Ensuite):") || `Area ${takeoffs.length + 1}`,
    mode: mode,
    points: points, // Keeps the Green Fill working
    perimeter: perimeterMeters.toFixed(2),
    wallHeight: settings.wallHeight,
    wallArea: finalSurfaceArea,
    floorArea: floorArea,
    // Capture current UI state
    projectType: settings.projectType,
    paintBrand: settings.paintBrand,
    surfaceType: settings.surfaceType,
    doors: settings.doors,
    windows: settings.windows,
    cabinets: settings.cabinets
  };

  setTakeoffs([...takeoffs, newEntry]);
  
  // 5. RESET INVENTORY (Clears counts but keeps Scale & Height for next room)
  setSettings(prev => ({ 
    ...prev, 
    doors: 0, 
    windows: 0, 
    cabinets: 0 
  }));
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
