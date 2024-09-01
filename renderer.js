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
  
  // Show the first iframe on app load (adjust this if necessary)
  showIframe('iframe1');
  