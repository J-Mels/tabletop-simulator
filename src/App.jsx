import React, { useState, useRef } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Text,
  Circle,
  Rect,
  Group,
} from "react-konva";
import "./App.css";

function App() {
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [boardImage, setBoardImage] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [deleteTokenId, setDeleteTokenId] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [contextMenuTokenSize, setContextMenuTokenSize] = useState(null);
  const [rulerMode, setRulerMode] = useState(false);
  const [rulerState, setRulerState] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isDrawing: false,
  });
  const [drawMode, setDrawMode] = useState(false);
  const [drawColor, setDrawColor] = useState("black");
  const [drawLines, setDrawLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [eraseDropdown, setEraseDropdown] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
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

  const assignTokenLabels = (tokens = []) => {
    const tokenGroups = {};
    tokens.forEach((token) => {
      const imageSrc = token.image.src;
      if (!tokenGroups[imageSrc]) {
        tokenGroups[imageSrc] = [];
      }
      tokenGroups[imageSrc].push(token);
    });

    const updatedTokens = [...tokens];
    Object.values(tokenGroups).forEach((group) => {
      if (group.length > 1) {
        group.sort((a, b) => a.id - b.id);
        const existingLabels = group.map((token) => parseInt(token.label) || 0);
        const validLabels = existingLabels.filter(
          (label) => !isNaN(label) && label > 0
        );
        const maxLabel = validLabels.length > 0 ? Math.max(...validLabels) : 0;

        group.forEach((token, index) => {
          const tokenIndex = updatedTokens.findIndex((t) => t.id === token.id);
          const newLabel = (index + 1).toString();
          updatedTokens[tokenIndex] = { ...token, label: newLabel };
        });
      } else {
        const token = group[0];
        const tokenIndex = updatedTokens.findIndex((t) => t.id === token.id);
        updatedTokens[tokenIndex] = { ...token, label: "" };
      }
    });

    return updatedTokens;
  };

  const handleRulerMouseDown = (e) => {
    if (!rulerMode) return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    setRulerState({
      startX: pointerPos.x,
      startY: pointerPos.y,
      endX: pointerPos.x,
      endY: pointerPos.y,
      isDrawing: true,
    });
  };

  const handleRulerMouseMove = (e) => {
    if (!rulerMode || !rulerState.isDrawing) return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    setRulerState((prev) => ({
      ...prev,
      endX: pointerPos.x,
      endY: pointerPos.y,
    }));
  };

  const handleRulerMouseUp = () => {
    if (!rulerMode || !rulerState.isDrawing) return;
    setRulerState((prev) => ({
      ...prev,
      isDrawing: false,
    }));
  };

  const handleDrawMouseDown = (e) => {
    if (!drawMode) return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    setIsDrawing(true);
    setDrawLines((prev) => [
      ...prev,
      { points: [pointerPos.x, pointerPos.y], color: drawColor },
    ]);
  };

  const handleDrawMouseMove = (e) => {
    if (!drawMode || !isDrawing) return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    setDrawLines((prev) => {
      const newLines = [...prev];
      const currentLine = newLines[newLines.length - 1];
      currentLine.points = [...currentLine.points, pointerPos.x, pointerPos.y];
      return newLines;
    });
  };

  const handleDrawMouseUp = () => {
    if (!drawMode || !isDrawing) return;
    setIsDrawing(false);
  };

  const handleEraseMouseDown = (e) => {
    if (!eraseMode) return;
    setIsErasing(true);
    handleErase(e);
  };

  const handleEraseMouseMove = (e) => {
    if (!eraseMode || !isErasing) return;
    handleErase(e);
  };

  const handleEraseMouseUp = () => {
    if (!eraseMode || !isErasing) return;
    setIsErasing(false);
  };

  const pointToSegmentDistance = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    const projectionX = x1 + t * dx;
    const projectionY = y1 + t * dy;

    return Math.sqrt(
      Math.pow(px - projectionX, 2) + Math.pow(py - projectionY, 2)
    );
  };

  const handleErase = (e) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    const eraseRadius = 10;

    setDrawLines((prevLines) => {
      let newLines = [];
      prevLines.forEach((line) => {
        let currentSegment = [];
        let keepPoints = [];
        let segmentsToAdd = [];
        let i = 0;

        while (i < line.points.length) {
          const x = line.points[i];
          const y = line.points[i + 1];
          currentSegment.push(x, y);
          i += 2;

          if (currentSegment.length >= 4) {
            const x1 = currentSegment[currentSegment.length - 4];
            const y1 = currentSegment[currentSegment.length - 3];
            const x2 = currentSegment[currentSegment.length - 2];
            const y2 = currentSegment[currentSegment.length - 1];

            const distance = pointToSegmentDistance(
              pointerPos.x,
              pointerPos.y,
              x1,
              y1,
              x2,
              y2
            );

            if (distance <= eraseRadius) {
              if (keepPoints.length >= 2) {
                segmentsToAdd.push({
                  points: [...keepPoints],
                  color: line.color,
                });
              }
              keepPoints = [x2, y2];
            } else {
              keepPoints.push(x, y);
            }
          } else {
            keepPoints.push(x, y);
          }
        }

        if (keepPoints.length >= 4) {
          segmentsToAdd.push({
            points: [...keepPoints],
            color: line.color,
          });
        }

        newLines.push(...segmentsToAdd);
      });

      return newLines;
    });
  };

  const handleClearDrawings = () => {
    setDrawLines([]);
  };

  const handleDuplicateToken = () => {
    const tokenToDuplicate = tokens.find((t) => t.id === deleteTokenId);
    if (!tokenToDuplicate) return;

    const newToken = {
      ...tokenToDuplicate,
      id: Date.now(),
      x: 50,
      y: 50,
    };

    setTokens((prev) => {
      const updatedTokens = [...prev, newToken];
      return assignTokenLabels(updatedTokens, [newToken]);
    });
    setDeleteTokenId(null);
    setSelectedTokenId(null);
    setContextMenuTokenSize(null);
  };

  const handleResetBoard = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    setBoardImage(null);
    setTokens([]);
    setDrawLines([]);
    setStageSize({ width: 800, height: 600 });
    setShowResetDialog(false);
  };

  const cancelReset = () => {
    setShowResetDialog(false);
  };

  const serializeState = () => {
    const state = {
      stageSize,
      boardImage: boardImage ? boardImage.src : null,
      tokens: tokens.map((token) => ({
        id: token.id,
        name: token.name,
        x: token.x,
        y: token.y,
        width: token.width,
        height: token.height,
        label: token.label,
        imageSrc: token.image.src,
      })),
      drawLines,
    };
    return state;
  };

  const deserializeState = async (gameState) => {
    // Restore stageSize
    setStageSize(gameState.stageSize);

    // Restore boardImage
    if (gameState.boardImage) {
      const img = new window.Image();
      img.src = gameState.boardImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      setBoardImage(img);
    } else {
      setBoardImage(null);
    }

    // Restore tokens
    const loadedTokens = await Promise.all(
      gameState.tokens.map(async (token) => {
        const img = new window.Image();
        img.src = token.imageSrc;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        return {
          id: token.id,
          name: token.name,
          x: token.x,
          y: token.y,
          width: token.width,
          height: token.height,
          label: token.label,
          image: img,
        };
      })
    );
    setTokens(loadedTokens);

    // Restore drawLines
    setDrawLines(gameState.drawLines);
  };

  const handleSaveGame = async () => {
    try {
      const state = serializeState();
      const result = await window.electronAPI.saveGame(state);
      if (!result.success && result.error !== "Save canceled") {
        setErrorMessage(`Failed to save game: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage(`Error saving game: ${err.message}`);
    }
  };

  const handleLoadGame = () => {
    setShowLoadDialog(true);
  };

  const confirmLoad = async () => {
    try {
      const result = await window.electronAPI.loadGame();
      if (result.success) {
        await deserializeState(result.gameState);
      } else if (result.error !== "Load canceled") {
        setErrorMessage(`Failed to load game: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage(`Error loading game: ${err.message}`);
    }
    setShowLoadDialog(false);
  };

  const cancelLoad = () => {
    setShowLoadDialog(false);
  };

  const clearError = () => {
    setErrorMessage(null);
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
                          label: "",
                        });
                    })
                )
              );

              setTokens((prev) => {
                const updatedTokens = [...prev, ...loadedImages];
                return assignTokenLabels(updatedTokens, loadedImages);
              });
            }}
          >
            Choose Tokens
          </button>
          <button onClick={handleSaveGame}>Save Game</button>
          <button onClick={handleLoadGame}>Load Game</button>
          <button onClick={handleResetBoard}>Reset Board</button>
        </div>
      </header>

      <div className="canvas-container" ref={containerRef}>
        <div className="tool-sidebar">
          <div
            className={`tool ${rulerMode ? "active" : ""}`}
            id="ruler"
            onClick={() => {
              setRulerMode((prev) => !prev);
              setDrawMode(false);
              setShowColorDropdown(false);
              setEraseMode(false);
              setEraseDropdown(false);
              if (rulerMode) {
                setRulerState({
                  startX: 0,
                  startY: 0,
                  endX: 0,
                  endY: 0,
                  isDrawing: false,
                });
              }
            }}
          >
            📐
          </div>
          <div className="tool-container">
            <div
              className={`tool ${drawMode ? "active" : ""}`}
              id="draw"
              onClick={() => {
                setDrawMode((prev) => {
                  const newDrawMode = !prev;
                  setShowColorDropdown(newDrawMode);
                  setRulerMode(false);
                  setEraseMode(false);
                  setEraseDropdown(false);
                  setRulerState({
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    endY: 0,
                    isDrawing: false,
                  });
                  if (!newDrawMode) {
                    setIsDrawing(false);
                  }
                  return newDrawMode;
                });
              }}
            >
              ✏️
            </div>
            {showColorDropdown && (
              <div className="color-dropdown">
                <svg
                  width="20"
                  height="20"
                  onClick={() => {
                    setDrawColor("black");
                  }}
                >
                  <circle cx="10" cy="10" r="5" fill="black" />
                </svg>
                <svg
                  width="20"
                  height="20"
                  onClick={() => {
                    setDrawColor("white");
                  }}
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="5"
                    fill="white"
                    stroke="black"
                    strokeWidth="1"
                  />
                </svg>
                <svg
                  width="20"
                  height="20"
                  onClick={() => {
                    setDrawColor("red");
                  }}
                >
                  <circle cx="10" cy="10" r="5" fill="red" />
                </svg>
              </div>
            )}
          </div>
          <div className="tool-container">
            <div
              className={`tool ${eraseMode ? "active" : ""}`}
              id="erase"
              onClick={() => {
                setEraseMode((prev) => !prev);
                setRulerMode(false);
                setDrawMode(false);
                setShowColorDropdown(false);
                setEraseDropdown(eraseMode ? false : true);
                setRulerState({
                  startX: 0,
                  startY: 0,
                  endX: 0,
                  endY: 0,
                  isDrawing: false,
                });
                setIsDrawing(false);
              }}
            >
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 11H19A3 3 0 0122 14V16A3 3 0 0119 19H5A3 3 0 012 16V14A3 3 0 015 11Z"
                  fill="#ff85a2"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {eraseDropdown && (
              <div className="erase-dropdown">
                <span onClick={handleClearDrawings} style={{ margin: 0 }}>
                  Clear All
                </span>
              </div>
            )}
          </div>
        </div>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          className="canvas"
          onMouseDown={(e) => {
            if (rulerMode) {
              handleRulerMouseDown(e);
              return;
            }
            if (drawMode) {
              handleDrawMouseDown(e);
              return;
            }
            if (eraseMode) {
              handleEraseMouseDown(e);
              return;
            }
            const clickedOnContextMenu =
              e.target?.attrs?.text === "Delete" ||
              e.target?.attrs?.text === "Increase size" ||
              e.target?.attrs?.text === "Decrease size" ||
              e.target?.attrs?.text === "Duplicate" ||
              e.target?.attrs?.id === "delete-bg" ||
              e.target?.attrs?.id === "increase-bg" ||
              e.target?.attrs?.id === "decrease-bg" ||
              e.target?.attrs?.id === "duplicate-bg";
            if (!clickedOnContextMenu) {
              setDeleteTokenId(null);
              setContextMenuTokenSize(null);
            }
          }}
          onMouseMove={(e) => {
            if (rulerMode) {
              handleRulerMouseMove(e);
            }
            if (drawMode) {
              handleDrawMouseMove(e);
            }
            if (eraseMode) {
              handleEraseMouseMove(e);
            }
          }}
          onMouseUp={(e) => {
            if (rulerMode) {
              handleRulerMouseUp(e);
            }
            if (drawMode) {
              handleDrawMouseUp(e);
            }
            if (eraseMode) {
              handleEraseMouseUp(e);
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
          </Layer>
          <Layer>
            {drawLines.map((line, index) => (
              <Line
                key={index}
                points={line.points}
                stroke={line.color}
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
          <Layer>
            {tokens.map((token) => (
              <Group
                key={token.id}
                x={token.x}
                y={token.y}
                draggable={!rulerMode && !drawMode && !eraseMode}
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
                onDragStart={() => {
                  if (rulerMode || drawMode || eraseMode) return;
                  bringToFront(token.id);
                  setSelectedTokenId(token.id);
                }}
                onDragEnd={(e) => {
                  if (rulerMode || drawMode || eraseMode) return;
                  handleTokenDrag(e, token.id);
                  setSelectedTokenId(null);
                }}
                onContextMenu={(e) => {
                  if (rulerMode || drawMode || eraseMode) return;
                  e.evt.preventDefault();
                  e.cancelBubble = true;
                  setDeleteTokenId(token.id);
                  setSelectedTokenId(token.id);
                  setContextMenuTokenSize({
                    width: token.width,
                    height: token.height,
                  });
                }}
                onMouseDown={(e) => {
                  if (rulerMode || drawMode || eraseMode) return;
                  const clickedOnContextMenu =
                    e.target?.attrs?.text === "Delete" ||
                    e.target?.attrs?.text === "Increase size" ||
                    e.target?.attrs?.text === "Decrease size" ||
                    e.target?.attrs?.text === "Duplicate" ||
                    e.target?.attrs?.id === "delete-bg" ||
                    e.target?.attrs?.id === "increase-bg" ||
                    e.target?.attrs?.id === "decrease-bg" ||
                    e.target?.attrs?.id === "duplicate-bg";
                  if (!clickedOnContextMenu) {
                    setDeleteTokenId(null);
                    setContextMenuTokenSize(null);
                    bringToFront(token.id);
                    setSelectedTokenId(token.id);
                  }
                }}
                onMouseUp={() => {
                  if (rulerMode || drawMode || eraseMode) return;
                  setSelectedTokenId(null);
                }}
              >
                <KonvaImage
                  image={token.image}
                  x={0}
                  y={0}
                  width={token.width}
                  height={token.height}
                  cornerRadius={token.width * 0.6}
                  shadowBlur={selectedTokenId === token.id ? 12 : 0}
                  shadowColor="rgba(255, 0, 0, 0.9)"
                />
                {token.label && (
                  <Text
                    x={token.width / 2}
                    y={token.height / 2}
                    text={token.label}
                    fontSize={20}
                    fontStyle="bold"
                    fill="white"
                    align="center"
                    verticalAlign="middle"
                    offsetX={token.label.length * 5}
                    offsetY={10}
                    shadowColor="black"
                    shadowBlur={2}
                    shadowOffsetX={1}
                    shadowOffsetY={1}
                  />
                )}
              </Group>
            ))}
          </Layer>
          <Layer>
            {tokens.map((token) =>
              deleteTokenId === token.id ? (
                <React.Fragment key={`context-ui-${token.id}`}>
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
                      setSelectedTokenId(null);
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
                      setSelectedTokenId(null);
                    }}
                  />
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
                      setSelectedTokenId(null);
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
                      setSelectedTokenId(null);
                    }}
                  />
                  <Rect
                    id="duplicate-bg"
                    x={
                      token.x + (contextMenuTokenSize?.width || token.width) + 5
                    }
                    y={token.y + 105}
                    width={90}
                    height={30}
                    fill="purple"
                    cornerRadius={5}
                    shadowBlur={4}
                    onClick={handleDuplicateToken}
                  />
                  <Text
                    x={
                      token.x +
                      (contextMenuTokenSize?.width || token.width) +
                      15
                    }
                    y={token.y + 112}
                    text="Duplicate"
                    fill="white"
                    fontSize={14}
                    fontStyle="bold"
                    onClick={handleDuplicateToken}
                  />
                </React.Fragment>
              ) : null
            )}
          </Layer>
          <Layer>
            {rulerState.isDrawing ||
            rulerState.endX !== rulerState.startX ||
            rulerState.endY !== rulerState.startY ? (
              <>
                <Line
                  points={[
                    rulerState.startX,
                    rulerState.startY,
                    rulerState.endX,
                    rulerState.endY,
                  ]}
                  stroke="black"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
                <Text
                  x={(rulerState.startX + rulerState.endX) / 2 + 10}
                  y={(rulerState.startY + rulerState.endY) / 2 - 15}
                  text={`${Math.floor(
                    Math.sqrt(
                      Math.pow(rulerState.endX - rulerState.startX, 2) +
                        Math.pow(rulerState.endY - rulerState.startY, 2)
                    ) / 10
                  )}`}
                  fontSize={14}
                  fontStyle="bold"
                  fill="black"
                  align="center"
                />
              </>
            ) : null}
          </Layer>
          <Layer>
            {eraseMode && isErasing && (
              <Circle
                x={pointToSegmentDistance.lastPointerX || 0}
                y={pointToSegmentDistance.lastPointerY || 0}
                radius={10}
                fill="rgba(255, 0, 0, 0.3)"
                stroke="red"
                strokeWidth={1}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {showResetDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <p>
              Are you sure you want to reset the board? This will clear all
              tokens, drawings, and the board image.
            </p>
            <button onClick={confirmReset}>Yes</button>
            <button onClick={cancelReset}>No</button>
          </div>
        </div>
      )}

      {showLoadDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <p>
              Are you sure you want to load a game? This will overwrite the
              current board, tokens, and drawings.
            </p>
            <button onClick={confirmLoad}>Yes</button>
            <button onClick={cancelLoad}>No</button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="dialog-overlay">
          <div className="dialog">
            <p>{errorMessage}</p>
            <button onClick={clearError}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
