// import React, { useState } from "react";
// import { Stage, Layer, Image as KonvaImage } from "react-konva";
// import "./App.css";
// import { Rect, Text, Group } from "react-konva";

// function App() {
//   const [stageSize] = useState({ width: 800, height: 600 });
//   const [boardImage, setBoardImage] = useState(null);
//   const [tokens, setTokens] = useState([]);
//   const [selectedTokenId, setSelectedTokenId] = useState(null);
//   const [showSizeInput, setShowSizeInput] = useState(false);
//   const [newSize, setNewSize] = useState("50");
//   const [sizeInputPosition, setSizeInputPosition] = useState({ x: 0, y: 0 });

//   const handleTokenDrag = (e, tokenId) => {
//     const { x, y } = e.target.position();
//     setTokens((prevTokens) =>
//       prevTokens.map((token) =>
//         token.id === tokenId ? { ...token, x, y } : token
//       )
//     );
//   };

//   return (
//     <div className="app">
//       <header className="app-header">
//         <div className="app-title">Tabletop Simulator</div>
//         <div className="header-buttons">
//           <button
//             onClick={async () => {
//               const dataUrl = await window.electronAPI.openBoardImage();
//               if (dataUrl) {
//                 const img = new window.Image();
//                 img.src = dataUrl;
//                 img.onload = () => {
//                   setBoardImage(img);
//                 };
//               }
//             }}
//           >
//             Choose Board
//           </button>

//           <button
//             onClick={async () => {
//               const dataUrls = await window.electronAPI.openTokenImages();
//               if (!dataUrls || dataUrls.length === 0) return;

//               const loadedImages = await Promise.all(
//                 dataUrls.map(
//                   (dataUrl, index) =>
//                     new Promise((resolve) => {
//                       const img = new window.Image();
//                       img.src = dataUrl;
//                       img.onload = () =>
//                         resolve({
//                           id: Date.now() + index,
//                           name: `Token ${tokens.length + index + 1}`,
//                           image: img,
//                           x: 50 + index * 60,
//                           y: 50,
//                           width: 50,
//                           height: 50,
//                         });
//                     })
//                 )
//               );

//               setTokens((prev) => [...prev, ...loadedImages]);
//             }}
//           >
//             Choose Tokens
//           </button>

//           <button>Save Game</button>
//           <button>Load Game</button>
//         </div>
//       </header>

//       <div className="canvas-container">
//         <Stage
//           width={stageSize.width}
//           height={stageSize.height}
//           className="canvas"
//           onMouseDown={(e) => {
//             const clickedOnDeleteButton =
//               e.target?.attrs?.text === "Delete" ||
//               e.target?.attrs?.id === "delete-bg";

//             if (!clickedOnDeleteButton) {
//               setSelectedTokenId(null);
//               setShowSizeInput(false);
//             }
//           }}
//         >
//           <Layer>
//             {boardImage ? (
//               <KonvaImage
//                 image={boardImage}
//                 width={stageSize.width}
//                 height={stageSize.height}
//                 x={0}
//                 y={0}
//               />
//             ) : (
//               <KonvaImage
//                 x={0}
//                 y={0}
//                 width={stageSize.width}
//                 height={stageSize.height}
//                 fill="#f0f0f0"
//                 stroke="black"
//                 strokeWidth={2}
//               />
//             )}
//             {tokens.map((token) => (
//               <KonvaImage
//                 key={token.id}
//                 image={token.image}
//                 x={token.x}
//                 y={token.y}
//                 width={token.width}
//                 height={token.height}
//                 draggable
//                 dragBoundFunc={(pos) => {
//                   const minX = 0;
//                   const minY = 0;
//                   const maxX = stageSize.width - token.width;
//                   const maxY = stageSize.height - token.height;

//                   return {
//                     x: Math.max(minX, Math.min(pos.x, maxX)),
//                     y: Math.max(minY, Math.min(pos.y, maxY)),
//                   };
//                 }}
//                 onDragEnd={(e) => handleTokenDrag(e, token.id)}
//                 onContextMenu={(e) => {
//                   e.evt.preventDefault();
//                   e.cancelBubble = true;
//                   const stage = e.target.getStage();
//                   const pointerPos = stage.getPointerPosition();
//                   console.log("Right-clicked token", token.id);
//                   setSelectedTokenId(token.id);
//                   setShowSizeInput(false);
//                   setNewSize(token.width.toString());
//                   setSizeInputPosition({
//                     x: pointerPos.x + 10,
//                     y: pointerPos.y + 10,
//                   });
//                 }}
//               />
//             ))}
//           </Layer>
//           <Layer>
//             {tokens.map((token) =>
//               selectedTokenId === token.id ? (
//                 <React.Fragment key={`delete-ui-${token.id}`}>
//                   <Rect
//                     id="delete-bg"
//                     x={token.x + 55}
//                     y={token.y}
//                     width={60}
//                     height={30}
//                     fill="red"
//                     cornerRadius={5}
//                     shadowBlur={4}
//                     onClick={() => {
//                       setTokens((prev) =>
//                         prev.filter((t) => t.id !== token.id)
//                       );
//                       setSelectedTokenId(null);
//                       setShowSizeInput(false);
//                     }}
//                   />
//                   <Text
//                     x={token.x + 65}
//                     y={token.y + 7}
//                     text="Delete"
//                     fill="white"
//                     fontSize={14}
//                     fontStyle="bold"
//                     onClick={() => {
//                       setTokens((prev) =>
//                         prev.filter((t) => t.id !== token.id)
//                       );
//                       setSelectedTokenId(null);
//                       setShowSizeInput(false);
//                     }}
//                   />

//                   <Group
//                     onMouseDown={() => {
//                       // For some reason onClick is not working here.
//                       console.log("Clicked Change Token Size");
//                       setShowSizeInput(true);
//                       setNewSize(token.width.toString());
//                       setSizeInputPosition({
//                         x: token.x + 55,
//                         y: token.y + 70,
//                       });
//                     }}
//                   >
//                     <Rect
//                       x={token.x + 55}
//                       y={token.y + 35}
//                       width={110}
//                       height={30}
//                       fill="blue"
//                       cornerRadius={5}
//                       shadowBlur={4}
//                     />
//                     <Text
//                       x={token.x + 60}
//                       y={token.y + 42}
//                       text="Change Token Size"
//                       fill="white"
//                       fontSize={12}
//                     />
//                   </Group>
//                 </React.Fragment>
//               ) : null
//             )}
//           </Layer>
//         </Stage>
//         {showSizeInput && (
//           <div
//             style={{
//               position: "absolute",
//               top: sizeInputPosition.y,
//               left: sizeInputPosition.x,
//               background: "white",
//               padding: "8px",
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               zIndex: 10,
//             }}
//           >
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 const px = parseInt(newSize, 10);
//                 if (!isNaN(px)) {
//                   setTokens((tokens) =>
//                     tokens.map((t) =>
//                       t.id === selectedTokenId
//                         ? { ...t, width: px, height: px }
//                         : t
//                     )
//                   );
//                 }
//                 setShowSizeInput(false);
//                 setSelectedTokenId(null);
//               }}
//             >
//               <label style={{ marginRight: 4 }}>Size:</label>
//               <input
//                 type="number"
//                 value={newSize}
//                 onChange={(e) => setNewSize(e.target.value)}
//                 style={{ width: "60px", marginRight: "6px" }}
//               />
//               <button type="submit">Set</button>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import "./App.css";
import { Rect, Text } from "react-konva";

function App() {
  const [stageSize] = useState({ width: 800, height: 600 });
  const [boardImage, setBoardImage] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [deleteTokenId, setDeleteTokenId] = useState(null);

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

      <div className="canvas-container">
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
