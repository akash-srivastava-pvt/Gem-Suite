# Production Build - Complete Solution

## Architecture

```
Installed App Structure:
GemSuite/
├── resources/
│   ├── app.asar                    # Electron main + React (read-only)
│   │   ├── dist/main.js            # Electron main process
│   │   ├── dist/preload.cjs        # Preload script
│   │   └── web/                    # React build
│   ├── server/                     # Server (NOT in ASAR, writable)
│   │   ├── server.js               # Bundled CommonJS server
│   │   ├── package.json            # {"type": "commonjs"}
│   │   ├── node_modules/           # Express, cors, sql.js, etc.
│   │   └── sql-wasm.wasm           # SQLite WASM
│   └── assets/                     # HTML files
│       ├── loader.html
│       └── offline.html
└── GemSuite.exe                    # Electron executable
```

## Key Decisions

### 1. Server: CommonJS Bundle + node_modules
- **Why**: Express has dynamic requires that break when fully bundled
- **Solution**: Bundle app code as CommonJS, externalize npm packages
- **Result**: `server.js` + real `node_modules/` folder

### 2. SQLite: WASM in server folder
- **Why**: sql.js needs WASM file at runtime
- **Solution**: Copy `sql-wasm.wasm` to server folder, resolve dynamically
- **Result**: Works in production, no ASAR issues

### 3. Electron: ESM main process
- **Why**: Modern TypeScript, better tree-shaking
- **Solution**: Keep Electron as ESM, server as CommonJS
- **Result**: No conflicts, both work

## Build Commands

```powershell
# Development
npm run build        # Build all packages

# Production
npm run dist         # Build + create installer
```

## Build Process

1. Clean desktop artifacts (keep package builds)
2. Build `packages/db` and `packages/shared` (TypeScript)
3. Bundle server with esbuild (CommonJS, externalize Express)
4. Create `server/` folder
5. Copy bundled `server.js`
6. Run `npm install` in `server/` (gets Express, cors, etc.)
7. Copy `sql-wasm.wasm`
8. Copy HTML assets
9. Build desktop (TypeScript)
10. Build web (Vite)
11. Run electron-builder

## Runtime Flow

1. **App starts** → Show `loader.html` immediately
2. **Fork server** → `child_process.fork('server/server.js')`
3. **Server loads** → Requires Express from `node_modules/`
4. **Server inits** → Loads SQLite, binds to port 0
5. **Server ready** → Sends IPC message with port
6. **Health check** → Electron pings `/health`
7. **Load app** → Navigate to `http://localhost:{port}`
8. **On error** → Show `offline.html` + error dialog

## Critical Files

### `apps/server/esbuild.config.js`
- Output: CommonJS
- Externalize: express, cors, dotenv, sql.js, keytar
- Bundle: app code + monorepo packages

### `scripts/dist.js`
- Build order matters
- Install real node_modules in server folder
- Copy WASM to server folder

### `apps/desktop/src/main.ts`
- Fork server from `resources/server/server.js`
- Wait for IPC + health check
- Never hang on loader
- Show errors with dialog

### `apps/desktop/package.json`
- `extraResources`: server folder (with node_modules)
- `files`: web build in ASAR
- `asarUnpack`: empty (server is in extraResources)

## Success Criteria

✅ App installs without errors
✅ App opens and shows loader
✅ Server starts (no missing modules)
✅ React loads
✅ SQLite works
✅ Offline mode works
✅ Error dialogs show on failure
✅ No loader hang
✅ Logs to file

## Troubleshooting

**Server won't start**
- Check log: `%APPDATA%/@gem/desktop/app.log`
- Verify `resources/server/node_modules/` exists
- Verify `resources/server/package.json` has `"type": "commonjs"`

**SQLite errors**
- Verify `sql-wasm.wasm` in `resources/server/`
- Check db path: `%APPDATA%/GemSuite/gem-suite.sqlite`

**Loader hangs**
- Server crashed - check log
- Port conflict - server uses port 0 (random)
- Health check timeout - increase timeout in main.ts

## Production Checklist

- [ ] `npm run dist` completes
- [ ] Installer created in `apps/desktop/release/`
- [ ] Install on clean machine
- [ ] App opens (loader shows)
- [ ] Server starts (check log)
- [ ] React loads
- [ ] Test offline mode
- [ ] Test error scenarios
- [ ] Check log file location
