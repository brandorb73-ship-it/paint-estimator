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
  scale: null,
  ceilingType: 'standard',
  windowType: 'aluminum',
  exteriorType: 'weatherboard',
  wallHeight: 2.4, // Standard for RAV Property Projects
  doors: 0,
  windows: 0,    // Added
  cabinets: 0,   // Added
  projectType: 'House Refresh', // Default
  surfaceType: 'Plaster',       // Default
  paintBrand: 'Dulux',          // Default
  undercoat: false, // New
  topCoats: 2       // New
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

  const floorArea = calculatePolygonArea(points, settings.scale);
  let perimeterPixels = 0;
  for (let i = 0; i < points.length; i += 2) {
    const x1 = points[i], y1 = points[i+1];
    const x2 = points[(i+2)%points.length], y2 = points[(i+3)%points.length];
    perimeterPixels += Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  }
  const perimeterMeters = (perimeterPixels * settings.scale) / 1000;

// Use Number() and || 0 to prevent NaN
  const d = Number(settings.doors) || 0;
  const w = Number(settings.windows) || 0;
  const c = Number(settings.cabinets) || 0;

  const deductions = (d * 1.6) + (w * 1.5) + (c * 2.0);
  const netArea = (perimeterMeters * settings.wallHeight) - deductions;

  const rates = { "New Build": 35, "Aged Care": 55, "Boutique": 45, "House Refresh": 30 };
  const projectRate = rates[settings.projectType] || 35;
  
  const newEntry = {
    id: Date.now(),
    label: prompt("Room Name:") || "Unnamed Area",
    points: points,
    perimeter: perimeterMeters.toFixed(2),
    wallHeight: settings.wallHeight,
    doors: d,
    windows: w,
    cabinets: c,
    projectType: settings.projectType,
    paintBrand: settings.paintBrand,
    surfaceType: settings.surfaceType || "Plaster", // Defaulting to Plaster
    needsUndercoat: settings.undercoat || false,
    deductions: deductionsTotal, // This goes to the Excel column
    wallArea: (perimeterMeters * settings.wallHeight) - deductionsTotal
  };

  setTakeoffs([...takeoffs, newEntry]);
  setSettings(prev => ({ ...prev, doors: 0, windows: 0, cabinets: 0 }));
};
  // --- UNDO / RESET LOGIC ---
const undoTask = () => {
  if (takeoffs.length === 0) return alert("Nothing left to undo!");
  
  // Remove the last entry from the history
  setTakeoffs(prev => prev.slice(0, -1));
};

  if (!mounted) return null;

  // Calculate the total project price for the export
const totalProjectQuote = takeoffs.reduce((sum, t) => sum + (parseFloat(t.labour) || 0), 0);

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
  savedTakeoffs={takeoffs} // Ensure TakeoffCanvas.js uses 'savedTakeoffs'
  onComplete={handleSave} 
  onCalibrate={handleCalibration}
  backgroundImage={planImage}
/>
    </div>
  );
}
