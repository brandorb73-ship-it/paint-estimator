// components/Sidebar.js
import React from 'react';

const Sidebar = ({ currentSettings, setSettings, mode, setMode, onSave, onExport, takeoffs }) => {
  
  // Helper to update specific counts like Doors or Cabinets
  const updateCount = (key, value) => {
    setSettings({ ...currentSettings, [key]: Math.max(0, (currentSettings[key] || 0) + value) });
  };

  return (
    <div style={{ width: '300px', backgroundColor: '#1a202c', color: 'white', padding: '20px', height: '100vh', overflowY: 'auto', borderRight: '2px solid #2d3748' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #4a5568', paddingBottom: '10px', color: '#63b3ed' }}>RAV Property Projects</h2>
      
      {/* 1. MODE TOGGLE (Interior vs Exterior) */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => setMode('interior')}
          style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: mode === 'interior' ? '#3182ce' : '#2d3748', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
        >Interior</button>
        <button 
          onClick={() => setMode('exterior')}
          style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: mode === 'exterior' ? '#3182ce' : '#2d3748', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
        >Exterior</button>
      </div>

      {/* 2. INTERIOR SETTINGS */}
      {mode === 'interior' && (
        <>
          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Ceiling Height</label>
            <select 
              value={currentSettings.ceilingType} 
              onChange={(e) => setSettings({...currentSettings, ceilingType: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#2d3748', color: 'white', border: '1px solid #4a5568' }}
            >
              <option value="standard">Standard (2.4m)</option>
              <option value="high">High (2.7m)</option>
              <option value="victorian">Victorian (3.3m+)</option>
            </select>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Room Inventory</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Doors</span>
                <div>
                  <button onClick={() => updateCount('doors', -1)} style={{ padding: '2px 8px' }}>-</button>
                  <span style={{ margin: '0 10px' }}>{currentSettings.doors || 0}</span>
                  <button onClick={() => updateCount('doors', 1)} style={{ padding: '2px 8px' }}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Cabinets</span>
                <div>
                  <button onClick={() => updateCount('cabinets', -1)} style={{ padding: '2px 8px' }}>-</button>
                  <span style={{ margin: '0 10px' }}>{currentSettings.cabinets || 0}</span>
                  <button onClick={() => updateCount('cabinets', 1)} style={{ padding: '2px 8px' }}>+</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. EXTERIOR SETTINGS */}
      {mode === 'exterior' && (
        <div style={{ marginTop: '20px' }}>
          <label style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Exterior Feature</label>
          <select 
            value={currentSettings.exteriorType} 
            onChange={(e) => setSettings({...currentSettings, exteriorType: e.target.value})}
            style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#2d3748', color: 'white', border: '1px solid #4a5568' }}
          >
            <option value="weatherboard">Weatherboard Wall</option>
            <option value="eaves">Eaves / Soffits</option>
            <option value="fascia">Fascia & Gutter</option>
            <option value="render">Render / Brick</option>
            <option value="picket_fence">Picket Fence</option>
          </select>
        </div>
      )}

      {/* 4. ACTIONS */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #4a5568', paddingTop: '20px' }}>
        <button 
          onClick={onSave}
          style={{ width: '100%', padding: '12px', backgroundColor: '#48bb78', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
        >
          Confirm Takeoff
        </button>
        
        <button 
          onClick={onExport}
          style={{ width: '100%', padding: '12px', backgroundColor: '#2d3748', color: '#f6ad55', fontWeight: 'bold', border: '2px solid #f6ad55', borderRadius: '4px', cursor: 'pointer' }}
        >
          Export Excel Report
        </button>
      </div>

      {/* 5. HISTORY */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '0.9rem', color: '#a0aec0' }}>History ({takeoffs.length})</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
          {takeoffs.map((t, i) => (
            <div key={i} style={{ fontSize: '0.75rem', padding: '8px', backgroundColor: '#2d3748', marginBottom: '5px', borderRadius: '4px' }}>
              <strong>{t.label}</strong>: {t.wallArea?.toFixed(1) || t.linearMeters?.toFixed(1)}m²
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
