const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;
let isMaximized = false;

function createWindow() {
  // Create a session for persistent storage (e.g., cookies, cache)
  const winSession = session.fromPartition('persist:star-tools', { cache: true });

  // Initialize the main window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Ensures scripts are isolated between the preload and renderer
      enableRemoteModule: false, // Disable remote module for security
      nodeIntegration: true, // Disables Node.js integration in the renderer process
      session: winSession, // Use the created session
    },
    icon: path.join(__dirname, 'assets', 'icon.ico') // Update this line to include your icon file
  });

  // Load the main HTML file into the window
  mainWindow.loadFile('index.html').catch(err => console.error('Failed to load index.html:', err));

  // Handle maximize and restore states for the window
  mainWindow.on('maximize', () => {
    isMaximized = true;
  });

  mainWindow.on('unmaximize', () => {
    isMaximized = false;
  });

  // Optional: Handle unexpected errors or issues with the window
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.whenReady().then(createWindow).catch(err => console.error('Failed to create window:', err));

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create window when the app is activated (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for window controls
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
