// apps/desktop/src/preload.cts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gem', {
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // ADD THIS LINE:
  sendNotification: (message: string) => ipcRenderer.send('notify', message),

  onServerReady: (callback: any) => {
    const subscription = (_event: any, url: any) => callback(url);
    ipcRenderer.on('server-ready', subscription);
    return () => {
      ipcRenderer.removeListener('server-ready', subscription);
    };
  }
});