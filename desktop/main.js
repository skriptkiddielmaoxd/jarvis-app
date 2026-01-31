const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require('fs');

let win;
let serverProc;

const SERVER_PORT = process.env.JARVIS_PORT || "3000";
const UI_URL = `http://127.0.0.1:${SERVER_PORT}/ui`;
const HEALTH_URL = `http://127.0.0.1:${SERVER_PORT}/health`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// In packaged apps, resources are under process.resourcesPath
function getServerDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "server");
  }
  return path.join(__dirname, "..", "server");
}

function startServer() {
  const serverDir = getServerDir();
  const entry = path.join(serverDir, "index.js");

  // Use system Node (requires Node installed). If you want true "no Node required", say so.
  serverProc = spawn("node", [entry], {
    cwd: serverDir,
    env: { ...process.env, PORT: SERVER_PORT },
    stdio: "inherit",
    windowsHide: true
  });

  serverProc.on("exit", (code) => {
    console.log("Jarvis server exited:", code);
  });
}

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) return true;
    } catch {}
    await sleep(250);
  }
  return false;
}

async function loadUI() {
  // Retry load a few times to avoid white screen
  for (let i = 0; i < 5; i++) {
    try {
      await win.loadURL(UI_URL);
      return;
    } catch (e) {
      await sleep(500);
    }
  }

  win.loadURL(
    "data:text/plain,Jarvis UI failed to load. Make sure the server started and /health is reachable."
  );
}

app.whenReady().then(async () => {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    autoHideMenuBar: true,
    title: "Jarvis",
    webPreferences: {
      // Keep defaults secure for production; loosen for dev so UI scripts behave consistently
      contextIsolation: false,
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // If load fails, show something visible
  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.log("did-fail-load", { code, desc, url });
  });

  startServer();

  const ok = await waitForHealth();
  if (!ok) {
    win.loadURL(
      "data:text/plain,Jarvis server did not become healthy. Check console logs. Also ensure your .env exists in the server folder."
    );
    return;
  }

  // If a built UI exists in the desktop/ui/dist folder, load it directly from file system
  const builtIndex = path.join(__dirname, 'ui', 'dist', 'index.html');
  if (fs.existsSync(builtIndex)) {
    try {
      await win.loadFile(builtIndex);
      return;
    } catch (e) {
      console.warn('Failed to load built UI file, falling back to server URL', e && e.message);
    }
  }

  await loadUI();
  // Open devtools in development to inspect UI behavior
  if (!app.isPackaged) {
    try { win.webContents.openDevTools({ mode: 'detach' }); } catch (e) {}
  }
});

app.on("before-quit", () => {
  if (serverProc && !serverProc.killed) serverProc.kill();
});

app.on("window-all-closed", () => app.quit());
