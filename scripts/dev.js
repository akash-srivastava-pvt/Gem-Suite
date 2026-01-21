import concurrently from 'concurrently';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from root .env
dotenv.config();

const { result } = concurrently(
  [
    {
      command: process.platform === 'win32'
        ? 'set PORT=3001 && npm run dev -w @gem/server'
        : 'PORT=3001 npm run dev -w @gem/server',
      name: 'SERVER',
      prefixColor: 'blue'
    },
    {
      command: 'npm run dev -w @gem/web',
      name: 'WEB',
      prefixColor: 'green'
    },
    {
      // We wait for port 3000 (Vite) AND port 3001 (Express)
      // The timeout ensures it doesn't wait forever if one fails
      command: 'wait-on -l -t 90000 -i 2000 http://127.0.0.1:3000 tcp:127.0.0.1:3001 && npm run start -w @gem/desktop',
      name: 'DESKTOP',
      prefixColor: 'magenta'
    },
  ],
  {
    killOthers: ['failure', 'success'],
    restartTries: -1, // Auto-restart checks on crash
    // This ensures that logs from all processes are piped to your terminal
    raw: false,
  }
);

result.then(
  () => {
    console.log('✅ All processes finished successfully.');
    process.exit(0);
  },
  (err) => {
    console.error('❌ One or more processes failed:', err);
    process.exit(1);
  }
);