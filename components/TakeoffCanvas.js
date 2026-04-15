// components/TakeoffCanvas.js
import React, { useState } from 'react';
import { Stage, Layer, Line, Image, Rect } from 'react-konva';

const TakeoffCanvas = ({ savedPolygons, onCompletePolygon }) => {
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(true);

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // Add point to current drawing
    setPoints([...points, pos.x, pos.y]);
  };

  const handleDoubleClick = () => {
    // Finish the polygon
    onCompletePolygon(points);
    setPoints([]); // Reset for next room
  };

  return (
    <div style={{ flexGrow: 1, backgroundColor: '#f7fafc', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px 10px', borderRadius: '4px' }}>
        Double-click to close a room polygon
      </div>
      
      <Stage width={window.innerWidth - 300} height={window.innerHeight}>
        <Layer>
          {/* 1. Background (The PDF/Drawing would be here) */}
          <Rect width={1000} height={1000} fill="white" stroke="#e2e8f0" />

          {/* 2. Already Saved Takeoffs (The "Flood Fill" Visual) */}
          {savedPolygons.map((poly, i) => (
            <Line
              key={i}
              points={poly.points}
              fill="rgba(72, 187, 120, 0.4)" // Transparent Green
              stroke="#2f855a"
              strokeWidth={2}
              closed
            />
          ))}

          {/* 3. Current active drawing line */}
          <Line
            points={points}
            stroke="#3182ce"
            strokeWidth={3}
            dash={[10, 5]}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default TakeoffCanvas;
