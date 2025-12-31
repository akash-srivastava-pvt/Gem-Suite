import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  'node_modules',
  'apps/web/dist',
  'apps/server/dist',
  'apps/server/public',
  'apps/desktop/dist',
  'packages/db/dist',
  'packages/shared/dist'
];

async function clean() {
  console.log('🧹 Deep cleaning Gem-Suite...');
  
  for (const target of targets) {
    const fullPath = path.join(__dirname, '..', target);
    try {
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
        console.log(`✅ Removed: ${target}`);
      }
    } catch (err) {
      console.error(`❌ Error removing ${target}:`, err.message);
    }
  }
  console.log('✨ Clean complete. Run "npm install" to rebuild.');
}

clean();