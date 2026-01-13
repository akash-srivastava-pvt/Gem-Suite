import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  shell,
  screen,
  dialog
} from 'electron';
import path from 'path';
import fs from 'fs';
import { fork, ChildProcess } from 'child_process';
import http from 'http';
const IS_PROD = app.isPackaged;
const LOG_FILE = path.join(app.getPath('userData'), 'app.log');

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let isQuitting = false;

function log(msg: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}\n`;
  console.log(line.trim());
  try { fs.appendFileSync(LOG_FILE, line); } catch { }
}

process.on('uncaughtException', (err) => {
  log(`CRASH: ${err.stack}`, 'ERROR');
  dialog.showErrorBox('Critical Error', `${err.message}\n\nLog: ${LOG_FILE}`);
});

function getAssetPath(file: string): string {
  return IS_PROD
    ? path.join(process.resourcesPath, 'assets', file)
    : path.resolve(__dirname, '../src', file);
}

function getPreloadPath(): string {
  const p = path.join(__dirname, 'preload.cjs');
  if (!fs.existsSync(p)) {
    log(`FATAL: preload missing: ${p}`, 'ERROR');
    dialog.showErrorBox('Installation Error', 'Preload missing');
    app.quit();
  }
  return p;
}

function startServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    // Production: resources/server/server.js (CommonJS bundle + node_modules)
    // Development: apps/server/dist/server.js
    const serverPath = IS_PROD
      ? path.join(process.resourcesPath, 'server', 'server.js')
      : path.resolve(__dirname, '../../server/dist/server.js');

    const webDistPath = IS_PROD
      ? path.join(__dirname, '../web')
      : path.resolve(__dirname, '../../web/dist');

    log(`Server: ${serverPath}`);
    log(`Web: ${webDistPath}`);

    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server missing: ${serverPath}`));
      return;
    }

    serverProcess = fork(serverPath, [], {
      env: {
        ...process.env,
        NODE_ENV: IS_PROD ? 'production' : 'development',
        WEB_DIST_PATH: webDistPath,
        PORT: '0'
      },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });

    let resolved = false;

    serverProcess.on('message', (msg: any) => {
      if (msg?.type === 'server-ready' && !resolved) {
        resolved = true;
        log(`Server ready: ${msg.port}`);
        resolve(msg.port);
      }
    });

    if (serverProcess.stdout) {
      serverProcess.stdout.on('data', (d: Buffer) => log(`[SRV] ${d.toString().trim()}`));
    }

    if (serverProcess.stderr) {
      serverProcess.stderr.on('data', (d: Buffer) => log(`[ERR] ${d.toString().trim()}`, 'ERROR'));
    }

    serverProcess.on('error', (err: Error) => {
      if (!resolved) {
        resolved = true;
        log(`Server error: ${err.message}`, 'ERROR');
        reject(err);
      }
    });

    serverProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Server exited: code=${code} signal=${signal}`));
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Server timeout'));
      }
    }, 30000);
  });
}

function waitForHealth(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;

    const check = () => {
      attempts++;
      http.get(`http://localhost:${port}/health`, (res: http.IncomingMessage) => {
        if (res.statusCode === 200) {
          log('Health OK');
          resolve(true);
        } else {
          retry();
        }
      }).on('error', retry);
    };

    const retry = () => {
      if (attempts >= 30) {
        log('Health failed', 'ERROR');
        resolve(false);
      } else {
        setTimeout(check, 1000);
      }
    };

    check();
  });
}

function createWindow(url: string) {
  log(`Loading: ${url}`);

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(url);
    return;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1280, width),
    height: Math.min(800, height),
    show: true,
    backgroundColor: '#667eea',
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('closed', () => mainWindow = null);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    log(`Load failed: ${desc} (${code})`, 'ERROR');
  });

  mainWindow.loadURL(url);
}

async function init() {
  log('=== APP START ===');
  log(`Mode: ${IS_PROD ? 'PROD' : 'DEV'}`);
  log(`User data: ${app.getPath('userData')}`);
  log(`Resources: ${process.resourcesPath}`);
  log(`Log: ${LOG_FILE}`);

  const loaderPath = getAssetPath('loader.html');

  if (!fs.existsSync(loaderPath)) {
    log('Loader missing', 'ERROR');
    dialog.showErrorBox('Installation Error', `Loader missing: ${loaderPath}`);
    app.quit();
    return;
  }

  createWindow(`file://${loaderPath}`);

  try {
    const port = await startServer();
    const healthy = await waitForHealth(port);

    if (!healthy) {
      throw new Error('Health check failed');
    }

    createWindow(`http://localhost:${port}`);
    log('=== APP READY ===');

  } catch (err: any) {
    log(`INIT FAILED: ${err.message}`, 'ERROR');

    dialog.showErrorBox(
      'Startup Failed',
      `Failed to start:\n${err.message}\n\nLog:\n${LOG_FILE}`
    );

    const offlinePath = getAssetPath('offline.html');
    if (fs.existsSync(offlinePath)) {
      createWindow(`file://${offlinePath}`);
    }
  }
}

app.whenReady().then(init);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
  if (serverProcess) {
    log('Killing server');
    serverProcess.kill('SIGTERM');
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.on('notify', (_, msg) => new Notification({ title: 'GemSuite', body: msg }).show());
ipcMain.on('restart-app', () => { app.relaunch(); app.exit(0); });
