import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// ✅ Safe directory name for both ESM (Dev/TSX) and CJS (Prod/Packed)
const SERVER_DIR = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

// ============================================
// STATIC IMPORTS (NO dynamic import)
// esbuild resolves monorepo packages at build time
// ============================================

import { db } from '@gem/db';
import { apiRouter } from './routes/index.js';
import { LoggerModel } from './models/loggerModel.js';

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    console.log('⏳ Initializing database...');
    await db.init();
    console.log('✅ Database ready');

    const app: Express = express();

    app.use(cors());
    app.use(express.json());

    // ============================================
    // API
    // ============================================

    app.use('/api/v1', apiRouter);

    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================
    // FRONTEND (Electron-served React)
    // ============================================

    const publicPath =
      process.env.WEB_DIST_PATH ||
      path.join(SERVER_DIR, '../web'); // ← derived path

    console.log(`📂 Serving frontend from: ${publicPath}`);

    app.use(express.static(publicPath));

    // SPA fallback
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }

      res.sendFile(path.join(publicPath, 'index.html'));
    });

    // ============================================
    // START SERVER
    // ============================================


    const PORT = Number(process.env.PORT) || 0;

    const server = app.listen(PORT, () => {
      const address = server.address();
      const actualPort =
        typeof address === 'string' ? PORT : address?.port;

      console.log(`✅ Server running on http://localhost:${actualPort}`);
      LoggerModel.log('Session started: Server initialized');

      // Notify Electron main
      if (process.send) {
        process.send({
          type: 'server-ready',
          port: actualPort,
        });
      }
    });

    server.on('error', (err: any) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Failed to start server');
    console.error(err);
    process.exit(1);
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  LoggerModel.log('Session ended: Received SIGTERM');
  process.exit(0);
});
process.on('SIGINT', () => {
  LoggerModel.log('Session ended: Received SIGINT');
  process.exit(0);
});

// ============================================
// START
// ============================================

startServer();
