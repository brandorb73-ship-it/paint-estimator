import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Image as KonvaImage } from 'react-konva';

const TakeoffCanvas = ({ mode, savedTakeoffs, onComplete, onCalibrate, backgroundImage }) => {
  const [points, setPoints] = useState([]);
  const [calibPoints, setCalibPoints] = useState([]);
  const [imageObj, setImageObj] = useState(null);

  // Handle Plan Image Loading
  useEffect(() => {
    if (backgroundImage) {
      const img = new window.Image();
      img.src = backgroundImage;
      img.onload = () => {
        setImageObj(img);
      };
    }
  }, [backgroundImage]);

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();

    // 1. CALIBRATION LOGIC
    if (mode === 'calibrate') {
      const newCalib = [...calibPoints, pos.x, pos.y];
      setCalibPoints(newCalib);

      if (newCalib.length === 4) {
        const physicalLength = window.prompt("Enter known length in mm (e.g., 900 for a door):");
        if (physicalLength) {
          const dist = Math.sqrt(
            Math.pow(newCalib[2] - newCalib[0], 2) + 
            Math.pow(newCalib[3] - newCalib[1], 2)
          );
          onCalibrate(dist, parseFloat(physicalLength));
        }
        setCalibPoints([]); 
      }
      return;
    }

    // 2. STANDARD DRAWING LOGIC
    setPoints([...points, pos.x, pos.y]);
  };

  // Add the listener for finishing a shape
  const handleDblClick = () => {
    if (points.length < 4) return;
    onComplete(points);
    setPoints([]);
  };

  return (
    <div style={{ flexGrow: 1, backgroundColor: '#2d3748' }}>
      <Stage 
        width={window.innerWidth - 300} 
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onDblClick={handleDblClick}
      >
      <Layer>
  {/* 1. Gray background if no image exists */}
  {!imageObj && <Rect width={5000} height={5000} fill="#2d3748" />}

  {/* 2. The Plan Image */}
  {imageObj && (
    <KonvaImage
      image={imageObj}
      x={0}
      y={0}
      // Ensure the canvas is big enough for the plan
      width={imageObj.width}
      height={imageObj.height}
    />
  )}

  {/* 3. Your Drawings (must be AFTER the image to stay on top) */}
 {savedTakeoffs.map((t, i) => (
  <Line
    key={i}
    points={t.points}
    fill={t.mode === 'interior' ? "rgba(72, 187, 120, 0.3)" : "rgba(229, 62, 62, 0.1)"}
    stroke={t.mode === 'interior' ? "#2f855a" : "#e53e3e"}
    strokeWidth={2}
    closed={t.mode === 'interior'}
  />
))}
</Layer>

          {/* Visualizing Calibration Points */}
          {calibPoints.map((p, i) => i % 2 === 0 && (
            <Circle key={i} x={calibPoints[i]} y={calibPoints[i+1]} radius={5} fill="red" />
          ))}
          <Line points={calibPoints} stroke="red" strokeWidth={2} />

          {/* Existing Takeoffs (Finished Rooms/Walls) */}
          {savedTakeoffs.map((t, i) => (
            <Line
              key={i}
              points={t.points}
              fill={t.mode === 'interior' ? "rgba(72, 187, 120, 0.3)" : "rgba(229, 62, 62, 0.1)"}
              stroke={t.mode === 'interior' ? "#2f855a" : "#e53e3e"}
              strokeWidth={2}
              closed={t.mode === 'interior'}
            />
          ))}

          {/* Active Drawing (What you are clicking right now) */}
          <Line 
            points={points} 
            stroke={mode === 'interior' ? "#3182ce" : "#e53e3e"} 
            strokeWidth={3} 
            closed={mode === 'interior'} 
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default TakeoffCanvas;
