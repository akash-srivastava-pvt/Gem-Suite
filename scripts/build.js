import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🏗️  Starting Core Build (Shared, DB, Web, Server, Desktop)...');

const run = (cmd) => {
    try {
        execSync(cmd, { stdio: 'inherit', shell: true });
    } catch (e) {
        console.error(`❌ Error executing: ${cmd}`);
        throw e;
    }
};

try {
    // 1. Force kill background processes
    console.log('🔫 1/4: Killing background processes...');
    try {
        execSync('taskkill //F //IM electron.exe //T 2>/dev/null || true');
        execSync('taskkill //F //IM node.exe //T 2>/dev/null || true');
    } catch (e) { /* ignore */ }

    // 2. Clean dist folders
    console.log('🧹 2/4: Cleaning old dist folders...');
    const workspaces = [
        'packages/shared',
        'packages/db',
        'apps/web',
        'apps/server',
        'apps/desktop'
    ];

    workspaces.forEach(ws => {
        const distPath = path.join(rootDir, ws, 'dist');
        if (fs.existsSync(distPath)) {
            fs.rmSync(distPath, { recursive: true, force: true });
        }
    });

    // 3. Build Logic (Shared -> DB -> Server -> Desktop)
    console.log('🧩 3/4: Compiling TypeScript Workspaces...');
    // Explicitly point to the config file using its absolute path
    const configPath = path.join(rootDir, 'tsconfig.json');

    // Use -p to point to the specific config
    execSync(`npx tsc --build "${configPath}" --clean`, { stdio: 'inherit', cwd: rootDir });
    execSync(`npx tsc --build "${configPath}"`, { stdio: 'inherit', cwd: rootDir });
    // 4. Build Web Frontend
    console.log('🌐 4/4: Building React Frontend...');
    run('npm run build -w @gem/web');

    console.log('\n✅ Core Build Finished Successfully!');

} catch (e) {
    console.error('\n❌ Build process aborted.');
    process.exit(1);
}