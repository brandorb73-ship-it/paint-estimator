// components/Sidebar.js
import React from 'react';

const Sidebar = ({ currentSettings, setSettings, onSave, takeoffs }) => {
  return (
    <div style={{ width: '300px', backgroundColor: '#1a202c', color: 'white', padding: '20px', height: '100vh', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid #4a5568', paddingBottom: '10px' }}>Working Chart</h2>
      
      <div style={{ marginTop: '20px' }}>
        <label>Ceiling Height</label>
        <select 
          value={currentSettings.ceilingType} 
          onChange={(e) => setSettings({...currentSettings, ceilingType: e.target.value})}
          style={{ width: '100%', padding: '8px', marginTop: '5px', color: 'black' }}
        >
          <option value="standard">Standard (2.4m)</option>
          <option value="high">High (2.7m)</option>
          <option value="victorian">Victorian (3.3m+)</option>
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Window Frames</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
          <label><input type="radio" name="window" value="aluminum" checked={currentSettings.windowType === 'aluminum'} onChange={() => setSettings({...currentSettings, windowType: 'aluminum'})} /> Aluminum</label>
          <label><input type="radio" name="window" value="timber" checked={currentSettings.windowType === 'timber'} onChange={() => setSettings({...currentSettings, windowType: 'timber'})} /> Timber (Requires Prep)</label>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Extra Features</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label><input type="checkbox" onChange={(e) => setSettings({...currentSettings, addSkirting: e.target.checked})} /> High Skirtings</label>
          <label><input type="checkbox" onChange={(e) => setSettings({...currentSettings, addCornice: e.target.checked})} /> Decorative Cornice</label>
        </div>
      </div>

      <button 
        onClick={onSave}
        style={{ width: '100%', padding: '12px', backgroundColor: '#3182ce', color: 'white', marginTop: '30px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Save Area Takeoff
      </button>

      <div style={{ marginTop: '40px' }}>
        <h3>History ({takeoffs.length})</h3>
        <ul style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          {takeoffs.map((t, i) => (
            <li key={i} style={{ marginBottom: '5px' }}>{t.label}: {t.area.toFixed(2)}m²</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
