import React, { useState, useEffect } from 'react';
// 1. ADD 'Text' TO THIS IMPORT LINE
import { Stage, Layer, Line, Rect, Circle, Text, Image as KonvaImage } from 'react-konva';

const TakeoffCanvas = ({ mode, savedTakeoffs, onComplete, onCalibrate, backgroundImage }) => {
  const [points, setPoints] = useState([]);
  const [calibPoints, setCalibPoints] = useState([]);
  const [imageObj, setImageObj] = useState(null);

  useEffect(() => {
    if (backgroundImage) {
      const img = new window.Image();
      img.src = backgroundImage;
      img.onload = () => setImageObj(img);
    }
  }, [backgroundImage]);
  
  const getCenterOfPoints = (points) => {
    if (!points || points.length === 0) return { x: 0, y: 0 };
    let totalX = 0, totalY = 0;
    for (let i = 0; i < points.length; i += 2) {
      totalX += points[i];
      totalY += points[i + 1];
    }
    return { x: totalX / (points.length / 2), y: totalY / (points.length / 2) };
  };

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (mode === 'calibrate') {
      const newCalib = [...calibPoints, pos.x, pos.y];
      setCalibPoints(newCalib);
      if (newCalib.length === 4) {
        const physicalLength = window.prompt("Enter known length in mm:");
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
        width={typeof window !== 'undefined' ? window.innerWidth - 300 : 800} 
        height={typeof window !== 'undefined' ? window.innerHeight : 600}
        onMouseDown={handleMouseDown}
        onDblClick={handleDblClick}
      >
        <Layer>
          <Rect width={5000} height={5000} fill="#f0f0f0" />
          
          {imageObj && (
            <KonvaImage
              image={imageObj}
              x={0}
              y={0}
              width={imageObj.width}
              height={imageObj.height}
            />
          )}

          {calibPoints.map((p, i) => i % 2 === 0 && (
            <Circle key={i} x={calibPoints[i]} y={calibPoints[i+1]} radius={5} fill="red" />
          ))}
          <Line points={calibPoints} stroke="red" strokeWidth={2} />

          {/* 2. CHANGE 'takeoffs.map' TO 'savedTakeoffs.map' */}
          {savedTakeoffs && savedTakeoffs.map((t) => {
            const center = getCenterOfPoints(t.points);
            return (
              <React.Fragment key={t.id}>
                <Line
                  points={t.points}
                  fill="rgba(72, 187, 120, 0.4)" 
                  stroke="#2f855a"
                  strokeWidth={2}
                  closed={true}
                />
                <Text 
                  x={center.x - 20} 
                  y={center.y} 
                  text={t.label} 
                  fontSize={14}
                  fill="black" 
                  fontStyle="bold"
                  align="center"
                />
              </React.Fragment>
            );
          })}

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
