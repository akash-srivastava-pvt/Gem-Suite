import { contextBridge, ipcRenderer } from 'electron';

interface GemAPI {
  platform: string;
  getVersion: () => Promise<string>;
  sendNotification: (message: string) => void;
  restart: () => void;
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
  }
} as GemAPI);

declare global {
  interface Window {
    gem: GemAPI;
  }
}
