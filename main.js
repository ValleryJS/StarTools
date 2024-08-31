const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;
let isMaximized = false;

function createWindow() {
  const winSession = session.fromPartition('persist:star-tools', { cache: true });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      session: winSession,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('maximize', () => {
    isMaximized = true;
  });

  mainWindow.on('unmaximize', () => {
    isMaximized = false;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('toggle-maximize-window', () => {
  if (mainWindow) {
    if (isMaximized) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    app.quit(); // Quits the entire application
  }
});
