// components/TakeoffCanvas.js
import React, { useState } from 'react';
import { Stage, Layer, Line, Rect, Text } from 'react-konva';

const TakeoffCanvas = ({ mode, savedTakeoffs, onComplete }) => {
  const [points, setPoints] = useState([]);

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    setPoints([...points, pos.x, pos.y]);
  };

  const handleDoubleClick = () => {
    // Basic area/length placeholder - will be refined by your Shoelace/Linear logic
    const mockData = mode === 'interior' ? { wallArea: 25, floorArea: 15 } : { linearMeters: 10, exteriorType: 'eaves' };
    
    onComplete(points, mockData);
    setPoints([]); // Clear for next measurement
  };

  return (
    <div style={{ flexGrow: 1, cursor: 'crosshair' }}>
      <Stage width={window.innerWidth - 300} height={window.innerHeight}>
        <Layer>
          {/* Background */}
          <Rect width={2000} height={2000} fill="#ffffff" />
          
          {/* Draw Saved Takeoffs */}
          {savedTakeoffs.map((t, i) => (
            <Line
              key={i}
              points={t.points}
              fill={t.type === 'interior' ? "rgba(72, 187, 120, 0.3)" : "transparent"}
              stroke={t.type === 'interior' ? "#2f855a" : "#e53e3e"}
              strokeWidth={3}
              closed={t.type === 'interior'}
            />
          ))}

          {/* Draw Current Active Line */}
          <Line
            points={points}
            stroke="#3182ce"
            strokeWidth={2}
            dash={[5, 5]}
            closed={mode === 'interior' && points.length > 4}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default TakeoffCanvas;
