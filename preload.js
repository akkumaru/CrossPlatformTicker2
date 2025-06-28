const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  startDisplay: (config) => ipcRenderer.invoke('start-display', config),
  stopDisplay: () => ipcRenderer.invoke('stop-display'),
  updateConfig: (config) => ipcRenderer.invoke('update-config', config),
  getAppState: () => ipcRenderer.invoke('get-app-state'),
  
  // Renderer to main communication
  onInitData: (callback) => ipcRenderer.on('init-data', callback),
  onStatusUpdate: (callback) => ipcRenderer.on('status-update', callback),
  onDisplayConfig: (callback) => ipcRenderer.on('display-config', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
