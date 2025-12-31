import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const sourceWasm = path.join(__dirname, '../packages/db/node_modules/sql.js/dist/sql-wasm.wasm');
const serverDist = path.join(__dirname, '../apps/server/dist/sql-wasm.wasm');
const dbDist = path.join(__dirname, '../packages/db/dist/sql-wasm.wasm');

function copyFile(src, dest) {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(src, dest);
    console.log(`✅ Copied WASM to: ${dest}`);
  } catch (err) {
    console.error(`❌ Failed to copy WASM to ${dest}:`, err.message);
  }
}

// Execute copies
console.log('📦 Moving SQL.js binaries...');
copyFile(sourceWasm, serverDist);
copyFile(sourceWasm, dbDist);