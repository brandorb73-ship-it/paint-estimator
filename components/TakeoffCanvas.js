import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Image as KonvaImage } from 'react-konva';

const TakeoffCanvas = ({ mode, savedTakeoffs, onComplete, onCalibrate, backgroundImage }) => {
  const [points, setPoints] = useState([]);
  const [calibPoints, setCalibPoints] = useState([]);
  const [imageObj, setImageObj] = useState(null);

  // Load the plan image as a background
  useEffect(() => {
    if (backgroundImage) {
      const img = new window.Image();
      img.src = backgroundImage;
      img.onload = () => setImageObj(img);
    }
  }, [backgroundImage]);
  
const getCenterOfPoints = (points) => {
  let totalX = 0, totalY = 0;
  for (let i = 0; i < points.length; i += 2) {
    totalX += points[i];
    totalY += points[i + 1];
  }
  return { x: totalX / (points.length / 2), y: totalY / (points.length / 2) };
};
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

    // 2. DRAWING LOGIC
    setPoints([...points, pos.x, pos.y]);
  };

  const handleDblClick = () => {
    if (points.length < 4) return;
    onComplete(points);
    setPoints([]);
  };

  return (
    <div style={{ flexGrow: 1, backgroundColor: '#2d3748', overflow: 'hidden' }}>
      <Stage 
        width={window.innerWidth - 300} 
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onDblClick={handleDblClick}
      >
        <Layer>
          {/* Default Canvas Background */}
          <Rect width={5000} height={5000} fill="#f0f0f0" />
          
          {/* THE WORKING PLAN IMAGE */}
          {imageObj && (
            <KonvaImage
              image={imageObj}
              x={0}
              y={0}
              width={imageObj.width}
              height={imageObj.height}
            />
          )}

          {/* Calibration Visuals */}
          {calibPoints.map((p, i) => i % 2 === 0 && (
            <Circle key={i} x={calibPoints[i]} y={calibPoints[i+1]} radius={5} fill="red" />
          ))}
          <Line points={calibPoints} stroke="red" strokeWidth={2} />

          {/* Finished Takeoffs */}
{takeoffs.map((t) => {
  const center = getCenterOfPoints(t.points);
  return (
    <React.Fragment key={t.id}>
      <Line
        points={t.points}
        fill="rgba(72, 187, 120, 0.4)" // RAV Green fill
        stroke="#2f855a"
        strokeWidth={2}
        closed={true}
      />
      <Text 
        x={center.x} 
        y={center.y} 
        text={t.label} 
        fontSize={16}
        fill="white" 
        fontStyle="bold"
        align="center"
        shadowColor="black"
        shadowBlur={2}
        offsetX={20} // Centers the text roughly
      />
    </React.Fragment>
  );
})}

          {/* Active Line Drawing */}
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
