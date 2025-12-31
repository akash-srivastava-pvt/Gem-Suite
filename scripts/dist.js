import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Starting Production Build Process...');

try {
  // 1. Kill any lingering processes
  console.log('🔫 Terminating background Electron/Node processes...');
  try {
    execSync('taskkill //F //IM electron.exe //T 2>/dev/null || true', { shell: true });
    execSync('taskkill //F //IM node.exe //T 2>/dev/null || true', { shell: true });
  } catch (e) {}

  // 2. Clean previous builds
  console.log('🧹 Cleaning old build artifacts...');
  const dirsToClean = [
    'apps/desktop/dist',
    'apps/desktop/release',
    'apps/web/dist',
    'packages/db/dist',
    'packages/shared/dist',
    'apps/server/dist' // Added server dist to cleaning
  ];

  dirsToClean.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });

  // 3. Build TypeScript Workspace
  console.log('🏗️  Compiling TypeScript Projects...');
  execSync('npx tsc --build --clean', { stdio: 'inherit', cwd: projectRoot });
  execSync('npx tsc --build', { stdio: 'inherit', cwd: projectRoot });

  // --- NEW STEP: 3.5 Copy SQL.js WASM Binary ---
  console.log('📂 Copying SQL.js WASM binaries to distribution folders...');
  const wasmSource = path.join(projectRoot, 'packages/db/node_modules/sql.js/dist/sql-wasm.wasm');
  
  // We need the WASM file in BOTH the DB dist and the Server dist
  const wasmDestinations = [
    path.join(projectRoot, 'packages/db/dist/sql-wasm.wasm'),
    path.join(projectRoot, 'apps/server/dist/sql-wasm.wasm')
  ];

  if (!fs.existsSync(wasmSource)) {
    throw new Error(`Critical Error: Could not find WASM source at ${wasmSource}`);
  }

  wasmDestinations.forEach(dest => {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(wasmSource, dest);
    console.log(`   ✅ Copied to: ${path.relative(projectRoot, dest)}`);
  });
  // --------------------------------------------

  // 4. Build Web Frontend
  console.log('🌐 Building Web Frontend (Vite)...');
  execSync('npm run build -w @gem/web', { stdio: 'inherit', cwd: projectRoot });

  // 5. Package into Setup Installer
  console.log('📦 Packaging into Windows Setup Installer...');
  process.env.NODE_ENV = 'production';
  // Note: Electron-builder will now see the .wasm file in apps/server/dist
  execSync('npm run dist -w @gem/desktop', { stdio: 'inherit', cwd: projectRoot });

  console.log('\n✨ Build Complete!');
  console.log('📂 Installer location: apps/desktop/release/');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}