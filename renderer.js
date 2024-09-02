// renderer.js

// Ensure the code runs after the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Function to show iframes
    function showIframe(id) {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => iframe.classList.remove('active'));
        const selectedIframe = document.getElementById(id);
        if (selectedIframe) {
            selectedIframe.classList.add('active');
        }
        // Close all dropdown menus when an iframe is selected
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => dropdown.style.display = 'none');
    }
    
    // Function to toggle dropdown menu visibility
    function toggleDropdown(id) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.id !== id) {
                dropdown.style.display = 'none';
            }
        });
    
        const dropdown = document.getElementById(id);
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
    
    // Minimize Window Function
    function minimizeWindow() {
        if (window.electronAPI && typeof window.electronAPI.minimize === 'function') {
            window.electronAPI.minimize();
        } else {
            console.error('electronAPI.minimize is not defined');
        }
    }
    
    // Toggle Maximize Window Function
    function toggleMaximizeWindow() {
        if (window.electronAPI && typeof window.electronAPI.toggleMaximize === 'function') {
            window.electronAPI.toggleMaximize();
        } else {
            console.error('electronAPI.toggleMaximize is not defined');
        }
    }
    
    // Close Window Function
    function closeWindow() {
        if (window.electronAPI && typeof window.electronAPI.close === 'function') {
            window.electronAPI.close();
        } else {
            console.error('electronAPI.close is not defined');
        }
    }
  
    // Function to toggle settings panel visibility
    function toggleSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        const overlay = document.getElementById('overlay');
        const isVisible = panel.style.display === 'block';
        console.log(`Settings panel visibility toggled. Is visible: ${!isVisible}`); // Debug log
        panel.style.display = isVisible ? 'none' : 'block';
        overlay.style.display = isVisible ? 'none' : 'block';
    }
    
  
    // Ensure settings panel is hidden initially
    const settingsPanel = document.getElementById('settings-panel');
    const overlay = document.getElementById('overlay');
    if (settingsPanel && overlay) {
        settingsPanel.style.display = 'none';
        overlay.style.display = 'none';
    }
  
    // Attach functions to global scope for inline event handlers
    window.showIframe = showIframe;
    window.toggleDropdown = toggleDropdown;
    window.toggleSettingsPanel = toggleSettingsPanel;
    window.minimizeWindow = minimizeWindow;
    window.toggleMaximizeWindow = toggleMaximizeWindow;
    window.closeWindow = closeWindow;
});
