const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

/** Resolves the URL the desktop shell should load (hosted Camino web app). */
function getAppUrl() {
  if (process.env.CAMINO_APP_URL) return process.env.CAMINO_APP_URL;
  if (isDev) return process.env.AUTH_URL || "http://localhost:3000";
  try {
    const config = require("./app-config.json");
    if (config?.appUrl) return config.appUrl;
  } catch {
    /* ignore */
  }
  return process.env.AUTH_URL || "http://localhost:3000";
}

/** Creates the main application window. */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Camino",
    backgroundColor: "#F0FDFA",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    icon: path.join(__dirname, "..", "public", "brand", "logo-camino.png"),
  });

  win.once("ready-to-show", () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.loadURL(getAppUrl());
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
