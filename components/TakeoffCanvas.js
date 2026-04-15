// components/TakeoffCanvas.js
import React, { useState } from 'react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';

const TakeoffCanvas = ({ mode, savedTakeoffs, onComplete, onCalibrate }) => {
  const [points, setPoints] = useState([]);
  const [calibPoints, setCalibPoints] = useState([]);

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();

    // 1. CALIBRATION LOGIC
    if (mode === 'calibrate') {
      const newCalib = [...calibPoints, pos.x, pos.y];
      setCalibPoints(newCalib);

      // Once we have two points (x1, y1, x2, y2)
      if (newCalib.length === 4) {
        const physicalLength = window.prompt("Enter known length in mm (e.g., 900 for a door):");
        if (physicalLength) {
          // Calculate pixel distance
          const dist = Math.sqrt(
            Math.pow(newCalib[2] - newCalib[0], 2) + 
            Math.pow(newCalib[3] - newCalib[1], 2)
          );
          onCalibrate(dist, parseFloat(physicalLength));
        }
        setCalibPoints([]); // Reset for next time
      }
      return;
    }

    // 2. STANDARD DRAWING LOGIC
    setPoints([...points, pos.x, pos.y]);
  };

  const handleDoubleClick = () => {
    if (points.length < 4) return;
    onComplete(points);
    setPoints([]);
  };

  return (
    <div style={{ flexGrow: 1, backgroundColor: '#cbd5e0' }}>
      <Stage width={window.innerWidth - 300} height={window.innerHeight}>
        <Layer>
          <Rect width={2000} height={2000} fill="white" />
          
          {/* Visualizing Calibration Points */}
          {calibPoints.map((p, i) => i % 2 === 0 && (
            <Circle key={i} x={calibPoints[i]} y={calibPoints[i+1]} radius={5} fill="red" />
          ))}
          <Line points={calibPoints} stroke="red" strokeWidth={2} />

          {/* Existing Takeoffs */}
          {savedTakeoffs.map((t, i) => (
            <Line
              key={i}
              points={t.points}
              fill={t.mode === 'interior' ? "rgba(72, 187, 120, 0.3)" : "transparent"}
              stroke={t.mode === 'interior' ? "#2f855a" : "#e53e3e"}
              strokeWidth={2}
              closed={t.mode === 'interior'}
            />
          ))}

          {/* Active Drawing */}
          <Line points={points} stroke="#3182ce" strokeWidth={2} closed={mode === 'interior'} />
        </Layer>
      </Stage>
    </div>
  );
};

export default TakeoffCanvas;
