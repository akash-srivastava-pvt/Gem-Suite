import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
import { registerAllAgents } from './agents/index.js';

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    console.log('⏳ Initializing database...');
    await db.init();
    console.log('✅ Database ready');

    console.log('⏳ Registering agents...');
    registerAllAgents();
    console.log('✅ Agents registered');

    const app: Express = express();

    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    app.use((req, res, next) => {
      console.log(`🌐 ${req.method} ${req.url}`);
      next();
    });

    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    // ============================================
    // API
    // ============================================

    app.use('/api/v1', apiRouter);

    // Test route
    app.get('/api/v1/test', (req, res) => {
      console.log('🧪 Server test endpoint called');
      res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
    });

    app.get('/health', (_req, res) => {
      try {
        // Quick database check
        const testQuery = db.query('SELECT 1 as test');
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: testQuery.length > 0 ? 'connected' : 'disconnected'
        });
      } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: 'Database connection failed'
        });
      }
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

      const indexPath = path.join(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not found');
      }
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
