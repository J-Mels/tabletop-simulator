import React, { useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import "./App.css";

function App() {
  const [stageSize] = useState({ width: 800, height: 600 });
  const [boardImage, setBoardImage] = useState(null);

  // Handle board file upload
  const handleBoardUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          setBoardImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="app">
      <h1>Tabletop Simulator</h1>
      <div className="controls">
        <label>
          Upload Board:
          <input type="file" accept="image/*" onChange={handleBoardUpload} />
        </label>
        {/* Placeholder for token selection */}
        <button disabled>Select Token (Coming Soon)</button>
      </div>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        className="canvas"
      >
        <Layer>
          {boardImage ? (
            <KonvaImage
              image={boardImage}
              width={stageSize.width}
              height={stageSize.height}
              x={0}
              y={0}
            />
          ) : (
            <KonvaImage
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fill="#f0f0f0"
              stroke="black"
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
