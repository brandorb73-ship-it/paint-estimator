import React from 'react';

const Sidebar = ({ currentSettings, setSettings, mode, setMode, takeoffs, onSave, onUndo, onExport, onUpload }) => {
  
  // Helper to update specific counts like Doors or Cabinets
  const updateCount = (key, value) => {
    setSettings({ ...currentSettings, [key]: Math.max(0, (currentSettings[key] || 0) + value) });
  };

  const updateSetting = (key, value) => {
    setSettings({ ...currentSettings, [key]: value });
  };

  const getPaintLiters = (area) => {
    const coveragePerLiter = 12; 
    return ((area / coveragePerLiter) * 2).toFixed(2); 
  };

  return (
    <div style={{ width: '320px', backgroundColor: '#1a202c', color: 'white', padding: '20px', height: '100vh', overflowY: 'auto', borderRight: '2px solid #2d3748' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #4a5568', paddingBottom: '10px', color: '#63b3ed' }}>RAV Property Projects</h2>

      {/* LOAD PLAN SECTION */}
      <div style={{ marginBottom: '20px', marginTop: '10px' }}>
        <label htmlFor="plan-upload" style={uploadBtnStyle}>📁 Load Working Plan</label>
        <input id="plan-upload" type="file" accept="image/*,application/pdf" onChange={(e) => onUpload(e.target.files[0])} style={{ display: 'none' }} />
      </div>

      {/* CALIBRATION SECTION */}
      <div style={cardStyle}>
        <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: '8px' }}>
          Scale: {currentSettings.scale ? `${currentSettings.scale.toFixed(3)} mm/px` : '⚠️ Not Calibrated'}
        </p>
        <button onClick={() => setMode('calibrate')} style={{ ...btnBase, backgroundColor: mode === 'calibrate' ? '#ed8936' : '#4a5568' }}>
          {mode === 'calibrate' ? '📏 Click 2 Points' : '📏 Calibrate Scale'}
        </button>
      </div>

      {/* 1. PROJECT & BRAND (NEW FORENSIC FEATURES) */}
      <div style={cardStyle}>
        <label style={labelStyle}>Project Category</label>
        <select value={currentSettings.projectType} onChange={(e) => updateSetting('projectType', e.target.value)} style={inputStyle}>
          <option value="House Refresh">House Refresh</option>
          <option value="New Build">New Build</option>
          <option value="Boutique">Boutique</option>
          <option value="Aged Care">Aged Care (Bupa)</option>
          <option value="Pre-sale Touch up">Pre-sale Touch up</option>
        </select>

        <label style={{ ...labelStyle, marginTop: '10px' }}>Paint Brand</label>
        <select value={currentSettings.paintBrand} onChange={(e) => updateSetting('paintBrand', e.target.value)} style={inputStyle}>
          <option value="Dulux">Dulux</option>
          <option value="Haymes">Haymes</option>
          <option value="Taubmans">Taubmans</option>
          <option value="Wattyl">Wattyl</option>
          <option value="Porter's">Porter's (Specialty)</option>
        </select>
      </div>
<div style={{ marginBottom: '15px' }}>
  <label style={{ fontSize: '12px', color: '#a0aec0' }}>Surface Condition</label>
  <select 
    value={currentSettings.surfaceType} 
    onChange={(e) => setSettings({...currentSettings, surfaceType: e.target.value})}
    style={{ width: '100%', padding: '8px', background: '#2d3748', color: 'white', borderRadius: '4px' }}
  >
    <option value="Plaster">Standard Plaster</option>
    <option value="Fresh Render">Fresh Render (Porous)</option>
    <option value="Brick">Face Brick</option>
    <option value="Timber">Timber / Weatherboard</option>
  </select>
</div>
      {/* 2. MODE TOGGLE */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '5px' }}>
        <button onClick={() => setMode('interior')} style={{ ...toggleBtn, backgroundColor: mode === 'interior' ? '#3182ce' : '#2d3748' }}>Interior</button>
        <button onClick={() => setMode('exterior')} style={{ ...toggleBtn, backgroundColor: mode === 'exterior' ? '#3182ce' : '#2d3748' }}>Exterior</button>
      </div>

      {/* 3. INTERIOR SETTINGS (RESTORED) */}
      {mode === 'interior' && (
        <>
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Ceiling Height</label>
            <select 
              value={currentSettings.wallHeight} 
              onChange={(e) => updateSetting('wallHeight', parseFloat(e.target.value))}
              style={inputStyle}
            >
              <option value={2.4}>Standard (2.4m)</option>
              <option value={2.7}>High (2.7m)</option>
              <option value={3.3}>Victorian (3.3m+)</option>
            </select>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Room Inventory</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {['doors', 'windows', 'cabinets'].map(item => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ textTransform: 'capitalize' }}>{item}</span>
                  <div>
                    <button onClick={() => updateCount(item, -1)} style={countBtnStyle}>-</button>
                    <span style={{ margin: '0 10px', minWidth: '20px', display: 'inline-block', textAlign: 'center' }}>{currentSettings[item] || 0}</span>
                    <button onClick={() => updateCount(item, 1)} style={countBtnStyle}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 4. EXTERIOR SETTINGS (PORCH LOGIC ADDED) */}
      {mode === 'exterior' && (
        <>
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Exterior Feature</label>
            <select value={currentSettings.exteriorType} onChange={(e) => updateSetting('exteriorType', e.target.value)} style={inputStyle}>
              <option value="weatherboard">Weatherboard Wall</option>
              <option value="porch">Porch / Deck (Floor)</option>
              <option value="eaves">Eaves / Soffits</option>
              <option value="fascia">Fascia & Gutter</option>
              <option value="render">Render / Brick</option>
            </select>
          </div>
          <div style={{ marginTop: '15px' }}>
            <label style={labelStyle}>Surface Height/Multiplier (m)</label>
            <input type="number" step="0.1" value={currentSettings.wallHeight} onChange={(e) => updateSetting('wallHeight', parseFloat(e.target.value))} style={inputStyle} />
          </div>
        </>
      )}

      {/* 5. ACTIONS */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #4a5568', paddingTop: '20px' }}>
        <button onClick={onUndo} style={{ ...btnBase, backgroundColor: '#e53e3e', marginBottom: '10px' }}>
          {takeoffs.length > 0 ? 'Undo Last Takeoff' : 'Reset Scale'}
        </button>
        <button onClick={onSave} style={{ ...btnBase, backgroundColor: '#48bb78', marginBottom: '10px', fontSize: '1rem' }}>Confirm Takeoff</button>
        <button onClick={onExport} style={{ ...btnBase, backgroundColor: '#2d3748', color: '#f6ad55', border: '2px solid #f6ad55' }}>Export Excel Report</button>
          <button 
  onClick={() => window.print()}
  style={{ 
    marginTop: '10px', 
    padding: '12px', 
    background: '#4a5568', 
    color: 'white', 
    borderRadius: '6px',
    fontWeight: 'bold'
  }}
>
  Print Full Project (PDF)
</button>
      </div>

      {/* 6. HISTORY (RESTORED & IMPROVED) */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={labelStyle}>History ({takeoffs.length})</h3>
        <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
          {takeoffs.map((t, i) => (
            <div key={i} style={historyCardStyle(t.mode)}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{t.label}</div>
              <div style={{ fontSize: '0.7rem' }}>Area: {t.wallArea?.toFixed(1)}m² | {t.wallHeight}m H</div>
              {t.mode === 'interior' && (
                <div style={{ color: '#63b3ed', marginTop: '4px', fontSize: '0.7rem' }}>💧 Approx. {getPaintLiters(t.wallArea)}L Paint</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- STYLES (To keep code clean) ---
const btnBase = { width: '100%', padding: '12px', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const uploadBtnStyle = { ...btnBase, display: 'block', backgroundColor: '#3182ce', textAlign: 'center' };
const inputStyle = { width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#2d3748', color: 'white', border: '1px solid #4a5568' };
const cardStyle = { marginTop: '20px', padding: '15px', backgroundColor: '#2d3748', borderRadius: '8px', border: '1px solid #4a5568' };
const labelStyle = { fontSize: '0.8rem', color: '#a0aec0', fontWeight: 'bold' };
const toggleBtn = { flex: 1, padding: '8px', fontSize: '0.8rem', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' };
const countBtnStyle = { padding: '2px 10px', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '3px' };
const historyCardStyle = (mode) => ({ 
  fontSize: '0.75rem', padding: '10px', backgroundColor: '#2d3748', marginBottom: '8px', borderRadius: '4px', 
  borderLeft: mode === 'interior' ? '4px solid #48bb78' : '4px solid #ed8936' 
});

export default Sidebar;
