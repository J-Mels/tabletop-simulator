import React, { useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import "./App.css";
import Konva from "konva";
import { Rect, Text } from "react-konva";

function App() {
  const [stageSize] = useState({ width: 800, height: 600 });
  const [boardImage, setBoardImage] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");
  const [deleteTokenId, setDeleteTokenId] = useState(null);

  // const [currentFolder, setCurrentFolder] = useState({
  //   name: "Boards",
  //   children: [],
  // });

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

  // Handle token file upload
  const handleTokenUpload = (event) => {
    const file = event.target.files[0];
    const tokenName =
      event.target.getAttribute("data-token-name") ||
      `Token ${tokens.length + 1}`;
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          setTokens((prevTokens) => [
            ...prevTokens,
            { id: Date.now(), name: tokenName, image: img, x: 50, y: 50 },
          ]);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle token selection and placement
  const handleTokenSelect = (event) => {
    const tokenId = event.target.value;
    setSelectedToken(tokenId);
    if (tokenId) {
      setTokens((prevTokens) =>
        prevTokens.map((token) =>
          token.id === parseInt(tokenId)
            ? { ...token, x: 50, y: 50 } // Place at default position
            : token
        )
      );
    }
  };

  // Handle token drag
  const handleTokenDrag = (e, tokenId) => {
    const { x, y } = e.target.position();
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.id === tokenId ? { ...token, x, y } : token
      )
    );
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
                          x: 50 + index * 60, // small gap between tokens
                          y: 50,
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
      <div className="controls">
        <label>
          Upload Board:
          <input type="file" accept="image/*" onChange={handleBoardUpload} />
        </label>
        <label>
          Upload Token:
          <input
            type="text"
            placeholder="Token Name"
            onBlur={(e) =>
              e.target.setAttribute("data-token-name", e.target.value)
            }
          />
          <input type="file" accept="image/*" onChange={handleTokenUpload} />
        </label>
        <label>
          Select Token:
          <select value={selectedToken} onChange={handleTokenSelect}>
            <option value="">None</option>
            {tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        className="canvas"
        onMouseDown={(e) => {
          const clickedOnDeleteButton =
            e.target?.attrs?.text === "Delete" ||
            e.target?.attrs?.id === "delete-bg";

          if (!clickedOnDeleteButton) {
            setDeleteTokenId(null);
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
              width={50}
              height={50}
              draggable
              onDragEnd={(e) => handleTokenDrag(e, token.id)}
              onContextMenu={(e) => {
                e.evt.preventDefault();
                e.cancelBubble = true;
                setDeleteTokenId(token.id);
              }}
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
                    setTokens((prev) => prev.filter((t) => t.id !== token.id));
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
                    setTokens((prev) => prev.filter((t) => t.id !== token.id));
                    setDeleteTokenId(null);
                  }}
                />
              </React.Fragment>
            ) : null
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
