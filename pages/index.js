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

export default function App() {
  const [mode, setMode] = useState('interior'); // 'interior' or 'exterior'
  const [settings, setSettings] = useState({
    ceilingType: 'standard',
    windowType: 'aluminum',
    doors: 0,
    windows: 0,
    cabinets: 0
  });

  const [takeoffs, setTakeoffs] = useState([]);

  const handleCompleteTakeoff = (points, calculatedData) => {
    const newEntry = {
      ...settings,
      ...calculatedData,
      points,
      type: mode,
      label: `${mode === 'interior' ? 'Room' : 'Exterior'} ${takeoffs.length + 1}`,
      subTotal: 0 // This will be calculated by your lib/calculations engine
    };
    setTakeoffs([...takeoffs, newEntry]);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar 
        settings={settings} 
        setSettings={setSettings} 
        mode={mode} 
        setMode={setMode}
        takeoffs={takeoffs}
        onExport={() => exportProfessionalReport(takeoffs, 5000)} // Placeholder total
      />
      <TakeoffCanvas 
        mode={mode}
        savedTakeoffs={takeoffs} 
        onComplete={handleCompleteTakeoff} 
      />
    </div>
  );
}
