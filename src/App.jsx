import React, { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import "./App.css";
import { Rect, Text } from "react-konva";

function App() {
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [boardImage, setBoardImage] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [deleteTokenId, setDeleteTokenId] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [contextMenuTokenSize, setContextMenuTokenSize] = useState(null);
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
        return prevTokens;
      }
      const token = prevTokens[tokenIndex];
      return [
        ...prevTokens.slice(0, tokenIndex),
        ...prevTokens.slice(tokenIndex + 1),
        token,
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
                  const maxWidth = containerRef.current.clientWidth * 0.9;
                  const maxHeight = containerRef.current.clientHeight * 0.9;
                  let width = img.naturalWidth;
                  let height = img.naturalHeight;

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
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16L8 20"
                stroke="white"
                strokeWidth="1"
                strokeLinecap="round"
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
              e.target?.attrs?.text === "Increase size" ||
              e.target?.attrs?.text === "Decrease size" ||
              e.target?.attrs?.id === "delete-bg" ||
              e.target?.attrs?.id === "increase-bg" ||
              e.target?.attrs?.id === "decrease-bg";
            const clickedOnToken = e.target.getZIndex() > 0;

            if (!clickedOnDeleteButton) {
              setDeleteTokenId(null);
              setContextMenuTokenSize(null);
              if (!clickedOnToken) setSelectedTokenId(null);
            }
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
                width={token.width}
                height={token.height}
                cornerRadius={token.width * 0.6}
                draggable
                dragBoundFunc={(pos) => {
                  const minX = 0;
                  const minY = 0;
                  const maxX = stageSize.width - token.width;
                  const maxY = stageSize.height - token.height;

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
                  setContextMenuTokenSize({
                    width: token.width,
                    height: token.height,
                  });
                }}
                onMouseDown={() => {
                  bringToFront(token.id);
                  setSelectedTokenId(token.id);
                }}
                onMouseUp={() => setSelectedTokenId(null)}
                shadowBlur={selectedTokenId === token.id ? 12 : 0}
                shadowColor="rgba(255, 0, 0, 0.9)"
              />
            ))}
          </Layer>
          <Layer>
            {tokens.map((token) =>
              deleteTokenId === token.id ? (
                <React.Fragment key={`context-ui-${token.id}`}>
                  {/* Delete Button */}
                  <Rect
                    id="delete-bg"
                    x={
                      token.x + (contextMenuTokenSize?.width || token.width) + 5
                    }
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
                      setSelectedTokenId(null);
                      setContextMenuTokenSize(null);
                    }}
                  />
                  <Text
                    x={
                      token.x +
                      (contextMenuTokenSize?.width || token.width) +
                      15
                    }
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
                      setSelectedTokenId(null);
                      setContextMenuTokenSize(null);
                    }}
                  />
                  {/* Increase Size Button */}
                  <Rect
                    id="increase-bg"
                    x={
                      token.x + (contextMenuTokenSize?.width || token.width) + 5
                    }
                    y={token.y + 35}
                    width={105}
                    height={30}
                    fill="blue"
                    cornerRadius={5}
                    shadowBlur={4}
                    onClick={() => {
                      setTokens((prev) =>
                        prev.map((t) =>
                          t.id === token.id
                            ? { ...t, width: t.width + 5, height: t.height + 5 }
                            : t
                        )
                      );
                      setSelectedTokenId(null); // Clear highlight only
                    }}
                  />
                  <Text
                    x={
                      token.x +
                      (contextMenuTokenSize?.width || token.width) +
                      15
                    }
                    y={token.y + 42}
                    text="Increase size"
                    fill="white"
                    fontSize={14}
                    fontStyle="bold"
                    onClick={() => {
                      setTokens((prev) =>
                        prev.map((t) =>
                          t.id === token.id
                            ? { ...t, width: t.width + 5, height: t.height + 5 }
                            : t
                        )
                      );
                      setSelectedTokenId(null); // Clear highlight only
                    }}
                  />
                  {/* Decrease Size Button */}
                  <Rect
                    id="decrease-bg"
                    x={
                      token.x + (contextMenuTokenSize?.width || token.width) + 5
                    }
                    y={token.y + 70}
                    width={110}
                    height={30}
                    fill="green"
                    cornerRadius={5}
                    shadowBlur={4}
                    onClick={() => {
                      setTokens((prev) =>
                        prev.map((t) =>
                          t.id === token.id
                            ? {
                                ...t,
                                width: Math.max(25, t.width - 5),
                                height: Math.max(25, t.height - 5),
                              }
                            : t
                        )
                      );
                      setSelectedTokenId(null); // Clear highlight only
                    }}
                  />
                  <Text
                    x={
                      token.x +
                      (contextMenuTokenSize?.width || token.width) +
                      15
                    }
                    y={token.y + 77}
                    text="Decrease size"
                    fill="white"
                    fontSize={14}
                    fontStyle="bold"
                    onClick={() => {
                      setTokens((prev) =>
                        prev.map((t) =>
                          t.id === token.id
                            ? {
                                ...t,
                                width: Math.max(25, t.width - 5),
                                height: Math.max(25, t.height - 5),
                              }
                            : t
                        )
                      );
                      setSelectedTokenId(null); // Clear highlight only
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
