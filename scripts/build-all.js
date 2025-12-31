import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

async function build() {
  try {
    const desktopDir = path.join(root, 'apps/desktop');

    console.log('🧹 Cleaning staging areas...');
    await fs.remove(path.join(desktopDir, 'server'));
    await fs.remove(path.join(desktopDir, 'web'));
    await fs.remove(path.join(desktopDir, 'release'));

    // 1. Build Sub-packages
    console.log('📡 Building Server...');
    execSync('npm run build -w @gem/server', { stdio: 'inherit' });

    console.log('🌐 Building Web...');
    execSync('npm run build -w @gem/web', { stdio: 'inherit' });

    console.log('💻 Building Desktop...');
    execSync('npm run build -w @gem/desktop', { stdio: 'inherit' });

    // 2. Stage files LOCALLY (This fixes the runtime.js error)
    console.log('🚚 Staging assets into desktop folder...');
    await fs.copy(path.join(root, 'apps/server/dist'), path.join(desktopDir, 'server'));
    await fs.copy(path.join(root, 'apps/web/dist'), path.join(desktopDir, 'web'));

    // 3. Package
    console.log('📦 Creating Installer...');
    execSync('npm run dist -w @gem/desktop', { stdio: 'inherit' });

    console.log(`\n✅ Done! Installer ready in: apps/desktop/release`);
  } catch (err) {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
  }
}

build();