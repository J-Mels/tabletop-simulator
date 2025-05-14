import React from "react";
import { useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import "./App.css";

function App() {
  const [stageSize] = useState({ width: 800, height: 600 });

  return (
    <div className="app">
      <h1>Tabletop Simulator</h1>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        className="canvas"
      >
        <Layer>
          {/* Placeholder map area */}
          <Rect
            x={0}
            y={0}
            width={stageSize.width}
            height={stageSize.height}
            fill="#f0f0f0"
            stroke="black"
            strokeWidth={2}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
