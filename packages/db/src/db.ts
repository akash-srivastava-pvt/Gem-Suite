import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

class DatabaseModel {
  private db!: Database;
  private dbPath: string;

  constructor() {
    this.dbPath = this.getDatabasePath();
  }

  private getDatabasePath(): string {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      const appData = process.env.APPDATA ||
        (process.platform === 'darwin' 
          ? path.join(os.homedir(), 'Library/Application Support') 
          : path.join(os.homedir(), '.local/share'));

      const dbDir = path.join(appData, 'GemSuite');
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      return path.join(dbDir, 'gem-suite.sqlite');
    }
    return path.join(process.cwd(), 'gem-suite.sqlite');
  }

  async init() {
    // 1. Locate WASM file physically (it will be in asarUnpack)
    const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
    
    // 2. Read into Node.js Buffer
    const fileBuffer = fs.readFileSync(wasmPath);

    // 3. FIX: Convert Buffer to ArrayBuffer for TypeScript 5.7+
    const wasmBinary: ArrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    ) as ArrayBuffer;

    const SQL = await initSqlJs({ wasmBinary });

    if (fs.existsSync(this.dbPath)) {
      const diskBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(diskBuffer);
    } else {
      this.db = new SQL.Database();
      this.db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)`);
      this.db.run(`CREATE TABLE IF NOT EXISTS activate (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            apiKey TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );`)
      this.saveToDisk();
    }
  }

  private saveToDisk() {
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (error) {
      console.error('❌ Database save failed:', error);
    }
  }

  query<T>(sql: string, params: any[] = []): T[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject() as unknown as T);
    stmt.free();
    return results;
  }

  execute(sql: string, params: any[] = []) {
    this.db.run(sql, params);
    this.saveToDisk();
  }
}

export const db = new DatabaseModel();