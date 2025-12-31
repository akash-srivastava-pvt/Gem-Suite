import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import path from 'path';
import fs from 'fs'; // Added missing import
import { fileURLToPath } from 'url';
import { fork, ChildProcess } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

/**
 * Polling helper to ensure the Express server is up before loading the UI
 */
const waitForServer = (port: number) => {
  return new Promise((resolve) => {
    const tryConnect = () => {
      const socket = net.connect(port, '127.0.0.1', () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        setTimeout(tryConnect, 200); 
      });
    };
    tryConnect();
  });
};

const startInternalServer = () => {
  const isProd = app.isPackaged;
  
  // In Prod (ASAR), your files are moved to /resources/app.asar/
  // main.js is in /dist/, server is in /server/
  const serverPath = isProd 
    ? path.join(__dirname, '..', 'server', 'server.js') 
    : path.resolve(__dirname, '../../server/dist/server.js'); 

  const webPath = isProd
    ? path.join(__dirname, '..', 'web')
    : path.resolve(__dirname, '../../web/dist');

  console.log(`🚀 Mode: ${isProd ? 'Production' : 'Development'}`);
  console.log(`📡 Server Path: ${serverPath}`);

  // Ensure the directory exists before forking
  if (!fs.existsSync(serverPath)) {
    console.error(`❌ Server file not found at: ${serverPath}. Did you run 'npm run build' in apps/server?`);
    return;
  }

  try {
    serverProcess = fork(serverPath, [], {
      env: { 
        ...process.env, 
        NODE_ENV: isProd ? 'production' : 'development',
        WEB_DIST_PATH: webPath 
      },
      stdio: 'inherit'
    });

    serverProcess.on('error', (err) => console.error('❌ Backend Error:', err));
  } catch (err) {
    console.error('Failed to spawn backend:', err);
  }
};

async function createWindow() {
  const isProd = app.isPackaged;
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    show: false, 
    // Simplified icon path logic
    icon: path.join(__dirname, isProd ? '../assets/icon.ico' : '../../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const startUrl = !isProd
    ? 'http://localhost:3000' 
    : 'http://localhost:3001'; 

  if (isProd) {
    await waitForServer(3001);
  }

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startInternalServer(); 
  createWindow();
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.on('notify', (_, message) => {
  new Notification({ title: 'GemSuite', body: message }).show();
});