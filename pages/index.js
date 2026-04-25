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
  topCoats: 2,      // New
  prepLevel: 'Standard', // Default
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

  // 1. Calculate Perimeter (Your specific math)
  let perimeterPixels = 0;
  for (let i = 0; i < points.length; i += 2) {
    const x1 = points[i], y1 = points[i+1];
    const x2 = points[(i+2)%points.length], y2 = points[(i+3)%points.length];
    perimeterPixels += Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  }
  const perimeterMeters = (perimeterPixels * settings.scale) / 1000;

  // 2. Prep & Rate Logic (FIX: Added rates and currentRate definition)
  const rates = { "Aged Care": 55, "Boutique": 45, "New Build": 35, "House Refresh": 30 };
  const currentRate = rates[settings.projectType] || 35; 
  
  const prepSurcharges = { "Standard": 0, "Patching": 5, "Restoration": 15 };
  const prepCost = prepSurcharges[settings.prepLevel] || 0;

  // 3. Prevent NaN with Defaults
  const d = Number(settings.doors) || 0;
  const w = Number(settings.windows) || 0;
  const c = Number(settings.cabinets) || 0;

  // 4. Deduction Calculation
  const deductionsArea = (d * 1.6) + (w * 1.5) + (c * 2.0);
  const grossWallArea = perimeterMeters * settings.wallHeight;
  const calculatedWallArea = grossWallArea - deductionsArea;

// --- TRIM PRICING (Industry Standard for Melbourne) ---
const DOOR_RATE = 90;    // Includes both sides + frame
const WINDOW_RATE = 45;  // Internal frame/architrave
const CABINET_RATE = 120; // Per standard unit/face

const trimLabour = (d * DOOR_RATE) + (w * WINDOW_RATE) + (c * CABINET_RATE);
const trimMaterial = ((d + w + c) * 0.5) * 35; // Approx 0.5L of Enamel per unit @ $35/L
  
  const roomName = prompt("Room Name:");
  if (!roomName) return; 

  // 5. Create the Forensic Entry
  const newEntry = {
    id: Date.now(),
    label: roomName,
    points: [...points], 
    perimeter: perimeterMeters.toFixed(2),
    wallHeight: settings.wallHeight,
    doors: d,
    windows: w,
    cabinets: c,
    projectType: settings.projectType || "House Refresh",
    paintBrand: settings.paintBrand || "Dulux",
    surfaceType: settings.surfaceType || "Plaster",
    needsUndercoat: settings.undercoat || false,
    prepLevel: settings.prepLevel || "Standard",
    deductions: deductionsArea, 
    wallArea: calculatedWallArea > 0 ? calculatedWallArea : 0,
    // LABOUR MATH: (Base Rate + Prep Surcharge) * Area
    labour: (calculatedWallArea * (currentRate + prepCost)).toFixed(2),
    trimCost: (trimLabour + trimMaterial).toFixed(2),
  totalRoomValue: (parseFloat(calculatedWallArea * (currentRate + prepCost)) + trimLabour + trimMaterial).toFixed(2)
  };

  // 6. Final State Updates
  setTakeoffs(prev => [...prev, newEntry]);
  setSettings(prev => ({ ...prev, doors: 0, windows: 0, cabinets: 0 }));
};

  // UNDO LOGIC - Make sure it is outside handleSave!
  const undoTask = () => {
    setTakeoffs((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  };

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

{/* --- PROFESSIONAL PRINT-ONLY REPORT --- */}
<div id="rav-print-report" style={{ display: 'none' }}>
  <style>
    {`
      @media print {
        @page { 
          margin: 0; /* Hides the Vercel URL and page numbers */
        }
        body { 
          margin: 1.5cm; /* Adds a clean margin back so content isn't on the edge */
          visibility: hidden; 
          background: white !important;
        }
        #rav-print-report, #rav-print-report * { 
          visibility: visible; 
        }
        #rav-print-report { 
          display: block !important; 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: 100%; 
        }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 10px; text-align: left; font-size: 11px; }
        th { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; }
      }
    `}
  </style>

  {/* --- HEADER SECTION WITH LOGO --- */}
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '2px solid #2f855a', 
    paddingBottom: '10px',
    marginBottom: '20px' 
  }}>
    <div>
      <h1 style={{ margin: 0, color: '#2f855a', fontSize: '24px' }}>Forensic Takeoff Report</h1>
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>RAV Property Projects</p>
      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Date: {new Date().toLocaleDateString('en-AU')}</p>
    </div>
    
    {/* REPLACE THE URL BELOW WITH YOUR GOOGLE SITES LOGO LINK */}
    <img 
      src="https://lh3.googleusercontent.com/sitesv/AA5AbUDC2jGOAZrK7LeX6ooBA0AuJLcyht6yQDx6hSucAMt9THaiISoGx9Y5qU484qeRJbBBGewyu3F3vlu5nRIgW8Mma8Xz8h7CI90gJ7qHWIsy2y41mEJeijkeiYk21t4lOL0rm_-Ydc_v3000Qfo5NTFPYNkyxsn7OpAaqoRaUCOqoN5Z5lRsLEn_=w16383"
      alt="RAV Logo" 
      style={{ height: '70px', width: 'auto', objectFit: 'contain' }} 
    />
  </div>

  <table>
    <thead>
      <tr>
        <th>Room Name</th>
        <th>Prep Level</th>
        <th>Walls (m²)</th>
        <th>Trims (D/W/C)</th>
        <th>Labour + Materials</th>
      </tr>
    </thead>
    <tbody>
      {takeoffs.map((t) => (
        <tr key={t.id}>
          <td>{t.label}</td>
          <td>{t.prepLevel || 'Standard'}</td>
          <td>{t.wallArea.toFixed(2)}m²</td>
          <td>{t.doors}D / {t.windows}W / {t.cabinets}C</td>
          <td>${t.totalRoomValue}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <div style={{ marginTop: '30px', border: '1px solid #000', padding: '15px' }}>
    <h3 style={{ margin: '0 0 10px 0' }}>Project Scope & Forensic Notes:</h3>
    <ul style={{ fontSize: '12px', margin: 0 }}>
      <li><strong>Preparation:</strong> Surfaces assessed and prepared to specified levels (Standard/Patching/Restoration).</li>
      <li><strong>Materials:</strong> Premium specification (Dulux Wash&Wear / Aquanamel systems).</li>
      <li><strong>Inclusions:</strong> Pricing includes all consumables, local travel, and 30% management margin.</li>
    </ul>
    <div style={{ textAlign: 'right', marginTop: '10px' }}>
       <h2 style={{ margin: 0 }}>Grand Total: ${takeoffs.reduce((sum, t) => sum + parseFloat(t.totalRoomValue), 0).toFixed(2)}</h2>
    </div>
  </div>
</div>
    </div>
  );
}
