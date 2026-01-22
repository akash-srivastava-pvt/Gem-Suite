export interface GemBridge {
  platform: string;
  getVersion: () => Promise<string>;
  sendNotification: (msg: string) => void;
  restart: () => void;
  checkNetwork: () => Promise<boolean>;
  continueToLocal: () => void;
  sendNetworkStatus: (status: 'online' | 'offline') => void;
  onNetworkStatusChange: (callback: (status: 'online' | 'offline') => void) => void;
}

declare global {
  interface Window {
    gem: GemBridge;
  }
}