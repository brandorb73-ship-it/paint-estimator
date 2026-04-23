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
  if (!settings.scale) return alert("Calibrate first!");

  // 1. Perimeter Calculation
  let perimeterPixels = 0;
  for (let i = 0; i < points.length; i += 2) {
    const x1 = points[i], y1 = points[i+1];
    const x2 = points[(i+2)%points.length], y2 = points[(i+3)%points.length];
    perimeterPixels += Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  }
  const perimeterMeters = (perimeterPixels * settings.scale) / 1000;

  // 2. Calculation Breakdown
  const grossArea = perimeterMeters * settings.wallHeight;
  const doorDeduction = settings.doors * 1.6;
  const cabinetDeduction = settings.cabinets * 1.5; // Example deduction for built-ins
  const netWallArea = Math.max(0, grossArea - doorDeduction - cabinetDeduction);

  const newEntry = {
    ...settings,
    mode: mode, 
    perimeter: perimeterMeters.toFixed(2),
    heightUsed: settings.wallHeight,
    grossArea: grossArea.toFixed(2),
    deductions: (doorDeduction + cabinetDeduction).toFixed(2),
    wallArea: netWallArea, // This is used for the paint calc
    label: `Room ${takeoffs.length + 1}`
  };

  setTakeoffs([...takeoffs, newEntry]);
  
  // Clear inventory so you don't accidentally carry 2 doors into the next room
  setSettings(prev => ({ ...prev, doors: 0, cabinets: 0 }));
};
const handleSave = (points) => {
  if (!settings.scale) return alert("Please Calibrate Scale First!");

  // 1. DIMENSION CALCULATIONS
  const floorArea = calculatePolygonArea(points, settings.scale);
  let perimeterPixels = 0;
  for (let i = 0; i < points.length; i += 2) {
    const x1 = points[i], y1 = points[i+1];
    const x2 = points[(i+2)%points.length], y2 = points[(i+3)%points.length];
    perimeterPixels += Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  }
  const perimeterMeters = (perimeterPixels * settings.scale) / 1000;
  
  // 2. SURFACE AREA LOGIC
  const grossWallArea = perimeterMeters * settings.wallHeight;
  const deductions = (settings.doors * 1.6) + (settings.cabinets * 2.0); // m2
  const netWallArea = Math.max(0, grossWallArea - deductions);

  // 3. CREATE DATA ENTRY
  const newEntry = {
    id: Date.now(),
    label: prompt("Enter Room Name (e.g. Master Bed, Ensuite):") || `Room ${takeoffs.length + 1}`,
    mode: mode,
    points: points, // Required for the Green Fill
    perimeter: perimeterMeters.toFixed(2),
    wallHeight: settings.wallHeight,
    grossArea: grossWallArea.toFixed(2),
    netArea: netWallArea.toFixed(2),
    floorArea: floorArea.toFixed(2),
    
    // Inventory Items
    doors: settings.doors,
    cabinets: settings.cabinets,
    
    // Project Metadata (Current state of sidebar)
    paintBrand: settings.paintBrand || "Dulux",
    projectType: settings.projectType || "Residential Refresh",
    surfaceType: settings.surfaceType || "Smooth Plaster",
    
    // Paint Spec
    wallCoats: settings.wallCoats || 2,
    undercoat: settings.needsUndercoat ? 1 : 0
  };

  setTakeoffs([...takeoffs, newEntry]);
  
  // Reset counters for next room
  setSettings(prev => ({ ...prev, doors: 0, cabinets: 0 }));
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
