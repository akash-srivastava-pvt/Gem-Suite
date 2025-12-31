export interface GemBridge {
  platform: string;
  getVersion: () => Promise<string>;
  sendNotification: (msg: string) => void;
}

declare global {
  interface Window {
    gem: GemBridge;
  }
}