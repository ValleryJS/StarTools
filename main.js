const { app, BrowserWindow, ipcMain, session } = require('electron');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const semver = require('semver'); // For version comparison

const versionFileUrl = 'https://raw.githubusercontent.com/YOUR_GITHUB_USER/YOUR_REPO/main/version.txt'; // Replace with your GitHub file URL
const currentVersion = app.getVersion(); // Gets the current app version from package.json



let mainWindow;
let splashWindow;
let isMaximized = false;

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    splashWindow.loadFile('splash.html');

    splashWindow.on('closed', () => {
        splashWindow = null;
    });
}

function createWindow() {
  // Create a session for persistent storage (e.g., cookies, cache)
  const winSession = session.fromPartition('persist:star-tools', { cache: true });

  // Initialize the main window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
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

  // Check for updates
  checkForUpdates();
}

async function checkForUpdates() {
    try {
        const response = await axios.get(versionFileUrl);
        const latestVersion = response.data.trim();

        if (semver.gt(latestVersion, currentVersion)) {
            // Notify user about the update
            const { dialog } = require('electron');
            const choice = await dialog.showMessageBox({
                type: 'info',
                title: 'Update Available',
                message: `A new version (${latestVersion}) is available. Do you want to download it now?`,
                buttons: ['Yes', 'No']
            });

            if (choice.response === 0) {
                // Open GitHub releases page
                require('electron').shell.openExternal('https://github.com/YOUR_GITHUB_USER/YOUR_REPO/releases');
            }
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }

  mainWindow.on('ready-to-show', () => {
    if (splashWindow) {
        splashWindow.close();
    }
    mainWindow.show();
});

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
app.whenReady().then(() => { createSplashWindow(); createWindow();}).catch(err => console.error('Failed to create window:', err));

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
