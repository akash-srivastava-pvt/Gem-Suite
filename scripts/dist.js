import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 PRODUCTION BUILD');

try {
  // 1. Kill processes
  try {
    execSync('taskkill //F //IM electron.exe //T 2>nul', { shell: true });
    execSync('taskkill //F //IM node.exe //T 2>nul', { shell: true });
  } catch (e) { }

  // 2. Clean desktop artifacts ONLY (keep package builds)
  console.log('🧹 Clean');
  [
    'apps/desktop/dist',
    'apps/desktop/release',
    'apps/desktop/server',
    'apps/desktop/assets',
    'apps/web/dist',
    'apps/server/dist'
  ].forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });

  // 3. Build packages (ESM) - MUST be first
  console.log('📦 Packages');
  execSync('npx tsc --build packages/shared packages/db', { stdio: 'inherit', cwd: projectRoot });

  // 4. Bundle server (CJS via esbuild)
  console.log('⚙️  Server');
  execSync('npm run bundle -w @gem/server', { stdio: 'inherit', cwd: projectRoot });

  // 5. Setup server directory
  const serverDestDir = path.join(projectRoot, 'apps/desktop/server');
  fs.mkdirSync(serverDestDir, { recursive: true });

  // 6. Copy bundled server
  const serverBundleSrc = path.join(projectRoot, 'apps/server/dist/server.js');
  if (!fs.existsSync(serverBundleSrc)) {
    throw new Error('Server bundle not found');
  }
  fs.copyFileSync(serverBundleSrc, path.join(serverDestDir, 'server.js'));

  // 7. Create package.json for server (CommonJS)
  fs.writeFileSync(
    path.join(serverDestDir, 'package.json'),
    JSON.stringify({
      "name": "gem-server",
      "type": "commonjs",
      "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "csv-parse": "^6.1.0",
        "fs-extra": "^11.3.3",
        "xlsx": "^0.18.5",
        "sql.js": "^1.10.3",
        "keytar": "^7.9.0",
        "function-bind": "^1.1.2"
      }
    }, null, 2)
  );

  // 8. Install server dependencies
  console.log('📥 Deps');
  execSync('npm install --production --no-package-lock --no-audit --no-fund', {
    stdio: 'inherit',
    cwd: serverDestDir
  });

  // 9. Copy WASM
  const wasmSrc = path.join(projectRoot, 'packages/db/node_modules/sql.js/dist/sql-wasm.wasm');
  if (fs.existsSync(wasmSrc)) {
    fs.copyFileSync(wasmSrc, path.join(serverDestDir, 'sql-wasm.wasm'));
  }

  // 10. Copy assets
  console.log('📂 Assets');
  const assetsDestDir = path.join(projectRoot, 'apps/desktop/assets');
  fs.mkdirSync(assetsDestDir, { recursive: true });

  ['offline.html', 'loader.html'].forEach(file => {
    const src = path.join(projectRoot, 'apps/desktop/src', file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(assetsDestDir, file));
    }
  });

  // Copy icon
  const iconSrc = path.join(projectRoot, 'public/icon.png');
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, path.join(assetsDestDir, 'icon.png'));
  }

  // 11. Build desktop
  console.log('🖥️  Desktop');
  execSync('npx tsc --build apps/desktop', { stdio: 'inherit', cwd: projectRoot });

  // 12. Build web
  console.log('🌐 Web');
  execSync('npm run build -w @gem/web', { stdio: 'inherit', cwd: projectRoot });

  // 12b. Copy web build to desktop
  const webBuildSrc = path.join(projectRoot, 'apps/web/dist');
  const webBuildDest = path.join(projectRoot, 'apps/desktop/web');
  if (fs.existsSync(webBuildDest)) {
    fs.rmSync(webBuildDest, { recursive: true, force: true });
  }
  if (!fs.existsSync(webBuildSrc)) {
    throw new Error('Web build not found!');
  }
  fs.cpSync(webBuildSrc, webBuildDest, { recursive: true });
  console.log('   ✅ Copied web build');

  // 13. Create installer
  console.log('📦 Installer');
  process.env.NODE_ENV = 'production';
  execSync('npm run dist -w @gem/desktop', { stdio: 'inherit', cwd: projectRoot });

  console.log('\n✅ COMPLETE');
  console.log('📂 apps/desktop/release/');

} catch (error) {
  console.error('\n❌ FAILED:', error.message);
  process.exit(1);
}