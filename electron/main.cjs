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

  // (Optional) Keep your get-folder-contents handler if still used
  ipcMain.handle("get-folder-contents", async (event, folderPath) => {
    try {
      const fullPath = path.resolve(
        __dirname,
        "..",
        "src",
        "assets",
        folderPath
      );
      const items = fs.readdirSync(fullPath, { withFileTypes: true });
      return items.map((item) => ({
        name: item.name,
        type: item.isDirectory() ? "folder" : "file",
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  });

  // 👇 Finally, launch the window
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
