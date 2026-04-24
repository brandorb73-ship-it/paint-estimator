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
  paintBrand: 'Dulux'           // Default
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
  
  // PERIMETER CALCULATION
  let perimeterPixels = 0;
  for (let i = 0; i < points.length; i += 2) {
    const x1 = points[i], y1 = points[i+1];
    const x2 = points[(i+2)%points.length], y2 = points[(i+3)%points.length];
    perimeterPixels += Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  }
  const perimeterMeters = (perimeterPixels * settings.scale) / 1000;

  // DYNAMIC DEDUCTIONS (Doors, Windows, Cabinets)
  const deductions = (settings.doors * 1.6) + (settings.windows * 1.2) + (settings.cabinets * 2.0);
  const netWallArea = Math.max(0, (perimeterMeters * settings.wallHeight) - deductions);

  // LABOUR CALCULATION (Per m2 rates)
  const rates = { "New Build": 35, "Aged Care": 55, "Boutique": 45, "Refresh": 30 };
  const projectRate = rates[settings.projectType] || 35;
  const surfaceMultiplier = settings.surfaceType === "Fresh Render" ? 1.2 : 1.0; 
  const estLabour = netWallArea * projectRate * surfaceMultiplier;

  const newEntry = {
    id: Date.now(),
    label: prompt("Enter Room Name (e.g. BED 1, PORCH):") || `Room ${takeoffs.length + 1}`,
    mode: mode,
    points: points, // THIS PREVENTS THE MAP FROM DISAPPEARING
    perimeter: perimeterMeters.toFixed(2),
    wallHeight: settings.wallHeight,
    wallArea: netWallArea,
    labour: estLabour,
    coats: settings.undercoat ? "1U + 2T" : "2T", // Undercoat + Topcoats
    paintBrand: settings.paintBrand,
    surfaceType: settings.surfaceType
  };

  setTakeoffs([...takeoffs, newEntry]);
  
  // RESET INVENTORY BUT KEEP MAP DATA
  setSettings(prev => ({ ...prev, doors: 0, windows: 0, cabinets: 0 }));
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
  savedTakeoffs={takeoffs} // Ensure TakeoffCanvas.js uses 'savedTakeoffs'
  onComplete={handleSave} 
  onCalibrate={handleCalibration}
  backgroundImage={planImage}
/>
    </div>
  );
}
