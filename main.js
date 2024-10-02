const { app, BrowserWindow, ipcMain, session, Tray, Notification, shell, dialog } = require('electron');
const express = require('express');
const rootPath = __dirname;
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');
const server = express();
server.use(express.static(rootPath));
server.use('/img', express.static(path.join(rootPath, 'img')));
server.listen(3000, () => console.log('Server started on port 3000'));

let mainWindow;
let splashWindow;
let isMaximized = false;
let tray;
let splashStartTime;

const CURRENT_VERSION = '0.8.1'; // Update this with your current version

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

    splashStartTime = Date.now();  // Record the time when the splash screen is created
    splashWindow.loadFile('splash.html');
}

function createMainWindow() {
    const winSession = session.fromPartition('persist:star-tools', { cache: true });

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        show: false,  // Do not show the main window until it's ready
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            session: winSession,
        },
        icon: path.join(__dirname, 'assets', 'icon.ico')
    });

    mainWindow.loadURL('http://localhost:3000/index.html').catch(err => console.error('Failed to load index.html:', err));

    mainWindow.webContents.on('did-finish-load', () => {
        const elapsedTime = Date.now() - splashStartTime;
        const minSplashTime = 6000;  // Minimum splash screen time in ms (3 seconds)

        // Ensure the splash screen is shown for at least the minimum time
        setTimeout(() => {
            mainWindow.show();
            splashWindow.close();  // Close the splash screen after the main window is shown
        }, Math.max(0, minSplashTime - elapsedTime));  // Delay closing if needed

        // Get cookies and save them to localStorage
        const currentSession = mainWindow.webContents.session;

        currentSession.cookies.get({})
            .then((cookies) => {
                console.log('Cookies fetched from session:', cookies);
                
                // Send cookies to the renderer process to save in localStorage
                mainWindow.webContents.executeJavaScript(`
                    localStorage.setItem('iframeCookies', JSON.stringify(${JSON.stringify(cookies)}));
                `);
            })
            .catch((error) => {
                console.error('Error fetching cookies:', error);
            });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('maximize', () => {
        isMaximized = true;
    });

    mainWindow.on('unmaximize', () => {
        isMaximized = false;
    });
}


function checkForUpdates() {
    const latestReleaseUrl = 'https://api.github.com/repos/ValleryJS/StarTools/releases/latest'; // GitHub API endpoint for the latest release

    axios.get(latestReleaseUrl)
        .then(response => {
            const latestVersion = response.data.tag_name; // Version from GitHub
            console.log(`Latest version found: ${latestVersion}`);

            if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
                console.log('New update available!');
                // Create the notification
                const notification = new Notification({
                    title: 'Update Available',
                    body: `A new version (${latestVersion}) is available! Click to update.`,
                    silent: false
                });

                // Attach the click event BEFORE showing the notification
                notification.on('click', () => {
                    // Handle the click event here: download the update using the default URL
                    const downloadUrl = `https://github.com/ValleryJS/StarTools/releases/download/${latestVersion}/StarTools.exe`;
                    console.log(`Downloading from: ${downloadUrl}`);
                    downloadUpdate(downloadUrl, latestVersion); // Download the update first before prompting
                });

                // Show the notification
                notification.show();
            } else {
                console.log('You are running the latest version.');
            }
        })
        .catch(error => console.error('Error checking for updates:', error));
}


function downloadUpdate(downloadUrl, version) {
    const filePath = path.join(app.getPath('userData'), `StarTools_${version}.exe`);

    console.log(`Saving update to: ${filePath}`);

    axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
        headers: {
            'User-Agent': 'electron-app'
        }
    })
    .then(response => {
        if (response.status !== 200) {
            console.error(`Failed to download update. Status Code: ${response.status}`);
            return;
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log('Update downloaded successfully.');
            promptUserForInstall(filePath);
        });

        writer.on('error', err => {
            console.error('Error writing the file:', err.message);
            fs.unlink(filePath, () => {});
        });
    })
    .catch(error => {
        console.error('Error downloading the update:', error.message);
    });
}

function compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const part1 = v1Parts[i] || 0;
        const part2 = v2Parts[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }
    return 0;
}

function promptUserForInstall(filePath) {
    const options = {
        type: 'question',
        buttons: ['Auto Install (SOON)', 'Manual Install', 'Later'],
        defaultId: 0,
        title: 'Update Ready',
        message: 'The update has been downloaded. How would you like to install it?',
        detail: '(as of right now, only manual install works!) Auto Install will silently install the update. Manual Install will let you run the installer yourself.'
    };

    const userResponse = dialog.showMessageBoxSync(mainWindow, options);

    if (userResponse === 0) { // If "Auto Install" was clicked
        manualInstallUpdate(filePath); // Perform silent install
    } else if (userResponse === 1) { // If "Manual Install" was clicked
        manualInstallUpdate(filePath); // Open installer for manual installation
    } else {
        console.log('User chose to install the update later.');
    }
}

function autoInstallUpdate(updateFilePath) {
    // Close the app and run the installer silently (if supported by the installer)
    exec(`"${updateFilePath}" /S`, (error, stdout, stderr) => { // `/S` is a common flag for silent installation
        if (error) {
            console.error(`Error during auto install: ${error}`);
            return;
        }
        console.log(`Auto installer output: ${stdout}`);

        // Wait a few seconds after installation to ensure it completes
        setTimeout(() => {
            // Relaunch the app after the installation is complete
            relaunchApp();
        }, 15000); // Adjust the delay if needed
    });

    // Quit the app immediately after starting the installer
    app.quit(); // Quit the app to start the update process
}

function relaunchApp() {
    // Relaunch the app after an update
    app.relaunch();
    app.exit(0); // Exit to ensure a clean restart
}

function manualInstallUpdate(updateFilePath) {
    // Close the app and run the installer normally (user will follow installer steps)
    exec(`"${updateFilePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during manual install: ${error}`);
            return;
        }
        console.log(`Manual installer output: ${stdout}`);
        app.quit(); // Quit the app after running the installer
    });
}

// App lifecycle events
app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();    // Then, load and create the main window
    checkForUpdates(); // Check for updates when the app starts
}).catch(err => console.error('Failed to create window:', err));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
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
        app.quit();
    }
});