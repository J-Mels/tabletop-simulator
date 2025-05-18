import React, { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import "./App.css";
import { Rect, Text } from "react-konva";
import Konva from "konva";

function App() {
  // Initialize stageSize with default values
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [boardImage, setBoardImage] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [deleteTokenId, setDeleteTokenId] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  // Reference to the canvas-container div
  const containerRef = useRef(null);

  const handleTokenDrag = (e, tokenId) => {
    const { x, y } = e.target.position();
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.id === tokenId ? { ...token, x, y } : token
      )
    );
  };

  const bringToFront = (tokenId) => {
    setTokens((prevTokens) => {
      const tokenIndex = prevTokens.findIndex((token) => token.id === tokenId);
      if (tokenIndex === -1 || tokenIndex === prevTokens.length - 1) {
        return prevTokens; // Token not found or already on top
      }
      const token = prevTokens[tokenIndex];
      return [
        ...prevTokens.slice(0, tokenIndex),
        ...prevTokens.slice(tokenIndex + 1),
        token, // Move selected token to the end
      ];
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">Tabletop Simulator</div>
        <div className="header-buttons">
          <button
            onClick={async () => {
              const dataUrl = await window.electronAPI.openBoardImage();
              if (dataUrl) {
                const img = new window.Image();
                img.src = dataUrl;
                img.onload = () => {
                  // Preserve aspect ratio and fit within 90% of parent container
                  const maxWidth = containerRef.current.clientWidth * 0.9;
                  const maxHeight = containerRef.current.clientHeight * 0.9;
                  let width = img.naturalWidth;
                  let height = img.naturalHeight;

                  // Scale down if image exceeds container limits
                  if (width > maxWidth || height > maxHeight) {
                    const scale = Math.min(
                      maxWidth / width,
                      maxHeight / height
                    );
                    width = width * scale;
                    height = height * scale;
                  }

                  setStageSize({ width, height });
                  setBoardImage(img);
                };
              }
            }}
          >
            Choose Board
          </button>

          <button
            onClick={async () => {
              const dataUrls = await window.electronAPI.openTokenImages();
              if (!dataUrls || dataUrls.length === 0) return;

              const loadedImages = await Promise.all(
                dataUrls.map(
                  (dataUrl, index) =>
                    new Promise((resolve) => {
                      const img = new window.Image();
                      img.src = dataUrl;
                      img.onload = () =>
                        resolve({
                          id: Date.now() + index,
                          name: `Token ${tokens.length + index + 1}`,
                          image: img,
                          x: 50 + index * 60,
                          y: 50,
                          width: 50,
                          height: 50,
                        });
                    })
                )
              );

              setTokens((prev) => [...prev, ...loadedImages]);
            }}
          >
            Choose Tokens
          </button>

          <button>Save Game</button>
          <button>Load Game</button>
        </div>
      </header>

      <div className="canvas-container" ref={containerRef}>
        <div className="tool-sidebar">
          <p className="tool">📐</p>
          <p className="tool">✏️</p>
          <p className="tool">
            <svg
              width="39"
              height="39"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 4L20 8L8 20L4 16L16 4Z"
                fill="pink"
                stroke="white"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 16L8 20"
                stroke="white"
                stroke-width="1"
                stroke-linecap="round"
              />
            </svg>
          </p>
        </div>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          className="canvas"
          onMouseDown={(e) => {
            const clickedOnDeleteButton =
              e.target?.attrs?.text === "Delete" ||
              e.target?.attrs?.id === "delete-bg";
            console.log(e.target.getZIndex());
            const clickedOnToken = e.target.getZIndex() > 0; // Check if target is a KonvaImage

            if (!clickedOnDeleteButton) {
              setDeleteTokenId(null);
              if (!clickedOnToken) setSelectedTokenId(null); // Clear only if not clicking a token
            }
            // if (!clickedOnDeleteButton && !clickedOnToken) {
            //   setDeleteTokenId(null);
            //   setSelectedTokenId(null); // Clear only if not clicking a token
            // }
          }}
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
            {tokens.map((token) => (
              <KonvaImage
                key={token.id}
                image={token.image}
                x={token.x}
                y={token.y}
                width={50}
                height={50}
                cornerRadius={30}
                draggable
                dragBoundFunc={(pos) => {
                  const minX = 0;
                  const minY = 0;
                  const maxX = stageSize.width - 50;
                  const maxY = stageSize.height - 50;

                  return {
                    x: Math.max(minX, Math.min(pos.x, maxX)),
                    y: Math.max(minY, Math.min(pos.y, maxY)),
                  };
                }}
                onDragEnd={(e) => handleTokenDrag(e, token.id)}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  e.cancelBubble = true;
                  setDeleteTokenId(token.id);
                  setSelectedTokenId(token.id);
                }}
                onMouseDown={() => {
                  bringToFront(token.id);
                  setSelectedTokenId(token.id);
                }}
                onMouseUp={() => setSelectedTokenId(null)}
                shadowBlur={selectedTokenId === token.id ? 12 : 0} // Add shadow if selected
                shadowColor="rgba(255, 0, 0, 0.9)" // Shadow color
                // shadowOffsetX={selectedTokenId === token.id ? 2 : 0} // Optional offset
                // shadowOffsetY={selectedTokenId === token.id ? 2 : 0}
              />
            ))}
          </Layer>
          <Layer>
            {tokens.map((token) =>
              deleteTokenId === token.id ? (
                <React.Fragment key={`delete-ui-${token.id}`}>
                  <Rect
                    id="delete-bg"
                    x={token.x + 55}
                    y={token.y}
                    width={60}
                    height={30}
                    fill="red"
                    cornerRadius={5}
                    shadowBlur={4}
                    onClick={() => {
                      setTokens((prev) =>
                        prev.filter((t) => t.id !== token.id)
                      );
                      setDeleteTokenId(null);
                    }}
                  />
                  <Text
                    x={token.x + 65}
                    y={token.y + 7}
                    text="Delete"
                    fill="white"
                    fontSize={14}
                    fontStyle="bold"
                    onClick={() => {
                      setTokens((prev) =>
                        prev.filter((t) => t.id !== token.id)
                      );
                      setDeleteTokenId(null);
                    }}
                  />
                </React.Fragment>
              ) : null
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;
