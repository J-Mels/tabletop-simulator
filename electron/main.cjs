const path = require("path");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  // 🧠 Register IPC handler for choosing a single board image
  ipcMain.handle("open-board-image", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
        },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const imagePath = result.filePaths[0];
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");
    const mimeType = `image/${path.extname(imagePath).substring(1)}`;

    return `data:${mimeType};base64,${imageBase64}`;
  });

  // 🧠 Register IPC handler for choosing multiple token images
  ipcMain.handle("open-token-images", async () => {
    const result = await dialog.showOpenDialog({
      title: "Choose Token Images",
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
        },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }

    const imageDataUrls = result.filePaths.map((filePath) => {
      const imageBuffer = fs.readFileSync(filePath);
      const mimeType = `image/${path.extname(filePath).substring(1)}`;
      const base64 = imageBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    });
    return imageDataUrls;
  });

  // 🧠 Register IPC handler for saving the game state
  ipcMain.handle("save-game", async (event, gameState) => {
    try {
      const result = await dialog.showSaveDialog({
        title: "Save Game",
        defaultPath: "game-save.json",
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: "Save canceled" };
      }

      const filePath = result.filePath;
      fs.writeFileSync(filePath, JSON.stringify(gameState, null, 2));
      return { success: true };
    } catch (err) {
      console.error("Error saving game:", err);
      return { success: false, error: err.message };
    }
  });

  // 🧠 Register IPC handler for loading the game state
  ipcMain.handle("load-game", async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: "Load Game",
        properties: ["openFile"],
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: "Load canceled" };
      }

      const filePath = result.filePaths[0];
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const gameState = JSON.parse(fileContent);
      return { success: true, gameState };
    } catch (err) {
      console.error("Error loading game:", err);
      return { success: false, error: err.message };
    }
  });

  // 👇 Finally, launch the window
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
