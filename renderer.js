// renderer.js
function showIframe(id) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.classList.add('hidden'));
    const selectedIframe = document.getElementById(id);
    if (selectedIframe) {
        selectedIframe.classList.remove('hidden');
    }
}
// Functions that interact with the Electron main process
function minimizeWindow() {
    window.electronAPI.minimize();
  }
  
  function toggleMaximizeWindow() {
    window.electronAPI.toggleMaximize();
  }
  
  function closeWindow() {
    window.electronAPI.close();
  }
  
  function toggleSkullMode() {
    const body = document.body;
    const navbar = document.querySelector('.navbar');
  
    body.classList.toggle('dark-red-mode');
    navbar.classList.toggle('dark-red-mode');
  
    const buttons = navbar.querySelectorAll('.nav-buttons button');
    if (body.classList.contains('dark-red-mode')) {
      // Update navbar buttons to dark red mode specific ones
      buttons.forEach(button => {
        button.style.backgroundColor = '#8b0000'; // Example color change
      });
    } else {
      // Reset to original navbar buttons
      buttons.forEach(button => {
        button.style.backgroundColor = ''; // Reset to default color
      });
    }
  }
  
  showIframe('iframe1');
  