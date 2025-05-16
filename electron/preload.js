const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openBoardImage: async () => {
    const result = await ipcRenderer.invoke("open-board-image");
    return result;
  },
  openTokenImages: async () => {
    const result = await ipcRenderer.invoke("open-token-images");
    return result;
  },
  getFolderContents: async (folderPath) => {
    const result = await ipcRenderer.invoke("get-folder-contents", folderPath);
    return result;
  },
});
