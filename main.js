const { app, BrowserWindow, ipcMain, session, Tray, Notification, shell } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWindow;
let splashWindow;
let isMaximized = false;
let tray;

const CURRENT_VERSION = '0.0.6'; // Update this with your current version

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

    setTimeout(() => {
        splashWindow.close();
        createMainWindow(); // Create the main window after closing the splash screen
    }, 5000); // 5 seconds
}

function createMainWindow() {
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

    mainWindow.on('ready-to-show', () => {
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

if (process.platform === 'win32') {
    app.setAppUserModelId('StarTools');
}

function checkForUpdates() {
    const versionUrl = 'https://raw.githubusercontent.com/ValleryJS/StarTools/main/version.txt'; // Update with the raw URL of your version.txt file

    axios.get(versionUrl)
        .then(response => {
            const latestVersion = response.data.trim();

            if (latestVersion !== CURRENT_VERSION) {
                new Notification({
                    title: 'Update Available',
                    body: `A new version (${latestVersion}) is available! Please update as soon as possible!`,
                    actions: [
                        {
                            type: 'button',
                            text: 'Update Now',
                            async click() {
                                shell.openExternal('https://github.com/ValleryJS/StarTools/releases/latest'); // Update with your GitHub releases URL
                            }
                        }
                    ]
                }).show();
            }
        })
        .catch(error => console.error('Error checking for updates:', error));
}

// App lifecycle events
app.whenReady().then(() => {
    createSplashWindow(); // Show splash screen first
    checkForUpdates(); // Check for updates when the app starts
}).catch(err => console.error('Failed to create window:', err));

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Re-create window when the app is activated (macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow(); // Re-create the main window if needed
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
