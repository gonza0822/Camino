const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

/** True when the URL only works with a local Next.js server. */
function isLocalhostUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Resolves the URL the desktop shell should load (hosted Camino web app). */
function getAppUrl() {
  if (process.env.CAMINO_APP_URL) return process.env.CAMINO_APP_URL.trim();
  if (isDev) return (process.env.AUTH_URL || "http://localhost:3000").trim();
  try {
    const config = require("./app-config.json");
    if (config?.appUrl) return String(config.appUrl).trim();
  } catch {
    /* ignore */
  }
  return (process.env.AUTH_URL || "").trim();
}

/** Shows a static help page when the packaged app has no production URL. */
function loadConfigError(win, attemptedUrl) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Camino</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #F0FDFA; color: #134E4A;
      display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
    main { max-width: 32rem; background: #fff; border-radius: 16px; padding: 28px;
      box-shadow: 0 8px 28px rgba(0,0,0,.08); border: 1px solid #ccfbf1; }
    h1 { margin: 0 0 8px; font-size: 1.25rem; color: #0D9488; }
    p { margin: 0 0 12px; line-height: 1.5; font-size: 0.95rem; }
    code { background: #F0FDFA; padding: 2px 6px; border-radius: 6px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <main>
    <h1>No se pudo abrir Camino</h1>
    <p>Esta app de escritorio necesita la URL de producción (Vercel), no localhost.</p>
    <p>URL configurada: <code>${attemptedUrl || "(vacía)"}</code></p>
    <p>Volvé a generar el instalador con <code>CAMINO_APP_URL</code> o <code>AUTH_URL</code>
      apuntando a tu sitio (ej. <code>https://tu-app.vercel.app</code>) y publicá un release nuevo.</p>
  </main>
</body>
</html>`;
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
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

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return;
    loadConfigError(
      win,
      `${validatedURL || getAppUrl()} (${errorDescription || errorCode})`,
    );
  });

  const appUrl = getAppUrl();
  if (!isDev && (!appUrl || isLocalhostUrl(appUrl))) {
    loadConfigError(win, appUrl);
    return;
  }

  win.loadURL(appUrl);
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
