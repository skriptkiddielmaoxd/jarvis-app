const { app, BrowserWindow, Menu } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    title: 'Jarvis',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove the menu bar
  win.setMenuBarVisibility(false);
  Menu.setApplicationMenu(null);

  // Load remote UI
  win.loadURL('https://jarvis-cloud.up.railway.app/ui');

  // When the window is closed, dereference it (allowing the app to quit cleanly)
  win.on('closed', () => {});
}

app.whenReady().then(createWindow);

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
