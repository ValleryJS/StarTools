// update-checker.js
const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const GITHUB_REPO = 'https://api.github.com/repos/ValleryJS/StarTools/releases'; // Replace with your GitHub repo URL

// Function to check for updates
async function checkForUpdates() {
    try {
        const response = await fetch(GITHUB_REPO);
        if (!response.ok) throw new Error('Failed to fetch update information');
        const latestRelease = await response.json();
        const latestVersion = latestRelease.tag_name;

        // Get the current version from your app (update this based on how you store the version)
        const currentVersion = 'v0.8.1'; // Replace with your app's current version

        if (latestVersion !== currentVersion) {
            showUpdateNotification(latestVersion, latestRelease.html_url);
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

// Function to show update notification
function showUpdateNotification(version, url) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 1000;

    const popup = document.createElement('div');
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '8px';
    popup.style.textAlign = 'center';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    
    const message = document.createElement('p');
    message.textContent = `A new version (${version}) is available!`;
    
    const button = document.createElement('button');
    button.textContent = 'Download Update';
    button.onclick = () => {
        window.open(url, '_blank');
        document.body.removeChild(overlay);
    };

    popup.appendChild(message);
    popup.appendChild(button);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

// Start checking for updates
setInterval(checkForUpdates, CHECK_INTERVAL);
