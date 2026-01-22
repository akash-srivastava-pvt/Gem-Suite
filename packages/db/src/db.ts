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



        try {
          this.db.run(`CREATE TABLE IF NOT EXISTS user_api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL DEFAULT 1,
            provider TEXT NOT NULL,
            tier TEXT NOT NULL,
            encrypted_api_key TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            is_default BOOLEAN DEFAULT 0,
            selected_text_model TEXT,
            selected_image_model TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, provider, tier),
            CHECK(is_default IN (0, 1)),
            CHECK(is_active IN (0, 1))
          )`);

          this.db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_default_key ON user_api_keys(user_id) WHERE is_default = 1`);
          this.db.run(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id)`);
          this.db.run(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_provider ON user_api_keys(provider)`);

          // Ensure saved_artifacts exists
          this.db.run(`CREATE TABLE IF NOT EXISTS saved_artifacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            filename TEXT NOT NULL,
            data TEXT NOT NULL,
            data_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT,
            UNIQUE(app_name, filename)
          )`);
          this.db.run(`CREATE INDEX IF NOT EXISTS idx_saved_artifacts_app_name ON saved_artifacts(app_name)`);

          // Ensure usage_metrics exists
          this.db.run(`CREATE TABLE IF NOT EXISTS usage_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            event_type TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT
          )`);
          this.db.run(`CREATE INDEX IF NOT EXISTS idx_usage_metrics_app_name ON usage_metrics(app_name)`);

          console.log('✅ Secondary tables and indexes verified/created');

          // Migration: Move existing API key from activate table (one-time only)
          const existingActivate = this.query<{ apiKey: string }>('SELECT apiKey FROM activate WHERE id = 1');
          if (existingActivate.length > 0) {
            const apiKey = existingActivate[0].apiKey;
            const existingApiKeys = this.query<{ count: number }>('SELECT COUNT(*) as count FROM user_api_keys WHERE user_id = 1');

            if (existingApiKeys[0]?.count === 0) {
              // Import as unencrypted for backward compatibility
              this.execute(
                `INSERT INTO user_api_keys (user_id, provider, tier, encrypted_api_key, is_active, is_default, selected_text_model, selected_image_model)
                 VALUES (1, 'gemini', 'free', ?, 1, 1, 'gemini-2-flash', 'gemini-2-imagen')`,
                [apiKey]
              );
              console.log('✅ Migrated existing API key to new system (unencrypted for compatibility)');

              // Drop the old table after successful migration
              this.db.run('DROP TABLE IF EXISTS activate');
              console.log('✅ Removed legacy activate table');
            }
          }

          this.save();
        } catch (err: any) {
          console.warn('DB initialization migration note:', err.message);
        }
      } else {
        console.log(`Creating new database at: ${this.dbPath}`);
        this.db = new SQL.Database();

        this.db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY, 
          name TEXT,
          personalAgreement BOOLEAN
        )`);

        this.db.run(`CREATE TABLE IF NOT EXISTS logger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        this.db.run(`CREATE TABLE IF NOT EXISTS resume (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contacts TEXT,
          links TEXT,
          work_history TEXT,
          education TEXT,
          personal_projects TEXT,
          skills TEXT,
          cover_letter_para TEXT
      )`);

        this.db.run(`CREATE TABLE IF NOT EXISTS user_api_keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL DEFAULT 1,
          provider TEXT NOT NULL,
          tier TEXT NOT NULL,
          encrypted_api_key TEXT NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          is_default BOOLEAN DEFAULT 0,
          selected_text_model TEXT,
          selected_image_model TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, provider, tier),
          CHECK(is_default IN (0, 1)),
          CHECK(is_active IN (0, 1))
        )`);

        console.log('📋 Creating saved_artifacts table...');
        this.db.run(`CREATE TABLE IF NOT EXISTS saved_artifacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          app_name TEXT NOT NULL,
          filename TEXT NOT NULL,
          data TEXT NOT NULL,
          data_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          UNIQUE(app_name, filename)
        )`);
        console.log('✅ saved_artifacts table created');

        console.log('📊 Creating usage_metrics table...');
        this.db.run(`CREATE TABLE IF NOT EXISTS usage_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          app_name TEXT NOT NULL,
          event_type TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
        )`);
        console.log('✅ usage_metrics table created');

        console.log('🔍 Creating indexes...');
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_saved_artifacts_app_name ON saved_artifacts(app_name)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_saved_artifacts_created_at ON saved_artifacts(created_at)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_usage_metrics_app_name ON usage_metrics(app_name)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_usage_metrics_timestamp ON usage_metrics(timestamp)`);
        this.db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_default_key ON user_api_keys(user_id) WHERE is_default = 1`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_provider ON user_api_keys(provider)`);
        console.log('✅ Indexes created');

        this.save();
      }

      console.log('✅ Database initialized successfully');

    } catch (err) {
      console.error('❌ Database initialization failed:', err);
      throw err;
    }
  }

  public save() {
    if (!this.db) {
      console.warn('Database save skipped: not initialized');
      return;
    }
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (error) {
      console.error('❌ Database save failed:', error);
      throw error;
    }
  }

  query<T>(sql: string, params: any[] = []): T[] {
    if (!this.db) {
      throw new Error('Database not initialized. Ensure db.init() is called before usage.');
    }
    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }

    stmt.free();
    return results;
  }

  /**
   * Execute SQL without saving to disk (useful for batch operations/transactions)
   */
  run(sql: string, params: any[] = []) {
    if (!this.db) {
      throw new Error('Database not initialized. Ensure db.init() is called before usage.');
    }
    return this.db.run(sql, params);
  }

  /**
   * Execute SQL and save to disk immediately
   */
  execute(sql: string, params: any[] = []) {
    const result = this.run(sql, params);
    this.save();
    return result;
  }
}

export const db = new DatabaseModel();