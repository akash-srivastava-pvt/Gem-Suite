import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const __dirname = process.cwd();

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

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const dbPath = path.join(dbDir, 'gem-suite.sqlite');
      console.log(`Database path: ${dbPath}`);
      return dbPath;
    }

    return path.join(process.cwd(), 'gem-suite.sqlite');
  }

  async init() {
    try {
      // STEP 1: Locate WASM file
      // In production (bundled): ./sql-wasm.wasm (copied by build script)
      // In development: node_modules/sql.js/dist/sql-wasm.wasm
      const isProd = process.env.NODE_ENV === 'production';

      const possiblePaths = [
        // Production: Next to server executable
        path.join(path.dirname(process.argv[1]), 'sql-wasm.wasm'),

        // Development: Root node_modules
        path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),

        // Development: Package nested node_modules
        path.resolve(process.cwd(), '../../node_modules/sql.js/dist/sql-wasm.wasm'),

        // Development: Direct path (monorepo structure)
        path.resolve(process.cwd(), 'packages/db/node_modules/sql.js/dist/sql-wasm.wasm'),
        // Development: From apps/server cwd
        path.resolve(process.cwd(), '../../packages/db/node_modules/sql.js/dist/sql-wasm.wasm'),

        // Fallback for weird hoisting
        path.resolve(process.cwd(), '../node_modules/sql.js/dist/sql-wasm.wasm')
      ];

      const wasmPath = possiblePaths.find(p => fs.existsSync(p));

      console.log('Searching WASM in:', possiblePaths);

      if (!wasmPath) {
        throw new Error(`WASM file not found in any location`);
      }

      console.log(`✅ Found WASM: ${wasmPath}`);

      // STEP 2: Read WASM file
      const fileBuffer = fs.readFileSync(wasmPath);

      // STEP 3: Convert to ArrayBuffer
      const wasmBinary: ArrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      ) as ArrayBuffer;

      // STEP 4: Initialize sql.js
      const SQL = await initSqlJs({ wasmBinary });

      // STEP 5: Load or create database
      if (fs.existsSync(this.dbPath)) {
        console.log(`Loading existing database from: ${this.dbPath}`);
        const diskBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(diskBuffer);
      } else {
        console.log(`Creating new database at: ${this.dbPath}`);
        this.db = new SQL.Database();

        this.db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY, 
          name TEXT,
          personalAgreement BOOLEAN
        )`);

        this.db.run(`CREATE TABLE IF NOT EXISTS activate (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          apiKey TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        this.db.run(`CREATE TABLE IF NOT EXISTS logger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        this.db.run(`CREATE TABLE IF NOT EXISTS resume (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contacts TEXT,           -- JSON array of objects
          links TEXT,              -- JSON array of objects
          work_history TEXT,       -- JSON array of objects
          education TEXT,          -- JSON array of objects
          personal_projects TEXT,  -- JSON array of objects
          skills TEXT,             -- JSON array of objects
          cover_letter_para TEXT   -- long text
      )`);


        this.saveToDisk();
      }

      console.log('✅ Database initialized successfully');

    } catch (err) {
      console.error('❌ Database initialization failed:', err);
      throw err;
    }
  }

  private saveToDisk() {
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (error) {
      console.error('❌ Database save failed:', error);
      throw error;
    }
  }

  query<T>(sql: string, params: any[] = []): T[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }

    stmt.free();
    return results;
  }

  execute(sql: string, params: any[] = []) {
    this.db.run(sql, params);
    this.saveToDisk();
  }
}

export const db = new DatabaseModel();