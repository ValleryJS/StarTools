function showIframe(id) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.classList.add('hidden'));
    const selectedIframe = document.getElementById(id);
    if (selectedIframe) {
      selectedIframe.classList.remove('hidden');
    }
  }
  
  function minimizeWindow() {
    window.electron.ipcRenderer.send('minimize-window');
  }
  
  function toggleMaximizeWindow() {
    window.electron.ipcRenderer.send('toggle-maximize-window');
  }
  
  function closeWindow() {
    window.electron.ipcRenderer.send('close-window');
  }
  
  showIframe('iframe1');
  