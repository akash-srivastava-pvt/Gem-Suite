// apps/server/esbuild.config.ts
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';
import { builtinModules } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve monorepo packages explicitly
const monorepoPlugin = {
    name: 'monorepo',
    setup(build) {
        build.onResolve({ filter: /^@gem\/db$/ }, () => ({
            path: path.resolve(__dirname, '../../packages/db/dist/index.js'),
        }));

        build.onResolve({ filter: /^@gem\/shared$/ }, () => ({
            path: path.resolve(__dirname, '../../packages/shared/dist/index.js'),
        }));
    },
};

await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/server.ts')],
    bundle: true,

    platform: 'node',
    target: 'es2020',

    // ✅ REQUIRED for Electron runtime
    format: 'cjs',

    // ✅ Electron expects THIS exact file
    outfile: path.join(__dirname, 'dist/server.js'),

    // ✅ Externalize ALL non-local code
    external: [
        // Node built-ins
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),

        // npm deps (top-level)
        'express',
        'cors',
        'dotenv',
        'csv-parse',
        'fs-extra',
        'xlsx',
        'sql.js',
        'keytar',

        // sqlite native safety
        'better-sqlite3',
        'sqlite3'
    ],

    plugins: [monorepoPlugin],

    minify: false,
    sourcemap: false,
    logLevel: 'info',
});
