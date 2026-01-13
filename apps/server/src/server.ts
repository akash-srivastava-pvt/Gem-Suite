import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import {apiRouter } from './routes/index.js';
import { fileURLToPath } from 'url';
import { Express } from 'express';
// 1. Import your Database logic
import { db } from '@gem/db'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app: Express = express();
const PORT = process.env.PORT || 3001;

// We wrap the start logic to ensure DB is ready
async function startServer() {
  try {
    console.log('⏳ Initializing Database...');
    await db.init();
    console.log('✅ Database Ready');

    app.use(cors());
    app.use(express.json());

    // API Routes
    app.use('/api/v1', apiRouter);

    /**
     * PRODUCTION & ELECTRON LOGIC
     */
    const publicPath = process.env.WEB_DIST_PATH || path.join(__dirname, '../../web/dist');

    console.log(`📂 Serving static files from: ${publicPath}`);

    // Always serve static files if the directory exists
    app.use(express.static(publicPath));

    // SPA Routing: Serve index.html for non-API requests
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }

      const indexPath = path.join(publicPath, 'index.html');
      
      res.sendFile(indexPath, (err) => {
        if (err) {
          // This error often happens if the 'web' build didn't happen before packaging
          res.status(500).send("Frontend build not found. Check your resources folder.");
        }
      });
    });

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        process.exit(1); 
      } else {
        console.error('❌ Server error:', err);
      }
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// 3. Handle Graceful Shutdown (Important for saving sqlite data)
process.on('SIGTERM', () => {
  console.log('Closing server and saving DB...');
  // Your DatabaseModel handles save-on-execute, 
  // but this ensures a clean exit for the process.
  process.exit(0);
});
startServer();

export default app;