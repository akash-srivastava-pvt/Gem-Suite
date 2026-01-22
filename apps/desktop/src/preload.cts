import { contextBridge, ipcRenderer } from 'electron';

interface GemAPI {
  platform: string;
  getVersion: () => Promise<string>;
  sendNotification: (message: string) => void;
  restart: () => void;
  checkNetwork: () => Promise<boolean>;
  continueToLocal: () => void;
  sendNetworkStatus: (status: 'online' | 'offline') => void;
  onNetworkStatusChange: (callback: (status: 'online' | 'offline') => void) => void;
}

contextBridge.exposeInMainWorld('gem', {
  platform: process.platform,

  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke('get-app-version');
  },

  sendNotification: (message: string): void => {
    ipcRenderer.send('notify', message);
  },

  restart: (): void => {
    ipcRenderer.send('restart-app');
  },

  checkNetwork: (): Promise<boolean> => {
    return ipcRenderer.invoke('check-network');
  },

  continueToLocal: (): void => {
    ipcRenderer.send('continue-to-local');
  },

  sendNetworkStatus: (status: 'online' | 'offline'): void => {
    ipcRenderer.send('network-status-change', status);
  },

  onNetworkStatusChange: (callback: (status: 'online' | 'offline') => void): void => {
    ipcRenderer.on('network-status-change', (_, status) => callback(status));
  }
} as GemAPI);

declare global {
  interface Window {
    gem: GemAPI;
  }
}
