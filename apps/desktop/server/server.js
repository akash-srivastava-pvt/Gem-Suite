"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/utility/jsonParser.ts
var jsonParser_exports = {};
__export(jsonParser_exports, {
  extractTextContent: () => extractTextContent,
  parseAIJSON: () => parseAIJSON
});
function parseAIJSON(response) {
  if (!response || typeof response !== "string") {
    throw new Error("Invalid response: empty or not a string");
  }
  let cleaned = response.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  let jsonStart = -1;
  let jsonEnd = -1;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    jsonStart = firstBrace;
    jsonEnd = lastBrace + 1;
  } else if (firstBracket !== -1) {
    jsonStart = firstBracket;
    jsonEnd = lastBracket + 1;
  }
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No valid JSON structure found in response");
  }
  let jsonString = cleaned.substring(jsonStart, jsonEnd);
  jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");
  jsonString = jsonString.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
    if (match.includes("\n") && !match.includes("\\n")) {
      return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    }
    return match;
  });
  jsonString = jsonString.replace(/\/\/.*$/gm, "");
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    try {
      const fixed = fixUnterminatedString(jsonString);
      return JSON.parse(fixed);
    } catch (secondError) {
      console.error("JSON Parse Error:", {
        original: response.substring(0, 200),
        cleaned: jsonString.substring(0, 200),
        error: error.message,
        position: error.message.match(/position (\d+)/)?.[1]
      });
      throw new Error(`Failed to parse JSON: ${error.message}. Response preview: ${jsonString.substring(0, 100)}...`);
    }
  }
}
function fixUnterminatedString(json) {
  let fixed = json;
  let inString = false;
  let escapeNext = false;
  let stringStart = -1;
  for (let i = 0; i < fixed.length; i++) {
    const char = fixed[i];
    const prevChar = i > 0 ? fixed[i - 1] : "";
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      escapeNext = true;
      continue;
    }
    if (char === '"' && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringStart = i;
      } else {
        inString = false;
        stringStart = -1;
      }
    }
    if (i === fixed.length - 1 && inString && stringStart !== -1) {
      const beforeString = fixed.substring(0, stringStart);
      const lastColon = beforeString.lastIndexOf(":");
      if (lastColon !== -1) {
        fixed = fixed + '"';
        break;
      }
    }
  }
  return fixed;
}
function extractTextContent(response, fieldName = "content") {
  try {
    const parsed = parseAIJSON(response);
    if (parsed[fieldName]) {
      return parsed[fieldName];
    }
    if (parsed.content) {
      return parsed.content;
    }
    if (parsed.text) {
      return parsed.text;
    }
    if (typeof parsed === "string") {
      return parsed;
    }
    const stringified = JSON.stringify(parsed, null, 2);
    return stringified;
  } catch (error) {
    let cleaned = response.replace(/```json|```/g, "").trim();
    const textMatch = cleaned.match(/"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (textMatch) {
      return textMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
    return cleaned;
  }
}
var init_jsonParser = __esm({
  "src/utility/jsonParser.ts"() {
    "use strict";
  }
});

// src/server.ts
var import_express8 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_config = require("dotenv/config");
var import_url = require("url");

// ../../packages/db/dist/db.js
var import_sql = __toESM(require("sql.js"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_os = __toESM(require("os"), 1);
var __dirname2 = process.cwd();
var DatabaseModel = class {
  constructor() {
    this.dbPath = this.getDatabasePath();
  }
  getDatabasePath() {
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      const appData = process.env.APPDATA || (process.platform === "darwin" ? import_path.default.join(import_os.default.homedir(), "Library/Application Support") : import_path.default.join(import_os.default.homedir(), ".local/share"));
      const dbDir = import_path.default.join(appData, "GemSuite");
      if (!import_fs.default.existsSync(dbDir)) {
        import_fs.default.mkdirSync(dbDir, { recursive: true });
      }
      const dbPath = import_path.default.join(dbDir, "gem-suite.sqlite");
      console.log(`Database path: ${dbPath}`);
      return dbPath;
    }
    return import_path.default.join(process.cwd(), "gem-suite.sqlite");
  }
  async init() {
    try {
      const isProd = process.env.NODE_ENV === "production";
      const possiblePaths = [
        // Production: Next to server executable
        import_path.default.join(import_path.default.dirname(process.argv[1]), "sql-wasm.wasm"),
        // Development: Root node_modules
        import_path.default.resolve(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm"),
        // Development: Package nested node_modules
        import_path.default.resolve(process.cwd(), "../../node_modules/sql.js/dist/sql-wasm.wasm"),
        // Development: Direct path (monorepo structure)
        import_path.default.resolve(process.cwd(), "packages/db/node_modules/sql.js/dist/sql-wasm.wasm"),
        // Development: From apps/server cwd
        import_path.default.resolve(process.cwd(), "../../packages/db/node_modules/sql.js/dist/sql-wasm.wasm"),
        // Fallback for weird hoisting
        import_path.default.resolve(process.cwd(), "../node_modules/sql.js/dist/sql-wasm.wasm")
      ];
      const wasmPath = possiblePaths.find((p) => import_fs.default.existsSync(p));
      console.log("Searching WASM in:", possiblePaths);
      if (!wasmPath) {
        throw new Error(`WASM file not found in any location`);
      }
      console.log(`\u2705 Found WASM: ${wasmPath}`);
      const fileBuffer = import_fs.default.readFileSync(wasmPath);
      const wasmBinary = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
      const SQL = await (0, import_sql.default)({ wasmBinary });
      if (import_fs.default.existsSync(this.dbPath)) {
        console.log(`Loading existing database from: ${this.dbPath}`);
        const diskBuffer = import_fs.default.readFileSync(this.dbPath);
        this.db = new SQL.Database(diskBuffer);
        try {
          this.db.run(`ALTER TABLE users ADD COLUMN geminiVersion TEXT DEFAULT '2'`);
          console.log("\u2705 Added geminiVersion column to users table");
          this.saveToDisk();
        } catch (err) {
          if (!err.message?.includes("duplicate column")) {
            console.warn("Migration note:", err.message);
          }
        }
      } else {
        console.log(`Creating new database at: ${this.dbPath}`);
        this.db = new SQL.Database();
        this.db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY, 
          name TEXT,
          personalAgreement BOOLEAN,
          geminiVersion TEXT DEFAULT '2'
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
      console.log("\u2705 Database initialized successfully");
    } catch (err) {
      console.error("\u274C Database initialization failed:", err);
      throw err;
    }
  }
  saveToDisk() {
    try {
      const data = this.db.export();
      import_fs.default.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (error) {
      console.error("\u274C Database save failed:", error);
      throw error;
    }
  }
  query(sql, params = []) {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
  execute(sql, params = []) {
    this.db.run(sql, params);
    this.saveToDisk();
  }
};
var db = new DatabaseModel();

// src/routes/index.ts
var import_express7 = require("express");

// src/routes/activateRoutes.ts
var import_express = require("express");

// src/utility/security.ts
var import_crypto = __toESM(require("crypto"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var ALGO = "aes-256-gcm";
var KEY_LENGTH = 32;
var SERVICE_NAME = "gem-suite";
var ACCOUNT_NAME = "db-encryption-key";
var masterKey = null;
var isElectron = false;
async function getOrCreateMasterKey() {
  if (masterKey) {
    return masterKey;
  }
  let key = null;
  if (isElectron) {
    try {
      const keytar = await import("keytar");
      key = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      if (!key) {
        const newKey = import_crypto.default.randomBytes(KEY_LENGTH).toString("hex");
        await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, newKey);
        key = newKey;
      }
    } catch (error) {
      console.warn("Keytar not available, using fallback key storage");
      key = getOrCreateFileBasedKey();
    }
  } else {
    key = getOrCreateFileBasedKey();
  }
  masterKey = Buffer.from(key, "hex");
  return masterKey;
}
function getOrCreateFileBasedKey() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || ".";
  const keyDir = import_path2.default.join(homeDir, ".gem-suite");
  if (!import_fs2.default.existsSync(keyDir)) {
    import_fs2.default.mkdirSync(keyDir, { recursive: true });
  }
  const keyPath = import_path2.default.join(keyDir, ".encryption-key");
  if (import_fs2.default.existsSync(keyPath)) {
    return import_fs2.default.readFileSync(keyPath, "utf-8").trim();
  }
  const newKey = import_crypto.default.randomBytes(KEY_LENGTH).toString("hex");
  import_fs2.default.writeFileSync(keyPath, newKey, { mode: 384 });
  return newKey;
}
async function encrypt(text) {
  const key = await getOrCreateMasterKey();
  const iv = import_crypto.default.randomBytes(12);
  const cipher = import_crypto.default.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}
async function decrypt(payload) {
  const key = await getOrCreateMasterKey();
  const data = Buffer.from(payload, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = import_crypto.default.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  try {
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  } catch (error) {
    throw new Error("Decryption failed: Invalid payload or corrupted data");
  }
}

// src/models/userModel.ts
var UserModel = {
  getUser: () => {
    const rows = db.query("SELECT * FROM users LIMIT 1");
    if (rows.length > 0) {
      const user = rows[0];
      if (!user.geminiVersion) {
        user.geminiVersion = "2";
      }
      return user;
    }
    return null;
  },
  createUser: (name) => {
    db.execute(
      "INSERT INTO users (name, personalAgreement, geminiVersion) VALUES (?, ?, ?)",
      [name, true, "2"]
    );
    db.execute("INSERT INTO logger (event) VALUES (?)", [`User agreement signed by ${name}`]);
  },
  updateGeminiVersion: (version) => {
    const user = UserModel.getUser();
    if (user) {
      db.execute(
        "UPDATE users SET geminiVersion = ? WHERE id = ?",
        [version, user.id]
      );
    }
  },
  getGeminiVersion: () => {
    const user = UserModel.getUser();
    return user?.geminiVersion || "2";
  },
  deleteData: () => {
    db.execute("DELETE FROM users");
    db.execute("DELETE FROM activate");
    db.execute("DELETE FROM resume");
    db.execute("INSERT INTO logger (event) VALUES (?)", ["All user data deleted"]);
  },
  hasAgreed: () => {
    const user = UserModel.getUser();
    return user ? !!user.personalAgreement : false;
  }
};

// src/proxies/gemini2.ts
var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
var REQUEST_TIMEOUT = 3e4;
var MAX_RETRIES = 2;
async function callGemini(apiKey, prompt) {
  if (!apiKey || !prompt) {
    throw new Error("API key and prompt are required");
  }
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // x-goog-api-key can also be used here, but query param is most reliable for fetch
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 7200
          }
        }),
        signal: controller.signal
        // Connect timeout signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const status = response.status;
        const errorData = await response.json().catch(() => ({}));
        if (status === 401 || status === 403) {
          throw new Error("Invalid Gemini API key");
        }
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
          const delay = 1e3 * (attempt + 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(
          errorData.error?.message || `Gemini request failed (${status})`
        );
      }
      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }
      return { data: text };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        if (attempt < MAX_RETRIES) {
          const delay = 1e3 * (attempt + 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error("Gemini request timed out");
      }
      if (attempt < MAX_RETRIES) {
        const delay = 1e3 * (attempt + 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Gemini request failed after retries");
}

// src/proxies/gemini3.ts
var GEMINI_URL2 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent";
var REQUEST_TIMEOUT2 = 45e3;
var MAX_TOKENS = 7200;
async function callGemini2(apiKey, prompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT2);
    try {
      const response = await fetch(`${GEMINI_URL2}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // Note: Gemini usually prefers key as a query param, 
          // but some versions support x-goog-api-key header.
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: MAX_TOKENS,
            temperature: 0.3
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const status = response.status;
        const errorBody = await response.json().catch(() => ({}));
        if (status === 401 || status === 403) {
          throw new Error("Invalid Gemini API key");
        }
        if (status === 429 && attempt < retries) {
          const retryAfter = Number(response.headers.get("retry-after")) || 5;
          const backoffMs = retryAfter * 1e3 + Math.random() * 1e3;
          console.warn(`[Gemini] 429 received. Waiting ${backoffMs}ms before retry`);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        if (status >= 400 && status < 500) {
          throw new Error(errorBody.error?.message || `Gemini client error (${status})`);
        }
        if (attempt < retries) {
          const backoffMs = 3e3 * (attempt + 1);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        throw new Error(`Gemini request failed with status ${status}`);
      }
      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty Gemini response");
      return { data: text };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        if (attempt < retries) {
          continue;
        }
        throw new Error("Gemini request timed out");
      }
      if (attempt < retries) {
        const backoffMs = 3e3 * (attempt + 1);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable Gemini client state");
}

// src/proxies/gemini2img.ts
var GEMINI_URL3 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
var REQUEST_TIMEOUT3 = 3e4;
var MAX_RETRIES2 = 2;
async function callGemini3(apiKey, prompt) {
  if (!apiKey || !prompt) {
    throw new Error("API key and prompt are required");
  }
  for (let attempt = 0; attempt <= MAX_RETRIES2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT3
    );
    try {
      const response = await fetch(`${GEMINI_URL3}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseModalities: ["IMAGE"]
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const status = response.status;
        const errorText = await response.text();
        if (status === 401 || status === 403) {
          throw new Error("Invalid Gemini API key");
        }
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES2) {
          await new Promise(
            (r) => setTimeout(r, 1e3 * (attempt + 1))
          );
          continue;
        }
        throw new Error(
          `Gemini request failed (${status}): ${errorText}`
        );
      }
      const resData = await response.json();
      const imagePart = resData?.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData
      );
      if (!imagePart?.inlineData?.data) {
        throw new Error("No image returned from Gemini");
      }
      return {
        image: {
          mimeType: imagePart.inlineData.mimeType,
          base64: imagePart.inlineData.data
        }
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        if (attempt < MAX_RETRIES2) {
          await new Promise(
            (r) => setTimeout(r, 1e3 * (attempt + 1))
          );
          continue;
        }
        throw new Error("Gemini request timed out");
      }
      if (attempt < MAX_RETRIES2) {
        await new Promise(
          (r) => setTimeout(r, 1e3 * (attempt + 1))
        );
        continue;
      }
      throw err;
    }
  }
  throw new Error("Gemini request failed after retries");
}

// src/proxies/gemini3img.ts
var GEMINI_URL4 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent";
var REQUEST_TIMEOUT4 = 45e3;
var MAX_RETRIES3 = 2;
async function callGemini4(apiKey, prompt) {
  if (!apiKey || !prompt) {
    throw new Error("API key and prompt are required");
  }
  for (let attempt = 0; attempt <= MAX_RETRIES3; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT4
    );
    try {
      const response = await fetch(`${GEMINI_URL4}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseModalities: ["IMAGE"]
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const status = response.status;
        const errorText = await response.text();
        if (status === 401 || status === 403) {
          throw new Error("Invalid Gemini API key");
        }
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES3) {
          const backoffMs = 3e3 * (attempt + 1);
          await new Promise(
            (r) => setTimeout(r, backoffMs)
          );
          continue;
        }
        throw new Error(
          `Gemini request failed (${status}): ${errorText}`
        );
      }
      const resData = await response.json();
      const imagePart = resData?.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData
      );
      if (!imagePart?.inlineData?.data) {
        throw new Error("No image returned from Gemini");
      }
      return {
        image: {
          mimeType: imagePart.inlineData.mimeType,
          base64: imagePart.inlineData.data
        }
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        if (attempt < MAX_RETRIES3) {
          const backoffMs = 3e3 * (attempt + 1);
          await new Promise(
            (r) => setTimeout(r, backoffMs)
          );
          continue;
        }
        throw new Error("Gemini request timed out");
      }
      if (attempt < MAX_RETRIES3) {
        const backoffMs = 3e3 * (attempt + 1);
        await new Promise(
          (r) => setTimeout(r, backoffMs)
        );
        continue;
      }
      throw err;
    }
  }
  throw new Error("Gemini request failed after retries");
}

// src/utility/helper.ts
var validateGeminiApiKey = async (apiKey, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`,
        {
          method: "GET"
        }
      );
      if (response.ok) {
        return true;
      }
      if (response.status === 401 || response.status === 403) {
        return false;
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1e3 * attempt));
        continue;
      }
    } catch (error) {
      console.warn(`Validation attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1e3 * attempt));
        continue;
      }
    }
  }
  return false;
};
async function getApiKey() {
  const activate = await db.query("SELECT apiKey FROM activate WHERE id=1 LIMIT 1");
  const key = activate[0].apiKey;
  const decryptedKey = await decrypt(key);
  return decryptedKey;
}
async function callGeminiWithUserPreference(apiKey, prompt) {
  const version = UserModel.getGeminiVersion();
  if (version === "3") {
    return callGemini2(apiKey, prompt);
  }
  return callGemini(apiKey, prompt);
}
async function callGeminiImageWithUserPreference(apiKey, prompt) {
  const version = UserModel.getGeminiVersion();
  if (version === "3") {
    return callGemini4(apiKey, prompt);
  }
  return callGemini3(apiKey, prompt);
}

// src/models/loggerModel.ts
var LoggerModel = {
  getLogs: () => {
    return db.query("SELECT * FROM logger ORDER BY timestamp DESC LIMIT 50");
  },
  log: (event) => {
    db.execute("INSERT INTO logger (event) VALUES (?)", [event]);
  }
};

// src/controllers/activateController.ts
var ActivateController = {
  // GET /api/v1/activate
  get: async (_req, res) => {
    try {
      const rows = db.query(
        "SELECT * FROM activate WHERE id = 1"
      );
      if (rows.length === 0) {
        return res.json({
          success: false,
          message: "No activation key found"
        });
      }
      const encryptedKey = rows[0].apiKey;
      const apiKey = await decrypt(encryptedKey);
      const isValid = await validateGeminiApiKey(apiKey);
      LoggerModel.log(`Gemini API key validated: ${isValid ? "Success" : "Failed"}`);
      return res.json({
        success: isValid,
        message: isValid ? "User is authorised" : "User is not authorised"
      });
    } catch (error) {
      console.error("[ACTIVATE][GET]", error);
      res.status(500).json({ error: "Failed to authorise user" });
    }
  },
  // POST /api/v1/activate
  create: async (req, res) => {
    try {
      const { key } = req.body;
      if (!key || typeof key !== "string") {
        return res.status(400).json({ error: "Key is required" });
      }
      const isValid = await validateGeminiApiKey(key);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid Gemini API key" });
      }
      const encryptedKey = await encrypt(key);
      await db.execute(
        `
        INSERT INTO activate (id, apiKey)
        VALUES (1, ?)
        ON CONFLICT(id) DO UPDATE SET apiKey = excluded.apiKey
        `,
        [encryptedKey]
      );
      LoggerModel.log("Gemini API key activated and saved");
      res.status(201).json({
        success: true,
        message: "User activated successfully"
      });
    } catch (error) {
      console.error("[ACTIVATE][POST]", error);
      res.status(500).json({ error: "Failed to save activation key" });
    }
  }
};

// src/routes/activateRoutes.ts
var router = (0, import_express.Router)();
router.get("/", ActivateController.get);
router.post("/", ActivateController.create);
var activateRoutes_default = router;

// src/routes/tripRoutes.ts
var import_express2 = require("express");

// src/utility/errors.ts
var AppError = class _AppError extends Error {
  constructor(statusCode = 500, message = "Internal Server Error", isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, _AppError.prototype);
  }
};
var ValidationError = class _ValidationError extends AppError {
  constructor(message) {
    super(400, message, true);
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};

// src/orchestration/agentRegistry.ts
var AgentRegistry = class {
  constructor() {
    this.agents = /* @__PURE__ */ new Map();
  }
  /**
   * Register an agent
   */
  register(agent) {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent already registered: ${agent.id}`);
    }
    this.agents.set(agent.id, agent);
  }
  /**
   * Get an agent by ID
   */
  get(agentId) {
    return this.agents.get(agentId);
  }
  /**
   * Check if agent exists
   */
  has(agentId) {
    return this.agents.has(agentId);
  }
  /**
   * List all agents
   */
  list() {
    return Array.from(this.agents.values());
  }
  /**
   * List agents by category/prefix
   */
  listByPrefix(prefix) {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.id.startsWith(prefix)
    );
  }
  /**
   * Unregister an agent
   */
  unregister(agentId) {
    return this.agents.delete(agentId);
  }
};
var agentRegistry = new AgentRegistry();

// src/mcp/tools/geocoding.tool.ts
var GeocodingTool = {
  name: "geocoding",
  description: "Calculate distances between locations and optimize routes",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["distance", "route_optimize", "get_coordinates"],
        description: "Action to perform"
      },
      from: { type: "string", description: "Starting location" },
      to: { type: "string", description: "Destination location" },
      places: {
        type: "array",
        items: { type: "string" },
        description: "List of places to optimize route for"
      }
    },
    required: ["action"]
  },
  execute: async (params) => {
    const { action, from, to, places } = params;
    switch (action) {
      case "distance":
        if (!from || !to) {
          throw new Error('Both "from" and "to" are required for distance calculation');
        }
        return calculateDistance(from, to);
      case "route_optimize":
        if (!places || places.length === 0) {
          throw new Error("Places array is required for route optimization");
        }
        return optimizeRoute(places, from);
      case "get_coordinates":
        if (!from) {
          throw new Error("Location is required");
        }
        return getCoordinates(from);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};
function calculateDistance(from, to) {
  const cityDistances = {
    "Mumbai": { "Delhi": 1400, "Bangalore": 850, "Kolkata": 2e3, "Chennai": 1300 },
    "Delhi": { "Mumbai": 1400, "Bangalore": 2200, "Kolkata": 1500, "Chennai": 2200 },
    "Bangalore": { "Mumbai": 850, "Delhi": 2200, "Kolkata": 1900, "Chennai": 350 },
    "Kolkata": { "Mumbai": 2e3, "Delhi": 1500, "Bangalore": 1900, "Chennai": 1700 },
    "Chennai": { "Mumbai": 1300, "Delhi": 2200, "Bangalore": 350, "Kolkata": 1700 }
  };
  const normalize = (city) => city.split(",")[0].trim();
  const fromCity = normalize(from);
  const toCity = normalize(to);
  if (cityDistances[fromCity]?.[toCity]) {
    const distance = cityDistances[fromCity][toCity];
    return {
      distance,
      unit: "km",
      mode: distance < 700 ? "train" : "flight"
    };
  }
  const estimatedDistance = 800;
  return {
    distance: estimatedDistance,
    unit: "km",
    mode: estimatedDistance < 700 ? "train" : "flight"
  };
}
function optimizeRoute(places, startLocation) {
  if (places.length <= 1) {
    return { optimized: places, totalDistance: 0 };
  }
  const optimized = [];
  const remaining = [...places];
  let current = startLocation || remaining.shift() || "";
  optimized.push(current);
  while (remaining.length > 0) {
    let nearest = remaining[0];
    let minDistance = Infinity;
    for (const place of remaining) {
      const dist = calculateDistance(current, place).distance;
      if (dist < minDistance) {
        minDistance = dist;
        nearest = place;
      }
    }
    optimized.push(nearest);
    remaining.splice(remaining.indexOf(nearest), 1);
    current = nearest;
  }
  let totalDistance = 0;
  for (let i = 0; i < optimized.length - 1; i++) {
    totalDistance += calculateDistance(optimized[i], optimized[i + 1]).distance;
  }
  return { optimized, totalDistance };
}
function getCoordinates(location) {
  const cityCoords = {
    "Mumbai": { lat: 19.076, lng: 72.8777 },
    "Delhi": { lat: 28.6139, lng: 77.209 },
    "Bangalore": { lat: 12.9716, lng: 77.5946 },
    "Kolkata": { lat: 22.5726, lng: 88.3639 },
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Hyderabad": { lat: 17.385, lng: 78.4867 },
    "Pune": { lat: 18.5204, lng: 73.8567 },
    "Jaipur": { lat: 26.9124, lng: 75.7873 }
  };
  const normalize = (city2) => city2.split(",")[0].trim();
  const city = normalize(location);
  if (cityCoords[city]) {
    return { ...cityCoords[city], city };
  }
  return { lat: 20.5937, lng: 78.9629, city };
}

// src/mcp/tools/ats.tool.ts
var ATSTool = {
  name: "ats_analyzer",
  description: "Analyze resumes for ATS optimization and extract keywords from job descriptions",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["extract_keywords", "score_resume", "get_industry_keywords", "parse_job_description"],
        description: "Action to perform"
      },
      text: { type: "string", description: "Text to analyze (resume or job description)" },
      industry: { type: "string", description: "Industry sector (e.g., software, finance, healthcare)" },
      jobDescription: { type: "string", description: "Job description text" }
    },
    required: ["action"]
  },
  execute: async (params) => {
    const { action, text, industry, jobDescription } = params;
    switch (action) {
      case "extract_keywords":
        if (!text) throw new Error("Text is required");
        return extractKeywords(text);
      case "score_resume":
        if (!text || !jobDescription) {
          throw new Error("Both resume text and job description are required");
        }
        return scoreResume(text, jobDescription);
      case "get_industry_keywords":
        if (!industry) throw new Error("Industry is required");
        return getIndustryKeywords(industry);
      case "parse_job_description":
        if (!jobDescription) throw new Error("Job description is required");
        return parseJobDescription(jobDescription);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};
function extractKeywords(text) {
  const lowerText = text.toLowerCase();
  const techKeywords = [
    "javascript",
    "python",
    "java",
    "react",
    "node.js",
    "sql",
    "mongodb",
    "aws",
    "docker",
    "kubernetes",
    "git",
    "agile",
    "scrum",
    "api",
    "rest",
    "typescript",
    "angular",
    "vue",
    "html",
    "css",
    "machine learning",
    "ai",
    "data analysis",
    "cloud computing",
    "devops",
    "ci/cd"
  ];
  const softSkills = [
    "leadership",
    "communication",
    "teamwork",
    "problem solving",
    "analytical",
    "creative",
    "detail-oriented",
    "time management",
    "project management",
    "collaboration",
    "adaptability",
    "critical thinking"
  ];
  const foundTech = techKeywords.filter((keyword) => lowerText.includes(keyword));
  const foundSoft = softSkills.filter((skill) => lowerText.includes(skill));
  const capitalizedTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const technologies = capitalizedTerms.filter(
    (term) => techKeywords.some((keyword) => term.toLowerCase().includes(keyword))
  );
  return {
    keywords: [...foundTech, ...foundSoft],
    skills: foundSoft,
    technologies: [...foundTech, ...technologies]
  };
}
function scoreResume(resumeText, jobDescription) {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescription);
  const matched = resumeKeywords.keywords.filter(
    (kw) => jobKeywords.keywords.some((jk) => jk.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk.toLowerCase()))
  );
  const missing = jobKeywords.keywords.filter(
    (jk) => !resumeKeywords.keywords.some((rk) => rk.toLowerCase().includes(jk.toLowerCase()) || jk.toLowerCase().includes(rk.toLowerCase()))
  );
  const score = Math.round(matched.length / Math.max(jobKeywords.keywords.length, 1) * 100);
  const suggestions = missing.slice(0, 5).map(
    (keyword) => `Consider adding: ${keyword}`
  );
  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    suggestions
  };
}
function getIndustryKeywords(industry) {
  const industryKeywords = {
    software: {
      keywords: ["programming", "software development", "coding", "algorithms", "data structures"],
      commonSkills: ["JavaScript", "Python", "Java", "React", "Node.js", "SQL", "Git"]
    },
    finance: {
      keywords: ["financial analysis", "accounting", "budgeting", "forecasting", "risk management"],
      commonSkills: ["Excel", "Financial Modeling", "GAAP", "IFRS", "Bloomberg", "SQL"]
    },
    healthcare: {
      keywords: ["patient care", "medical records", "HIPAA", "clinical", "diagnosis"],
      commonSkills: ["EMR Systems", "Medical Terminology", "Patient Management", "HIPAA Compliance"]
    },
    marketing: {
      keywords: ["digital marketing", "SEO", "social media", "content creation", "analytics"],
      commonSkills: ["Google Analytics", "SEO", "Content Marketing", "Social Media Management", "Email Marketing"]
    }
  };
  const normalized = industry.toLowerCase();
  return industryKeywords[normalized] || {
    keywords: [],
    commonSkills: []
  };
}
function parseJobDescription(jobDescription) {
  const keywords = extractKeywords(jobDescription);
  const lowerDesc = jobDescription.toLowerCase();
  const experienceMatch = jobDescription.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i);
  const experience = experienceMatch ? `${experienceMatch[1]} years` : "Not specified";
  const educationMatch = lowerDesc.match(/(bachelor|master|phd|degree|diploma|certification)/i);
  const education = educationMatch ? educationMatch[0] : "Not specified";
  const responsibilities = jobDescription.split("\n").filter((line) => /^[\-\*\d+\.]/.test(line.trim())).map((line) => line.replace(/^[\-\*\d+\.]\s*/, "").trim()).filter((line) => line.length > 10).slice(0, 10);
  return {
    requiredSkills: keywords.keywords.slice(0, 10),
    preferredSkills: keywords.keywords.slice(10, 20),
    experience,
    education,
    responsibilities
  };
}

// src/mcp/tools/style.tool.ts
var StyleTool = {
  name: "style_guide",
  description: "Access style guides, grammar rules, and tone dictionaries for text editing",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_grammar_rules", "get_style_guide", "get_tone_guide", "check_consistency"],
        description: "Action to perform"
      },
      style: {
        type: "string",
        enum: ["academic", "business", "creative", "journalistic", "technical"],
        description: "Writing style"
      },
      tone: {
        type: "string",
        enum: ["formal", "casual", "professional", "friendly", "authoritative"],
        description: "Desired tone"
      },
      text: { type: "string", description: "Text to analyze" }
    },
    required: ["action"]
  },
  execute: async (params) => {
    const { action, style, tone, text } = params;
    switch (action) {
      case "get_grammar_rules":
        return getGrammarRules();
      case "get_style_guide":
        if (!style) throw new Error("Style is required");
        return getStyleGuide(style);
      case "get_tone_guide":
        if (!tone) throw new Error("Tone is required");
        return getToneGuide(tone);
      case "check_consistency":
        if (!text) throw new Error("Text is required");
        return checkConsistency(text, style, tone);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};
function getGrammarRules() {
  return {
    rules: [
      {
        rule: "Subject-verb agreement",
        example: "The team are working",
        correction: "The team is working"
      },
      {
        rule: "Avoid passive voice when possible",
        example: "The report was written by John",
        correction: "John wrote the report"
      },
      {
        rule: "Use active voice",
        example: "Mistakes were made",
        correction: "I made mistakes"
      },
      {
        rule: "Avoid run-on sentences",
        example: "I went to the store I bought milk",
        correction: "I went to the store and bought milk"
      },
      {
        rule: "Proper comma usage",
        example: "However I disagree",
        correction: "However, I disagree"
      }
    ]
  };
}
function getStyleGuide(style) {
  const guides = {
    academic: {
      guidelines: [
        "Use formal language and third person",
        "Cite sources appropriately",
        "Avoid contractions",
        "Use precise terminology"
      ],
      do: ['Use "research indicates"', "Cite sources", "Use formal structure"],
      dont: ['Use "I think"', "Use contractions", "Use casual language"],
      examples: [
        { before: "I think this is important", after: "This is significant because" },
        { before: "can't", after: "cannot" }
      ]
    },
    business: {
      guidelines: [
        "Be concise and clear",
        "Use professional tone",
        "Focus on action items",
        "Use bullet points for lists"
      ],
      do: ["Use action verbs", "Be direct", "Highlight key points"],
      dont: ["Be verbose", "Use jargon unnecessarily", "Be vague"],
      examples: [
        { before: "We might want to consider", after: "We recommend" },
        { before: "a lot of", after: "many" }
      ]
    },
    creative: {
      guidelines: [
        "Use vivid descriptions",
        "Show, don't tell",
        "Use varied sentence structure",
        "Engage the senses"
      ],
      do: ["Use metaphors", "Create imagery", "Vary pacing"],
      dont: ["Overuse adjectives", "Be clich\xE9", "Tell instead of show"],
      examples: [
        { before: "It was very hot", after: "The sun beat down mercilessly" },
        { before: "She was sad", after: "Tears traced paths down her cheeks" }
      ]
    },
    journalistic: {
      guidelines: [
        "Lead with the most important information",
        "Answer who, what, when, where, why",
        "Use active voice",
        "Keep paragraphs short"
      ],
      do: ["Lead with facts", "Use quotes", "Be objective"],
      dont: ["Use first person", "Include opinions", "Be biased"],
      examples: [
        { before: "I believe this is important", after: "Experts say this is important" }
      ]
    },
    technical: {
      guidelines: [
        "Define technical terms",
        "Use precise language",
        "Include code examples when relevant",
        "Structure information logically"
      ],
      do: ["Define acronyms", "Use diagrams", "Provide examples"],
      dont: ["Assume knowledge", "Use vague terms", "Skip steps"],
      examples: [
        { before: "The function does stuff", after: "The function processes user input and validates it" }
      ]
    }
  };
  return guides[style.toLowerCase()] || guides.business;
}
function getToneGuide(tone) {
  const tones = {
    formal: {
      characteristics: ["Respectful", "Professional", "Structured", "Polite"],
      wordChoices: [
        { avoid: "can't", use: "cannot" },
        { avoid: "won't", use: "will not" },
        { avoid: "gonna", use: "going to" },
        { avoid: "yeah", use: "yes" }
      ],
      examples: [
        { before: "Hey, can you help?", after: "Could you please assist?" },
        { before: "Thanks!", after: "Thank you" }
      ]
    },
    casual: {
      characteristics: ["Relaxed", "Conversational", "Friendly", "Approachable"],
      wordChoices: [
        { avoid: "utilize", use: "use" },
        { avoid: "commence", use: "start" },
        { avoid: "facilitate", use: "help" }
      ],
      examples: [
        { before: "I would like to", after: "I'd like to" },
        { before: "It is important to note", after: "Note that" }
      ]
    },
    professional: {
      characteristics: ["Confident", "Competent", "Clear", "Respectful"],
      wordChoices: [
        { avoid: "I think", use: "I believe" },
        { avoid: "maybe", use: "possibly" },
        { avoid: "stuff", use: "materials" }
      ],
      examples: [
        { before: "I think we should", after: "I recommend we" }
      ]
    },
    friendly: {
      characteristics: ["Warm", "Approachable", "Positive", "Engaging"],
      wordChoices: [
        { avoid: "issue", use: "challenge" },
        { avoid: "problem", use: "situation" },
        { avoid: "cannot", use: "can't" }
      ],
      examples: [
        { before: "You must", after: "You might want to" },
        { before: "This is wrong", after: "Let's try a different approach" }
      ]
    },
    authoritative: {
      characteristics: ["Confident", "Direct", "Knowledgeable", "Decisive"],
      wordChoices: [
        { avoid: "maybe", use: "will" },
        { avoid: "I think", use: "Research shows" },
        { avoid: "possibly", use: "definitely" }
      ],
      examples: [
        { before: "You might want to", after: "You should" },
        { before: "It could be", after: "It is" }
      ]
    }
  };
  return tones[tone.toLowerCase()] || tones.professional;
}
function checkConsistency(text, style, tone) {
  const issues = [];
  const lowerText = text.toLowerCase();
  if (tone === "formal") {
    const contractions = text.match(/\b(can't|won't|don't|isn't|aren't|haven't|hasn't|wouldn't|shouldn't)\b/gi);
    if (contractions) {
      contractions.forEach((contraction) => {
        issues.push({
          type: "tone_inconsistency",
          text: contraction,
          suggestion: contraction.replace("'", "") + " (avoid contractions in formal tone)"
        });
      });
    }
  }
  const passivePattern = /\b(is|are|was|were|be|been)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passivePattern);
  if (passiveMatches && passiveMatches.length > text.split(".").length * 0.3) {
    issues.push({
      type: "style_issue",
      text: "Excessive passive voice",
      suggestion: "Consider using active voice for clarity"
    });
  }
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const longSentences = sentences.filter((s) => s.split(" ").length > 30);
  if (longSentences.length > 0) {
    issues.push({
      type: "readability",
      text: `${longSentences.length} very long sentences`,
      suggestion: "Consider breaking into shorter sentences for better readability"
    });
  }
  const consistencyScore = Math.max(0, 100 - issues.length * 15);
  return { issues, consistencyScore };
}

// src/mcp/tools/design.tool.ts
var DesignTool = {
  name: "design_resources",
  description: "Access design templates, cultural patterns, and language resources for invitations",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_cultural_patterns", "get_language_resources", "get_design_templates", "get_color_scheme"],
        description: "Action to perform"
      },
      religion: {
        type: "string",
        enum: ["hindu", "muslim", "christian", "sikh"],
        description: "Religion for cultural patterns"
      },
      language: {
        type: "string",
        enum: ["english", "hindi", "urdu"],
        description: "Language for resources"
      },
      theme: {
        type: "string",
        enum: ["wedding", "mundan", "festival", "religious", "sokh_sabha"],
        description: "Event theme"
      }
    },
    required: ["action"]
  },
  execute: async (params) => {
    const { action, religion, language, theme } = params;
    switch (action) {
      case "get_cultural_patterns":
        if (!religion) throw new Error("Religion is required");
        return getCulturalPatterns(religion);
      case "get_language_resources":
        if (!language) throw new Error("Language is required");
        return getLanguageResources(language);
      case "get_design_templates":
        if (!theme) throw new Error("Theme is required");
        return getDesignTemplates(theme);
      case "get_color_scheme":
        if (!religion || !theme) throw new Error("Religion and theme are required");
        return getColorScheme(religion, theme);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};
function getCulturalPatterns(religion) {
  const patterns = {
    hindu: {
      motifs: ["mandap", "marigold flowers", "lotus", "peacock feathers", "diya", "om symbol"],
      symbols: ["swastika", "kalash", "mangalsutra", "bindi patterns"],
      designElements: ["floral borders", "traditional patterns", "gold accents", "red and gold color scheme"],
      layout: "Vertical layout with central text, decorative borders, traditional typography"
    },
    muslim: {
      motifs: ["geometric patterns", "crescent moon", "star", "arabesque", "calligraphy"],
      symbols: ["crescent", "star and crescent", "geometric tiles", "islamic art patterns"],
      designElements: ["intricate borders", "geometric designs", "elegant typography", "gold and green accents"],
      layout: "Elegant vertical or horizontal layout with geometric borders and calligraphic text"
    },
    christian: {
      motifs: ["cross", "dove", "roses", "ivy", "rings"],
      symbols: ["cross", "wedding rings", "dove", "roses"],
      designElements: ["soft floral patterns", "elegant borders", "classic typography", "pastel colors"],
      layout: "Classic vertical layout with floral borders and elegant serif fonts"
    },
    sikh: {
      motifs: ["khanda", "ik onkar", "floral patterns", "traditional designs"],
      symbols: ["khanda", "ik onkar", "sikh symbols"],
      designElements: ["traditional patterns", "gold accents", "floral borders", "bold typography"],
      layout: "Traditional layout with Sikh symbols and Punjabi/English text"
    }
  };
  return patterns[religion.toLowerCase()] || patterns.hindu;
}
function getLanguageResources(language) {
  const resources = {
    english: {
      commonPhrases: {
        "wedding": "You are cordially invited",
        "date": "Date",
        "time": "Time",
        "venue": "Venue",
        "rsvp": "RSVP"
      },
      formattingRules: [
        "Use formal language",
        "Capitalize important words",
        "Use proper punctuation"
      ],
      typography: "Elegant serif or sans-serif fonts",
      examples: [
        "You are cordially invited to the wedding of...",
        "Date: [Date]",
        "Time: [Time]",
        "Venue: [Venue]"
      ]
    },
    hindi: {
      commonPhrases: {
        "wedding": "\u0906\u092A \u0938\u093E\u0926\u0930 \u0906\u092E\u0902\u0924\u094D\u0930\u093F\u0924 \u0939\u0948\u0902",
        "date": "\u0924\u093E\u0930\u0940\u0916",
        "time": "\u0938\u092E\u092F",
        "venue": "\u0938\u094D\u0925\u093E\u0928",
        "rsvp": "\u0909\u092A\u0938\u094D\u0925\u093F\u0924\u093F \u0915\u0940 \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902"
      },
      formattingRules: [
        "Use Devanagari script",
        "Proper spacing between words",
        "Traditional formatting"
      ],
      typography: "Devanagari fonts (Mangal, Noto Sans Devanagari)",
      examples: [
        "\u0906\u092A \u0938\u093E\u0926\u0930 \u0906\u092E\u0902\u0924\u094D\u0930\u093F\u0924 \u0939\u0948\u0902...",
        "\u0924\u093E\u0930\u0940\u0916: [\u0924\u093E\u0930\u0940\u0916]",
        "\u0938\u092E\u092F: [\u0938\u092E\u092F]",
        "\u0938\u094D\u0925\u093E\u0928: [\u0938\u094D\u0925\u093E\u0928]"
      ]
    },
    urdu: {
      commonPhrases: {
        "wedding": "\u0622\u067E \u06A9\u0648 \u062F\u0639\u0648\u062A \u062F\u06CC \u062C\u0627\u062A\u06CC \u06C1\u06D2",
        "date": "\u062A\u0627\u0631\u06CC\u062E",
        "time": "\u0648\u0642\u062A",
        "venue": "\u0645\u0642\u0627\u0645",
        "rsvp": "\u062D\u0627\u0636\u0631\u06CC \u06A9\u06CC \u062A\u0635\u062F\u06CC\u0642"
      },
      formattingRules: [
        "Use Nastaliq script",
        "Right-to-left text direction",
        "Elegant calligraphy style"
      ],
      typography: "Nastaliq fonts (Jameel Noori Nastaleeq, Noto Nastaliq Urdu)",
      examples: [
        "\u0622\u067E \u06A9\u0648 \u062F\u0639\u0648\u062A \u062F\u06CC \u062C\u0627\u062A\u06CC \u06C1\u06D2...",
        "\u062A\u0627\u0631\u06CC\u062E: [\u062A\u0627\u0631\u06CC\u062E]",
        "\u0648\u0642\u062A: [\u0648\u0642\u062A]",
        "\u0645\u0642\u0627\u0645: [\u0645\u0642\u0627\u0645]"
      ]
    }
  };
  return resources[language.toLowerCase()] || resources.english;
}
function getDesignTemplates(theme) {
  const templates = {
    wedding: {
      layout: "Vertical card format, portrait orientation",
      elements: ["Names prominently displayed", "Date and time", "Venue details", "Decorative borders"],
      style: "Elegant and formal",
      recommendations: ["Use gold or metallic accents", "Include floral patterns", "Professional typography"]
    },
    mundan: {
      layout: "Vertical card, child-friendly design",
      elements: ["Child's name", "Date and time", "Venue", "Traditional elements"],
      style: "Traditional and celebratory",
      recommendations: ["Bright colors", "Traditional motifs", "Simple layout"]
    },
    festival: {
      layout: "Festive horizontal or vertical",
      elements: ["Festival name", "Date", "Celebration details", "Decorative elements"],
      style: "Colorful and vibrant",
      recommendations: ["Use festival-specific colors", "Include traditional symbols", "Bold typography"]
    },
    religious: {
      layout: "Formal vertical layout",
      elements: ["Event name", "Date and time", "Venue", "Religious symbols"],
      style: "Reverent and traditional",
      recommendations: ["Respectful design", "Religious motifs", "Formal typography"]
    },
    sokh_sabha: {
      layout: "Informative horizontal or vertical",
      elements: ["Speaker name", "Topic", "Date and time", "Venue"],
      style: "Professional and informative",
      recommendations: ["Clear typography", "Minimal design", "Focus on information"]
    }
  };
  return templates[theme.toLowerCase()] || templates.wedding;
}
function getColorScheme(religion, theme) {
  const schemes = {
    hindu: {
      wedding: {
        primary: ["#FFD700", "#FF0000"],
        // Gold and Red
        secondary: ["#FFA500", "#FFE4B5"],
        accent: ["#000000", "#FFFFFF"],
        description: "Traditional red and gold for Hindu weddings"
      },
      mundan: {
        primary: ["#FFD700", "#FF6B6B"],
        secondary: ["#FFE66D", "#FF8C94"],
        accent: ["#4ECDC4"],
        description: "Bright and celebratory colors"
      }
    },
    muslim: {
      wedding: {
        primary: ["#228B22", "#FFD700"],
        // Green and Gold
        secondary: ["#32CD32", "#FFE4B5"],
        accent: ["#000000", "#FFFFFF"],
        description: "Elegant green and gold for Islamic weddings"
      }
    },
    christian: {
      wedding: {
        primary: ["#F5F5DC", "#FFB6C1"],
        // Beige and Pink
        secondary: ["#FFF8DC", "#FFE4E1"],
        accent: ["#8B4513", "#FFFFFF"],
        description: "Soft pastels for Christian weddings"
      }
    },
    sikh: {
      wedding: {
        primary: ["#FFD700", "#FF6B00"],
        // Gold and Orange
        secondary: ["#FFE4B5", "#FFA500"],
        accent: ["#000000", "#FFFFFF"],
        description: "Vibrant gold and orange for Sikh weddings"
      }
    }
  };
  const religionSchemes = schemes[religion.toLowerCase()] || schemes.hindu;
  return religionSchemes[theme.toLowerCase()] || religionSchemes.wedding || {
    primary: ["#000000", "#FFFFFF"],
    secondary: ["#808080"],
    accent: ["#FFD700"],
    description: "Classic black and white with gold accents"
  };
}

// src/mcp/resources/index.ts
var UserResource = {
  name: "user_context",
  description: "Get current user information and preferences",
  get: async (params) => {
    const user = db.query("SELECT * FROM users LIMIT 1");
    return user.length > 0 ? user[0] : null;
  }
};
var ResumeTemplatesResource = {
  name: "resume_templates",
  description: "Get ATS-friendly resume templates and formats",
  get: async (params) => {
    return {
      templates: [
        {
          name: "ATS-Optimized",
          structure: ["Header", "Summary", "Experience", "Education", "Skills"],
          format: "Chronological"
        },
        {
          name: "Functional",
          structure: ["Header", "Summary", "Skills", "Experience", "Education"],
          format: "Skills-based"
        }
      ],
      atsTips: [
        "Use standard section headings",
        "Include keywords from job description",
        "Use simple formatting",
        "Save as PDF"
      ]
    };
  }
};
var TripHistoryResource = {
  name: "trip_history",
  description: "Get historical trip data for context",
  get: async (params) => {
    return {
      popularRoutes: [
        { from: "Mumbai", to: "Goa", frequency: 10 },
        { from: "Delhi", to: "Manali", frequency: 8 }
      ],
      averageCosts: {
        train: 500,
        flight: 3e3,
        hotel: 2e3,
        food: 500
      }
    };
  }
};
var allResources = [
  UserResource,
  ResumeTemplatesResource,
  TripHistoryResource
];

// src/mcp/mcpServer.ts
var MCPServer = class {
  constructor() {
    this.tools = /* @__PURE__ */ new Map();
    this.resources = /* @__PURE__ */ new Map();
    this.registerTools();
    this.registerResources();
  }
  registerTools() {
    this.tools.set("geocoding", GeocodingTool);
    this.tools.set("ats_analyzer", ATSTool);
    this.tools.set("style_guide", StyleTool);
    this.tools.set("design_resources", DesignTool);
  }
  registerResources() {
    allResources.forEach((resource) => {
      this.resources.set(resource.name, resource);
    });
  }
  /**
   * Get context for a specific app
   */
  getContext(appName) {
    const appTools = {
      "trip-planner": [GeocodingTool],
      "resume-maker": [ATSTool],
      "text-editor": [StyleTool],
      "invitation-maker": [DesignTool]
    };
    return {
      tools: appTools[appName] || [],
      resources: allResources
    };
  }
  /**
   * Execute a tool
   */
  async executeTool(toolName, params) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    return tool.execute(params);
  }
  /**
   * Get a resource
   */
  async getResource(resourceName, params) {
    const resource = this.resources.get(resourceName);
    if (!resource) {
      throw new Error(`Resource not found: ${resourceName}`);
    }
    return resource.get(params);
  }
  /**
   * List all available tools
   */
  listTools() {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description
    }));
  }
  /**
   * List all available resources
   */
  listResources() {
    return Array.from(this.resources.values()).map((resource) => ({
      name: resource.name,
      description: resource.description
    }));
  }
};
var mcpServer = new MCPServer();

// src/orchestration/agentOrchestrator.ts
var AgentOrchestrator = class {
  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow, initialContext) {
    const startTime = Date.now();
    const results = {
      initial: initialContext || {}
    };
    const errors = {};
    const executedSteps = /* @__PURE__ */ new Set();
    const mcpContext = mcpServer.getContext(workflow.id.split("-")[0]);
    try {
      const stepsToExecute = [...workflow.steps];
      while (stepsToExecute.length > 0) {
        const executableSteps = stepsToExecute.filter((step) => {
          if (!step.dependsOn || step.dependsOn.length === 0) {
            return true;
          }
          return step.dependsOn.every((depId) => executedSteps.has(depId));
        });
        if (executableSteps.length === 0) {
          throw new Error("Circular dependency or missing dependencies in workflow");
        }
        const stepPromises = executableSteps.map(
          (step) => this.executeStep(step, results, mcpContext, workflow.onError)
        );
        const stepResults = await Promise.allSettled(stepPromises);
        stepResults.forEach((result, index) => {
          const step = executableSteps[index];
          if (result.status === "fulfilled") {
            results[step.id] = result.value;
            executedSteps.add(step.id);
            stepsToExecute.splice(stepsToExecute.indexOf(step), 1);
          } else {
            const error = result.reason;
            errors[step.id] = {
              message: error?.message || String(error),
              stack: error?.stack,
              name: error?.name || "Error"
            };
            if (workflow.onError === "stop") {
              throw result.reason;
            }
            executedSteps.add(step.id);
            stepsToExecute.splice(stepsToExecute.indexOf(step), 1);
          }
        });
      }
      const duration = Date.now() - startTime;
      return {
        workflowId: workflow.id,
        success: Object.keys(errors).length === 0,
        results,
        errors: Object.keys(errors).length > 0 ? errors : void 0,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        workflowId: workflow.id,
        success: false,
        results,
        errors: {
          ...errors,
          workflow: {
            message: error?.message || String(error),
            stack: error?.stack,
            name: error?.name || "Error"
          }
        },
        duration
      };
    }
  }
  /**
   * Execute a single workflow step
   */
  async executeStep(step, previousResults, mcpContext, onError) {
    const agent = agentRegistry.get(step.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${step.agentId}`);
    }
    const input = typeof step.input === "function" ? step.input(previousResults) : this.resolveInput(step.input, previousResults);
    const timeout = step.timeout || 3e4;
    try {
      const result = await Promise.race([
        agent.execute(input, mcpContext),
        new Promise(
          (_, reject) => setTimeout(() => reject(new Error(`Step timeout: ${step.id}`)), timeout)
        )
      ]);
      return result;
    } catch (error) {
      if (onError === "retry") {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        return agent.execute(input, mcpContext);
      }
      throw error;
    }
  }
  /**
   * Resolve input references (e.g., "$stepId.field")
   */
  resolveInput(input, results) {
    if (typeof input === "string" && input.startsWith("$")) {
      const path4 = input.substring(1).split(".");
      let value = results[path4[0]];
      for (let i = 1; i < path4.length && value !== void 0; i++) {
        value = value[path4[i]];
      }
      return value;
    }
    if (typeof input === "object" && input !== null) {
      const resolved = Array.isArray(input) ? [] : {};
      for (const key in input) {
        resolved[key] = this.resolveInput(input[key], results);
      }
      return resolved;
    }
    return input;
  }
  /**
   * Call a single agent directly
   */
  async callAgent(agentId, input, context) {
    const agent = agentRegistry.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    const mcpContext = context || mcpServer.getContext(agentId.split("-")[0]);
    return agent.execute(input, mcpContext);
  }
};
var agentOrchestrator = new AgentOrchestrator();

// src/orchestration/workflows.ts
var tripPlannerWorkflow = {
  id: "trip-planner-workflow",
  name: "Trip Planning Workflow",
  steps: [
    {
      id: "route",
      agentId: "trip-route-agent",
      input: (results) => {
        const inputData = results.initial?.data || results.initial || {};
        return {
          places: inputData.places,
          startLocation: inputData.startLocation,
          endLocation: inputData.endLocation,
          tripType: inputData.tripType,
          startDate: inputData.startDate,
          endDate: inputData.endDate,
          peopleCount: inputData.peopleCount
        };
      },
      timeout: 6e4
    },
    {
      id: "cost",
      agentId: "trip-cost-agent",
      input: (results) => results.route,
      dependsOn: ["route"],
      timeout: 3e4
    },
    {
      id: "weather",
      agentId: "trip-weather-agent",
      input: (results) => results.cost,
      dependsOn: ["cost"],
      timeout: 3e4
    },
    {
      id: "localization",
      agentId: "trip-localization-agent",
      input: (results) => results.weather,
      dependsOn: ["weather"],
      timeout: 3e4
    }
  ],
  onError: "continue"
};
var resumeMakerWorkflow = {
  id: "resume-maker-workflow",
  name: "Resume Generation Workflow",
  steps: [
    {
      id: "draft",
      agentId: "resume-main-agent",
      input: (results) => ({ anonymisedData: results.initial?.anonymisedData || results.initial }),
      timeout: 6e4
    },
    {
      id: "grammar",
      agentId: "resume-grammar-agent",
      input: (results) => {
        if (!results.draft) {
          throw new Error("Draft step failed or returned no result");
        }
        return { resume: results.draft };
      },
      dependsOn: ["draft"],
      timeout: 45e3
    },
    {
      id: "ats",
      agentId: "resume-ats-scoring-agent",
      input: (results) => {
        const resume = results.grammar || results.draft;
        if (!resume) {
          throw new Error("No resume data available from previous steps");
        }
        return {
          resume,
          jobDescription: results.initial?.jobDescription,
          industry: results.initial?.industry
        };
      },
      dependsOn: ["grammar"],
      timeout: 45e3
    },
    {
      id: "format",
      agentId: "resume-formatting-agent",
      input: (results) => {
        const resume = results.ats || results.grammar || results.draft;
        if (!resume) {
          throw new Error("No resume data available from previous steps");
        }
        return resume;
      },
      dependsOn: ["ats"],
      timeout: 3e4
    }
  ],
  onError: "continue"
};
var textEditorWorkflow = {
  id: "text-editor-workflow",
  name: "Text Editing Workflow",
  steps: [
    {
      id: "edit",
      agentId: "text-editor-main-agent",
      input: (results) => results.initial || {},
      timeout: 3e4
    },
    {
      id: "grammar",
      agentId: "text-grammar-agent",
      input: (results) => ({
        text: results.edit,
        language: results.initial?.language,
        tone: results.initial?.tone
      }),
      dependsOn: ["edit"],
      timeout: 3e4
    },
    {
      id: "style",
      agentId: "text-style-agent",
      input: (results) => ({
        text: results.grammar,
        style: results.initial?.style || "business"
      }),
      dependsOn: ["grammar"],
      timeout: 3e4
    },
    {
      id: "tone",
      agentId: "text-tone-agent",
      input: (results) => ({
        text: results.style,
        tone: results.initial?.tone || "professional"
      }),
      dependsOn: ["style"],
      timeout: 3e4
    }
  ],
  onError: "continue"
};
var invitationMakerWorkflow = {
  id: "invitation-maker-workflow",
  name: "Invitation Generation Workflow",
  steps: [
    {
      id: "design",
      agentId: "invitation-design-agent",
      input: (results) => results.initial || {},
      timeout: 6e4
    },
    {
      id: "localization",
      agentId: "invitation-localization-agent",
      input: (results) => ({
        data: results.initial?.data,
        image: results.design?.image,
        theme: results.initial?.theme
      }),
      dependsOn: ["design"],
      timeout: 3e4
    },
    {
      id: "quality",
      agentId: "invitation-quality-agent",
      input: (results) => ({
        data: results.localization?.data || results.initial?.data,
        image: results.design?.image,
        theme: results.initial?.theme
      }),
      dependsOn: ["localization"],
      timeout: 3e4
    }
  ],
  onError: "continue"
};

// src/controllers/tripControler.ts
async function TripController(req, res) {
  try {
    const { data } = req.body;
    if (!Array.isArray(data.places) || data.places.length === 0) {
      return res.status(400).json({ error: "At least one place must be selected" });
    }
    if (!data.startDate || !data.endDate) {
      return res.status(400).json({ error: "Start and end dates are required" });
    }
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    if (end <= start) {
      return res.status(400).json({ error: "End date must be after start date" });
    }
    const apiKey = await getApiKey();
    if (!apiKey) {
      return res.status(401).json({ error: "API Key not found. Please activate first." });
    }
    LoggerModel.log(`Starting trip planning workflow: ${data.places.join(", ")}`);
    const result = await agentOrchestrator.executeWorkflow(tripPlannerWorkflow, { data });
    if (!result.success) {
      console.error("Workflow errors:", result.errors);
      return res.status(500).json({
        error: "Trip planning workflow failed",
        details: result.errors
      });
    }
    LoggerModel.log(`Trip planning completed: ${data.places.join(", ")}`);
    return res.status(200).json({
      success: true,
      data: {
        ...result.results.localization,
        ...result.results.weather,
        ...result.results.cost,
        ...result.results.route
      }
    });
  } catch (error) {
    console.error("Trip planning failed:", error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error during trip generation" });
    }
  }
}

// src/routes/tripRoutes.ts
var router2 = (0, import_express2.Router)();
router2.post("/", TripController);
var tripRoutes_default = router2;

// src/routes/textEditorRoutes.ts
var import_express3 = require("express");

// src/controllers/textEditorController.ts
async function TextEditorController(req, res) {
  try {
    const { data } = req.body;
    if (!data?.intent || !data?.text) {
      return res.status(400).json({ success: false, error: "intent and text required" });
    }
    const { intent, text, language, tone, style } = data;
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key missing");
    }
    const complexIntents = ["rewrite", "continue"];
    const useWorkflow = complexIntents.includes(intent) && (style || tone);
    if (useWorkflow) {
      LoggerModel.log(`Using workflow for text editing: ${intent}`);
      const result = await agentOrchestrator.executeWorkflow(textEditorWorkflow, {
        intent,
        text,
        language,
        tone,
        style
      });
      if (!result.success) {
        throw new Error(`Workflow failed: ${JSON.stringify(result.errors)}`);
      }
      const finalResult = result.results.tone || result.results.style || result.results.grammar || result.results.edit;
      LoggerModel.log(`Text editing workflow completed: ${intent}`);
      return res.status(200).json({
        success: true,
        data: finalResult
      });
    } else {
      LoggerModel.log(`Using direct agent for text editing: ${intent}`);
      const result = await agentOrchestrator.callAgent("text-editor-main-agent", {
        intent,
        text,
        language,
        tone
      });
      return res.status(200).json({
        success: true,
        data: result
      });
    }
  } catch (err) {
    console.error("TextEditorController error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

// src/routes/textEditorRoutes.ts
var router3 = (0, import_express3.Router)();
router3.post("/", TextEditorController);
var textEditorRoutes_default = router3;

// src/routes/invitationRoutes.ts
var import_express4 = require("express");

// src/controllers/weddingInvitationController.ts
async function WeddingInvitationController(req, res) {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Request data is required" });
    }
    const {
      groomName,
      brideName,
      date,
      time,
      venue,
      religion,
      language
    } = data;
    if (!groomName || !brideName) {
      return res.status(400).json({ error: "Bride and Groom names are required" });
    }
    if (!date || !time || !venue) {
      return res.status(400).json({ error: "Date, time, and venue are required" });
    }
    const apiKey = await getApiKey();
    if (!apiKey) {
      return res.status(401).json({
        error: "Gemini API key not found. Please activate first."
      });
    }
    LoggerModel.log(`Starting invitation generation workflow: ${groomName} & ${brideName}`);
    const invitationData = {
      theme: "wedding",
      groomName,
      brideName,
      date,
      time,
      venue,
      religion,
      language,
      familyDetails: data.familyDetails,
      rsvpContact: data.rsvpContact
    };
    const result = await agentOrchestrator.executeWorkflow(invitationMakerWorkflow, {
      data: invitationData,
      theme: "wedding"
    });
    if (!result.success) {
      console.error("Workflow errors:", result.errors);
      return res.status(500).json({
        error: "Invitation generation workflow failed",
        details: result.errors
      });
    }
    const finalResult = {
      ...result.results.design,
      ...result.results.localization,
      ...result.results.quality
    };
    if (!finalResult?.image?.base64) {
      return res.status(502).json({
        error: "Gemini did not return an image"
      });
    }
    LoggerModel.log(`Invitation generation completed: ${groomName} & ${brideName}`);
    return res.status(200).json({
      success: true,
      image: {
        mimeType: finalResult.image.mimeType,
        base64: finalResult.image.base64
      },
      ...finalResult.validation && { validation: finalResult.validation },
      ...finalResult.localization && { localization: finalResult.localization }
    });
  } catch (error) {
    console.error("Wedding invitation generation failed:", error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Internal Server Error during invitation generation"
      });
    }
  }
}

// src/routes/invitationRoutes.ts
var router4 = (0, import_express4.Router)();
router4.post(
  "/wedding",
  WeddingInvitationController
);
var invitationRoutes_default = router4;

// src/routes/user.routes.ts
var import_express5 = require("express");

// src/controllers/userController.ts
var UserController = {
  getStatus: (req, res) => {
    try {
      const user = UserModel.getUser();
      return res.json({
        agreed: user ? !!user.personalAgreement : false,
        name: user?.name,
        geminiVersion: user?.geminiVersion || "2"
      });
    } catch (error) {
      console.error("[USER][GET_STATUS]", error);
      return res.status(500).json({ error: "Failed to get user status" });
    }
  },
  updateGeminiVersion: (req, res) => {
    try {
      const { version } = req.body;
      if (version !== "2" && version !== "3") {
        return res.status(400).json({ error: 'Version must be "2" or "3"' });
      }
      UserModel.updateGeminiVersion(version);
      return res.json({ success: true, geminiVersion: version });
    } catch (error) {
      console.error("[USER][UPDATE_GEMINI_VERSION]", error);
      return res.status(500).json({ error: "Failed to update Gemini version" });
    }
  },
  agree: (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Name is required" });
      }
      if (UserModel.hasAgreed()) {
        return res.status(409).json({ error: "Agreement already exists" });
      }
      UserModel.createUser(name.trim());
      return res.status(201).json({
        success: true,
        message: "Agreement recorded successfully"
      });
    } catch (error) {
      console.error("[USER][AGREE]", error);
      return res.status(500).json({ error: "Failed to record agreement" });
    }
  },
  getLogs: (req, res) => {
    try {
      const logs = LoggerModel.getLogs();
      return res.json(logs);
    } catch (error) {
      console.error("[USER][GET_LOGS]", error);
      return res.status(500).json({ error: "Failed to fetch logs" });
    }
  },
  deleteData: (req, res) => {
    try {
      UserModel.deleteData();
      return res.json({ success: true, message: "All data except logs deleted" });
    } catch (error) {
      console.error("[USER][DELETE_DATA]", error);
      return res.status(500).json({ error: "Failed to delete data" });
    }
  }
};

// src/routes/user.routes.ts
var router5 = (0, import_express5.Router)();
router5.get("/status", UserController.getStatus);
router5.post("/agree", UserController.agree);
router5.get("/logs", UserController.getLogs);
router5.post("/delete-data", UserController.deleteData);
router5.post("/gemini-version", UserController.updateGeminiVersion);
var user_routes_default = router5;

// src/routes/resumeRoutes.ts
var import_express6 = require("express");

// src/services/ResumeService.ts
var ResumeService = {
  async getResume() {
    const results = db.query("SELECT * FROM resume LIMIT 1");
    return results.length > 0 ? results[0] : null;
  },
  async createOrUpdateResume(data) {
    const existing = await this.getResume();
    if (existing) {
      const sets = Object.keys(data).map((key) => `${key} = ?`).join(", ");
      const values = Object.values(data);
      db.execute(`UPDATE resume SET ${sets} WHERE id = ?`, [...values, existing.id]);
    } else {
      const columns = Object.keys(data).join(", ");
      const placeholders = Object.keys(data).map(() => "?").join(", ");
      const values = Object.values(data);
      db.execute(`INSERT INTO resume (${columns}) VALUES (${placeholders})`, values);
    }
  }
};

// src/services/AnonymisationService.ts
var AnonymisationService = {
  anonymise: (data) => {
    const originalPII = {
      name: data.name,
      contacts: [...data.contacts],
      links: [...data.links]
    };
    const anonymisedData = {
      ...data,
      name: "CANDIDATE_NAME",
      contacts: data.contacts.map((c, i) => ({
        key: c.key,
        value: `${c.key.toUpperCase().replace(/\s+/g, "_")}_PLACEHOLDER_${i + 1}`
      })),
      links: data.links.map((l, i) => ({
        key: l.key,
        value: `PROFILE_LINK_${i + 1}`
      }))
    };
    return { anonymisedData, originalPII };
  },
  reinsert: (anonymisedText, originalPII) => {
    let result = anonymisedText;
    result = result.replace(/CANDIDATE_NAME/g, originalPII.name);
    originalPII.contacts.forEach((c, i) => {
      const placeholder = `${c.key.toUpperCase().replace(/\s+/g, "_")}_PLACEHOLDER_${i + 1}`;
      const regex = new RegExp(placeholder, "g");
      result = result.replace(regex, c.value);
    });
    originalPII.links.forEach((l, i) => {
      const placeholder = `PROFILE_LINK_${i + 1}`;
      const regex = new RegExp(placeholder, "g");
      result = result.replace(regex, l.value);
    });
    return result;
  },
  reinsertIntoJson: (jsonObj, originalPII) => {
    let jsonString = JSON.stringify(jsonObj);
    const reinsertedString = AnonymisationService.reinsert(jsonString, originalPII);
    try {
      return JSON.parse(reinsertedString);
    } catch (e) {
      console.error("Failed to parse reinserted JSON", e);
      return jsonObj;
    }
  }
};

// src/services/AuditLogService.ts
var AuditLogService = {
  log: (event, dataType = "RESUME", piiExposed = false, status = "SUCCESS") => {
    const logData = {
      event,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      dataType,
      piiExposed,
      status
    };
    LoggerModel.log(JSON.stringify(logData));
  }
};

// src/services/GeminiTransformService.ts
init_jsonParser();
var GeminiTransformService = {
  async generateATSResume(anonymisedData) {
    const apiKey = await getApiKey();
    const workHistory = anonymisedData.work_history || [];
    const education = anonymisedData.education || [];
    const personalProjects = anonymisedData.personal_projects || [];
    const skills = anonymisedData.skills || [];
    const contacts = anonymisedData.contacts || [];
    const links = anonymisedData.links || [];
    const prompt = `
      You are a professional resume writer and ATS optimization expert.
      Using the provided anonymised candidate data, generate a COMPLETE and ATS-friendly resume.
      
      CRITICAL: You MUST preserve ALL data from the input. Do NOT omit any work history, education, projects, or skills.

      Input Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      1. PRESERVE ALL INPUT DATA:
         - Include EVERY work history entry from input (work_history array)
         - Include EVERY education entry from input (education array)
         - Include EVERY personal project from input (personal_projects array)
         - Include EVERY skill from input (skills array)
         - Include ALL contacts and links from input
      
      2. ENHANCEMENT (do not remove, only improve):
         - Rewrite descriptions professionally with action verbs
         - Convert work_history descriptions to bullet points in highlights array
         - Optimize for ATS keyword scanning
         - Maintain professional tone
         - Do NOT invent or hallucinate any new experience/education/projects
      
      3. STRUCTURE:
         - Convert work_history to work_experience format for processing
         - Convert personal_projects to projects format for processing
         - Generate a comprehensive, granular, and categorized list of *individual skills* under 'Frontend', 'Backend', and 'Tools'. Each skill entry MUST be a specific technology, methodology, or tool (e.g., 'React', 'TypeScript', 'Node.js', 'SQL', 'Git'), NOT a generic category (e.g., 'Frontend Development', 'Backend Development', 'Development Tools'). If input skills are generic, break them down into specific keywords. Do NOT use generic categories like 'Technical Skills'.

      Output format:
      IMPORTANT: Return ONLY valid JSON. Do NOT include markdown code blocks, backticks, or any formatting.
      Return STRICT JSON matching the input structure but with enhanced content:
      {
        "name": "CANDIDATE_NAME",
        "summary": "Professional summary based on ALL work history and skills provided",
        "contacts": [{"key": "string", "value": "string"}],
        "links": [{"key": "string", "value": "string"}],
        "skills": {
          "Frontend": ["skill1", "skill2"],
          "Backend": ["skill1", "skill2"],
          "Tools": ["tool1", "tool2"]
        },
        "work_experience": [
          {
            "title": "role from input",
            "organization": "company from input",
            "duration": "duration from input",
            "highlights": ["bullet point 1 from description", "bullet point 2 from description", ...]
          }
        ],
        "education": [
          {
            "degree": "degree from input",
            "institution": "institution from input",
            "details": "details from input (may include year)"
          }
        ],
        "projects": [
          {
            "name": "name/title from input",
            "description": "enhanced description from input"
          }
        ]
      }
      
      REMEMBER: Include ALL entries from input arrays. If input has 2 work_history entries, output must have 2 work_experience entries.
    `;
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const result = parseAIJSON(response.data);
    return {
      name: result.name || anonymisedData.name || "CANDIDATE_NAME",
      summary: result.summary || "",
      contacts: result.contacts && result.contacts.length > 0 ? result.contacts : contacts,
      links: result.links && result.links.length > 0 ? result.links : links,
      skills: result.skills && Object.keys(result.skills).length > 0 ? result.skills : skills,
      work_experience: result.work_experience && result.work_experience.length > 0 ? result.work_experience : workHistory.map((w) => ({
        title: w.role || w.title || "",
        organization: w.company || w.organization || "",
        duration: w.duration || "",
        highlights: w.description ? w.description.split("\n").filter((l) => l.trim()) : []
      })),
      education: result.education && result.education.length > 0 ? result.education : education.map((e) => ({
        degree: e.degree || "",
        institution: e.institution || "",
        details: e.details || (e.year ? `${e.year} - ${e.details}` : "")
      })),
      projects: result.projects && result.projects.length > 0 ? result.projects : personalProjects.map((p) => ({
        name: p.title || p.name || "",
        description: p.description || ""
      }))
    };
  },
  async generateCoverLetter(anonymisedData) {
    const apiKey = await getApiKey();
    const prompt = `
      You are a professional career coach.
      Using the anonymised resume data provided, generate a professional cover letter.

      Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      - Suitable for Internships, Entry-level roles, or Graduate positions.
      - Reflect ALL resume sections.
      - Confident but humble tone.
      - Remove or rewrite abusive, sensitive, or unsafe language into neutral professional phrasing.
      - Length: 3\u20134 concise paragraphs.

      Output format:
      Return a JSON object: {"content": "the cover letter text"} (no markdown, no code blocks).
      The content should be plain text with proper paragraph breaks.
    `;
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const textContent = extractTextContent(response.data, "content");
    return { content: textContent };
  },
  async generateSOP(anonymisedData) {
    const apiKey = await getApiKey();
    const prompt = `
      You are an academic writing expert specializing in university admissions.
      Using the anonymised candidate data provided, generate a formal Statement of Purpose (SOP).

      Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      - Suitable for Undergraduate, Postgraduate, or International programs.
      - Focus on Education, Academic interests, Personal projects, and Career goals.
      - Formal academic tone (avoid corporate language).
      - Do NOT invent research or credentials.
      - Neutralize sensitive or inappropriate content.
      - Length: 600\u2013800 words. Structured with logical paragraph flow.

      Output format:
      Return a JSON object: {"content": "the SOP text"} (no markdown, no code blocks).
      The content should be plain text with proper paragraph breaks.
    `;
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const textContent = extractTextContent(response.data, "content");
    return { content: textContent };
  }
};

// src/controllers/resumeController.ts
function transformResumeToUIFormat(data) {
  const name = data.header?.name || "";
  const contacts = data.header?.contacts || [];
  const links = data.header?.links || [];
  const summary = data.summary || "";
  const skills = [
    ...data.skills?.Frontend || [],
    ...data.skills?.Backend || [],
    ...data.skills?.Tools || []
  ];
  const work_experience = Array.isArray(data.experience) ? data.experience.map((exp) => ({
    title: exp.role || "",
    organization: exp.company || "",
    duration: exp.duration || "",
    highlights: Array.isArray(exp.description) ? exp.description : exp.description ? exp.description.split("\n") : []
  })) : [];
  const education = data.education || [];
  const projects = data.projects || [];
  const result = {
    name,
    summary,
    contacts,
    links,
    skills,
    work_experience,
    education,
    projects
  };
  return result;
}
var ResumeController = {
  async getResume(req, res) {
    try {
      const resume = await ResumeService.getResume();
      if (resume) {
        const formatted = {
          ...resume,
          contacts: JSON.parse(resume.contacts || "[]"),
          links: JSON.parse(resume.links || "[]"),
          work_history: JSON.parse(resume.work_history || "[]"),
          education: JSON.parse(resume.education || "[]"),
          personal_projects: JSON.parse(resume.personal_projects || "[]"),
          skills: JSON.parse(resume.skills || "[]")
        };
        res.json(formatted);
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async saveResume(req, res) {
    try {
      const data = req.body;
      const dbData = {
        name: data.name,
        contacts: JSON.stringify(data.contacts),
        links: JSON.stringify(data.links),
        work_history: JSON.stringify(data.work_history),
        education: JSON.stringify(data.education),
        personal_projects: JSON.stringify(data.personal_projects),
        skills: JSON.stringify(data.skills),
        cover_letter_para: data.cover_letter_para
      };
      await ResumeService.createOrUpdateResume(dbData);
      AuditLogService.log("Resume created / updated", "RESUME", false, "SUCCESS");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async generateATS(req, res) {
    try {
      const data = req.body;
      AuditLogService.log("Anonymisation started", "RESUME", false, "SUCCESS");
      const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);
      AuditLogService.log("Starting resume generation workflow", "RESUME_ATS", false, "SUCCESS");
      const result = await agentOrchestrator.executeWorkflow(resumeMakerWorkflow, {
        anonymisedData,
        jobDescription: data.jobDescription,
        industry: data.industry
      });
      let geminiResult = result.results.format;
      if (!geminiResult) {
        const lastResult = result.results.ats || result.results.grammar || result.results.draft;
        if (!lastResult) {
          const errorMessages = result.errors ? Object.entries(result.errors).map(([step, err]) => `${step}: ${err.message || String(err)}`).join(", ") : "Unknown error";
          throw new Error(`Workflow failed - no results: ${errorMessages}`);
        }
        geminiResult = lastResult;
      }
      AuditLogService.log("Resume workflow completed", "RESUME_ATS", false, "SUCCESS");
      const uiFormattedResult = transformResumeToUIFormat(geminiResult);
      const finalResult = AnonymisationService.reinsertIntoJson(uiFormattedResult, originalPII);
      AuditLogService.log("PII reinsertion completed", "RESUME_ATS", false, "SUCCESS");
      res.json(finalResult);
    } catch (error) {
      AuditLogService.log(`AI Error: ${error.message}`, "RESUME_ATS", false, "FAILED");
      res.status(500).json({ error: error.message });
    }
  },
  async generateCoverLetter(req, res) {
    try {
      const data = req.body;
      const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);
      AuditLogService.log("Generating Cover Letter", "COVER_LETTER", false, "SUCCESS");
      const geminiResult = await GeminiTransformService.generateCoverLetter(anonymisedData);
      const finalResult = AnonymisationService.reinsertIntoJson(geminiResult, originalPII);
      res.json(finalResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async generateSOP(req, res) {
    try {
      const data = req.body;
      const { anonymisedData, originalPII } = AnonymisationService.anonymise(data);
      AuditLogService.log("Generating SOP", "SOP", false, "SUCCESS");
      const geminiResult = await GeminiTransformService.generateSOP(anonymisedData);
      const finalResult = AnonymisationService.reinsertIntoJson(geminiResult, originalPII);
      res.json(finalResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// src/routes/resumeRoutes.ts
var router6 = (0, import_express6.Router)();
router6.get("/", ResumeController.getResume);
router6.post("/", ResumeController.saveResume);
router6.post("/generate-ats", ResumeController.generateATS);
router6.post("/generate-cover-letter", ResumeController.generateCoverLetter);
router6.post("/generate-sop", ResumeController.generateSOP);
var resumeRoutes_default = router6;

// src/routes/index.ts
var apiRouter = (0, import_express7.Router)();
apiRouter.use("/activate", activateRoutes_default);
apiRouter.use("/trip", tripRoutes_default);
apiRouter.use("/text-editor", textEditorRoutes_default);
apiRouter.use("/invitation", invitationRoutes_default);
apiRouter.use("/user", user_routes_default);
apiRouter.use("/resume", resumeRoutes_default);

// src/agents/trip.plan.agent.ts
function buildTripPlannerPrompt({
  places,
  startDate,
  endDate,
  peopleCount,
  startLocation,
  endLocation,
  tripType
}) {
  const placesList = places.map((p) => `- ${p}`).join("\\n");
  const resolvedEndPoint = tripType === "roundtrip" ? startLocation : endLocation;
  const resolvedTripType = tripType === "roundtrip" ? "Round Trip (Return to Start Location)" : "One Way (End at Destination)";
  return `You are an expert travel planner and route optimizer specializing in Indian geography.

TRIP PARAMETERS
Start Location: ${String(startLocation)}
End Location: ${String(endLocation)}
Trip Type: ${resolvedTripType}
Places to Visit (attraction or city or state):
${placesList}
Dates: ${String(startDate)} to ${String(endDate)}
Group Size: ${Number(peopleCount)} People

CORE PLANNING RULES
1. Route Logic:
- Start the journey from ${String(startLocation)}.
- If trip type is roundtrip, the final day must involve traveling back to ${String(startLocation)}.
- If trip type is oneway, the journey ends at ${String(endLocation)}.
2. Group attractions by city or state to avoid backtracking.
3. Transport assumptions:
- Use trains for distances under 700 km.
- Use flights for distances over 700 km.
- Use INR currency for all cost estimates.
4. Optimize city sequence based on geographic proximity.

DAILY ITINERARY REQUIREMENTS
Each day must include city, state, attractions, travel mode, duration, cost, stay type, food type, and daily total cost.

OUTPUT FORMAT
Return ONLY valid JSON.
Do not include markdown, code blocks, backticks, or explanations.
Start with { and end with }.

{
  "summary": {
    "startPoint": "${String(startLocation)}",
    "endPoint": "${String(resolvedEndPoint)}",
    "tripType": "${String(tripType)}",
    "totalDays": 0,
    "citiesCovered": [],
    "routeOptimized": true
  },
  "itinerary": [
    {
      "day": 1,
      "city": "",
      "state": "",
      "attractions": [],
      "travel": {
        "mode": "",
        "from": "",
        "to": "",
        "duration": "",
        "cost": 0
      },
      "stay": { "type": "", "cost": 0 },
      "food": { "type": "", "cost": 0 },
      "dailyTotalCost": 0
    }
  ],
  "costBreakdown": {
    "interCityTravel": 0,
    "localTransportAndSightseeing": 0,
    "stay": 0,
    "food": 0,
    "totalTripCost": 0,
    "costPerPerson": 0
  },
  "assumptions": [],
  "tips": []
}`;
}

// src/agents/trip/routeAgent.ts
init_jsonParser();
var RouteAgent = {
  id: "trip-route-agent",
  name: "Route Optimization Agent",
  description: "Optimizes travel routes based on geographic proximity",
  execute: async (input, context) => {
    const { places, startLocation, endLocation, tripType } = input;
    const geocodingResult = await mcpServer.executeTool("geocoding", {
      action: "route_optimize",
      places,
      from: startLocation
    });
    const optimizedPlaces = geocodingResult.optimized;
    const prompt = buildTripPlannerPrompt({
      places: optimizedPlaces,
      startDate: input.startDate,
      endDate: input.endDate,
      peopleCount: input.peopleCount,
      startLocation,
      endLocation,
      tripType
    });
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const tripData = parseAIJSON(response.data);
    return {
      ...tripData,
      routeOptimization: {
        originalOrder: places,
        optimizedOrder: optimizedPlaces,
        totalDistance: geocodingResult.totalDistance
      }
    };
  }
};

// src/agents/trip/costAgent.ts
var CostAgent = {
  id: "trip-cost-agent",
  name: "Cost Estimation Agent",
  description: "Estimates costs for travel, accommodation, and food",
  execute: async (input, context) => {
    const { itinerary, peopleCount } = input;
    const actualPeopleCount = typeof peopleCount === "number" && peopleCount > 0 ? peopleCount : 1;
    if (!Array.isArray(itinerary)) {
      return input;
    }
    const costBreakdown = {
      interCityTravel: 0,
      localTransportAndSightseeing: 0,
      stay: 0,
      food: 0,
      totalTripCost: 0,
      costPerPerson: 0
    };
    for (const day of itinerary) {
      if (day.travel?.from && day.travel?.to) {
        const distanceResult = await mcpServer.executeTool("geocoding", {
          action: "distance",
          from: day.travel.from,
          to: day.travel.to
        });
        let travelCost = 0;
        if (distanceResult?.mode === "train") {
          travelCost = Math.max(300, distanceResult.distance * 0.5) * actualPeopleCount;
        } else if (distanceResult?.mode === "flight") {
          travelCost = Math.max(3e3, distanceResult.distance * 3) * actualPeopleCount;
        }
        costBreakdown.interCityTravel += travelCost;
      }
      if (typeof day.stay?.cost === "number") {
        costBreakdown.stay += day.stay.cost * actualPeopleCount;
      } else {
        costBreakdown.stay += 2e3 * actualPeopleCount;
      }
      if (typeof day.food?.cost === "number") {
        costBreakdown.food += day.food.cost * actualPeopleCount;
      } else {
        costBreakdown.food += 500 * actualPeopleCount;
      }
      costBreakdown.localTransportAndSightseeing += 500 * actualPeopleCount;
    }
    costBreakdown.totalTripCost = costBreakdown.interCityTravel + costBreakdown.localTransportAndSightseeing + costBreakdown.stay + costBreakdown.food;
    costBreakdown.costPerPerson = costBreakdown.totalTripCost / actualPeopleCount;
    return {
      ...input,
      costBreakdown
    };
  }
};

// src/agents/trip/weatherAgent.ts
var WeatherAgent = {
  id: "trip-weather-agent",
  name: "Weather Information Agent",
  description: "Adds weather context and recommendations to trip plans",
  execute: async (input, context) => {
    const { itinerary, startDate } = input;
    if (!Array.isArray(itinerary)) {
      return input;
    }
    const actualStartDate = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
    if (isNaN(actualStartDate.getTime())) {
      return input;
    }
    const enhancedItinerary = itinerary.map(
      (day, index) => {
        const currentDate = new Date(actualStartDate);
        currentDate.setDate(actualStartDate.getDate() + index);
        const month = currentDate.getMonth() + 1;
        let season;
        let weatherNote;
        if (month >= 3 && month <= 5) {
          season = "summer";
          weatherNote = "Hot weather expected. Carry light clothing and stay hydrated.";
        } else if (month >= 6 && month <= 9) {
          season = "monsoon";
          weatherNote = "Monsoon season. Carry umbrellas and rain gear.";
        } else if (month >= 10 && month <= 11) {
          season = "post-monsoon";
          weatherNote = "Pleasant weather. Ideal for travel.";
        } else {
          season = "winter";
          weatherNote = "Cool weather. Carry warm clothing for evenings.";
        }
        return {
          ...day,
          weather: {
            season,
            note: weatherNote,
            date: currentDate.toISOString().split("T")[0]
          }
        };
      }
    );
    const weatherTips = [
      "Check local weather forecasts before travel",
      "Pack appropriate clothing for the season",
      "Carry essentials based on weather conditions"
    ];
    const existingAssumptions = Array.isArray(input.assumptions) ? input.assumptions : [];
    return {
      ...input,
      itinerary: enhancedItinerary,
      assumptions: [...existingAssumptions, ...weatherTips]
    };
  }
};

// src/agents/trip/localizationAgent.ts
var LocalizationAgent = {
  id: "trip-localization-agent",
  name: "Localization Agent",
  description: "Adds cultural context, language tips, and local customs",
  execute: async (input, context) => {
    const { itinerary } = input;
    if (!itinerary || !Array.isArray(itinerary)) {
      return input;
    }
    const stateTips = {
      "Maharashtra": ["Marathi is widely spoken", "Try local street food like vada pav"],
      "Delhi": ["Hindi and English are common", "Try street food in Chandni Chowk"],
      "Karnataka": ["Kannada is the local language", "Try local cuisine like dosa and idli"],
      "West Bengal": ["Bengali is widely spoken", "Try Bengali sweets"],
      "Tamil Nadu": ["Tamil is the local language", "Try South Indian cuisine"],
      "Rajasthan": ["Hindi and Rajasthani are common", "Experience desert culture"],
      "Goa": ["Konkani, English, and Hindi are common", "Beach culture and Portuguese influence"]
    };
    const enhancedItinerary = itinerary.map((day) => {
      const state = day.state || "";
      const tips = stateTips[state] || ["English is widely understood", "Respect local customs"];
      return {
        ...day,
        localization: {
          language: tips[0],
          culturalTips: tips.slice(1),
          state
        }
      };
    });
    const generalTips = [
      "Carry cash as digital payments may not be available everywhere",
      "Learn basic Hindi phrases for better communication",
      "Respect local customs and traditions",
      "Bargain at local markets",
      "Try local cuisine but be cautious with street food"
    ];
    const existingTips = input.tips || [];
    const updatedTips = [...existingTips, ...generalTips];
    return {
      ...input,
      itinerary: enhancedItinerary,
      tips: updatedTips
    };
  }
};

// src/agents/resume/resumeAgent.ts
var ResumeAgent = {
  id: "resume-main-agent",
  name: "Resume Generation Agent",
  description: "Generates ATS-friendly resume from candidate data",
  execute: async (input, context) => {
    const { anonymisedData } = input;
    const resume = await GeminiTransformService.generateATSResume(anonymisedData);
    return resume;
  }
};

// src/agents/resume/grammarAgent.ts
var GrammarAgent = {
  id: "resume-grammar-agent",
  name: "Grammar Review Agent",
  description: "Reviews and fixes grammar in resume content",
  execute: async (input, context) => {
    if (!input || !input.resume) {
      throw new Error("Grammar agent: Missing resume input");
    }
    const grammarRules = await mcpServer.executeTool("style_guide", {
      action: "get_grammar_rules"
    });
    const resumeText = extractResumeText(input.resume);
    const prompt = `
You are a professional grammar and style editor.
Review the following resume content and fix any grammar, spelling, or style issues.

Grammar Rules to Follow:
${grammarRules.rules.map((r) => `- ${r.rule}: ${r.example} \u2192 ${r.correction}`).join("\n")}

Resume Content:
${resumeText}

Return the corrected resume in the same JSON structure, with all grammar and style issues fixed.
Return ONLY valid JSON, no markdown.
    `;
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const { parseAIJSON: parseAIJSON2 } = await Promise.resolve().then(() => (init_jsonParser(), jsonParser_exports));
    const corrected = parseAIJSON2(response.data);
    const originalResume = input.resume || input;
    return {
      name: corrected.name || originalResume.name || "",
      summary: corrected.summary || originalResume.summary || "",
      contacts: corrected.contacts && corrected.contacts.length > 0 ? corrected.contacts : originalResume.contacts || [],
      links: corrected.links && corrected.links.length > 0 ? corrected.links : originalResume.links || [],
      skills: corrected.skills && corrected.skills.length > 0 ? corrected.skills : originalResume.skills || [],
      work_experience: corrected.work_experience && corrected.work_experience.length > 0 ? corrected.work_experience : originalResume.work_experience || originalResume.work_history || [],
      education: corrected.education && corrected.education.length > 0 ? corrected.education : originalResume.education || [],
      projects: corrected.projects && corrected.projects.length > 0 ? corrected.projects : originalResume.projects || originalResume.personal_projects || []
    };
  }
};
function extractResumeText(resume) {
  if (!resume || typeof resume !== "object") {
    return "";
  }
  const parts = [];
  if (resume.summary) parts.push(`Summary: ${resume.summary}`);
  if (resume.work_experience && Array.isArray(resume.work_experience)) {
    resume.work_experience.forEach((exp) => {
      if (exp) {
        parts.push(`${exp.title || ""} at ${exp.organization || ""}: ${exp.highlights?.join(" ") || ""}`);
      }
    });
  }
  if (resume.education && Array.isArray(resume.education)) {
    resume.education.forEach((edu) => {
      if (edu) {
        parts.push(`${edu.degree || ""} from ${edu.institution || ""}: ${edu.details || ""}`);
      }
    });
  }
  return parts.join("\n") || JSON.stringify(resume);
}

// src/agents/resume/atsScoringAgent.ts
init_jsonParser();
var ATSScoringAgent = {
  id: "resume-ats-scoring-agent",
  name: "ATS Optimization Agent",
  description: "Optimizes resume for Applicant Tracking Systems",
  execute: async (input, context) => {
    if (!input || !input.resume) {
      throw new Error("ATS agent: Missing resume input");
    }
    const { resume, jobDescription, industry } = input;
    const resumeText = extractResumeText2(resume);
    let atsAnalysis;
    if (jobDescription) {
      atsAnalysis = await mcpServer.executeTool("ats_analyzer", {
        action: "score_resume",
        text: resumeText,
        jobDescription
      });
    } else if (industry) {
      const industryKeywords = await mcpServer.executeTool("ats_analyzer", {
        action: "get_industry_keywords",
        industry
      });
      atsAnalysis = {
        score: 70,
        matchedKeywords: [],
        missingKeywords: industryKeywords.keywords,
        suggestions: industryKeywords.commonSkills.map((skill) => `Consider adding: ${skill}`)
      };
    } else {
      atsAnalysis = await mcpServer.executeTool("ats_analyzer", {
        action: "extract_keywords",
        text: resumeText
      });
    }
    const prompt = `
You are an ATS optimization expert.
Optimize the following resume to improve its ATS score.

Current ATS Analysis:
- Score: ${atsAnalysis.score || "N/A"}
- Missing Keywords: ${atsAnalysis.missingKeywords?.join(", ") || "None"}
- Suggestions: ${atsAnalysis.suggestions?.join("; ") || "None"}

Resume to Optimize:
${JSON.stringify(resume, null, 2)}

Instructions:
1. Add missing keywords naturally into the content
2. Use standard section headings
3. Optimize for keyword density without keyword stuffing
4. Maintain readability and professionalism
5. Ensure all sections are ATS-friendly

Return the optimized resume in the same JSON structure.
Return ONLY valid JSON, no markdown.
    `;
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    const optimizedResume = parseAIJSON(response.data);
    const originalResume = resume;
    const result = {
      name: optimizedResume.name || originalResume.name || "",
      summary: optimizedResume.summary || originalResume.summary || "",
      contacts: optimizedResume.contacts && optimizedResume.contacts.length > 0 ? optimizedResume.contacts : originalResume.contacts || [],
      links: optimizedResume.links && optimizedResume.links.length > 0 ? optimizedResume.links : originalResume.links || [],
      skills: optimizedResume.skills && optimizedResume.skills.length > 0 ? optimizedResume.skills : originalResume.skills || [],
      work_experience: optimizedResume.work_experience && optimizedResume.work_experience.length > 0 ? optimizedResume.work_experience : originalResume.work_experience || originalResume.work_history || [],
      education: optimizedResume.education && optimizedResume.education.length > 0 ? optimizedResume.education : originalResume.education || [],
      projects: optimizedResume.projects && optimizedResume.projects.length > 0 ? optimizedResume.projects : originalResume.projects || originalResume.personal_projects || [],
      atsScore: atsAnalysis.score,
      optimizationNotes: atsAnalysis.suggestions || []
    };
    return result;
  }
};
function extractResumeText2(resume) {
  if (!resume || typeof resume !== "object") {
    return "";
  }
  const parts = [];
  if (resume.summary) parts.push(resume.summary);
  if (resume.skills && Array.isArray(resume.skills)) {
    parts.push(resume.skills.join(", "));
  }
  if (resume.work_experience && Array.isArray(resume.work_experience)) {
    resume.work_experience.forEach((exp) => {
      if (exp) {
        parts.push(`${exp.title || ""} ${exp.organization || ""} ${exp.highlights?.join(" ") || ""}`);
      }
    });
  }
  return parts.join(" ") || JSON.stringify(resume);
}

// src/agents/resume/formattingAgent.ts
var FormattingAgent = {
  id: "resume-formatting-agent",
  name: "Resume Formatting Agent",
  description: "Ensures proper structure and formatting for ATS compatibility",
  execute: async (input, context) => {
    if (!input || typeof input !== "object") {
      throw new Error("Formatting agent: Missing or invalid input");
    }
    const templates = await mcpServer.getResource("resume_templates");
    let work_history = [];
    if (Array.isArray(input.work_experience) && input.work_experience.length > 0) {
      work_history = input.work_experience.map((exp) => ({
        role: exp.title || exp.role || "",
        company: exp.organization || exp.company || "",
        duration: exp.duration || "",
        description: Array.isArray(exp.highlights) ? exp.highlights.join("\n") : exp.description || ""
      }));
    } else if (Array.isArray(input.work_history) && input.work_history.length > 0) {
      work_history = input.work_history;
    }
    let skills = {
      Frontend: [],
      Backend: [],
      Tools: []
    };
    if (input.skills && typeof input.skills === "object" && (input.skills.Frontend || input.skills.Backend || input.skills.Tools)) {
      skills = {
        Frontend: input.skills.Frontend || [],
        Backend: input.skills.Backend || [],
        Tools: input.skills.Tools || []
      };
    } else if (Array.isArray(input.skills) && input.skills.length > 0) {
      input.skills.forEach((skill) => {
        const skillName = typeof skill === "object" ? skill.key || skill.value || "" : String(skill || "");
        if (skillName) {
          if (["React", "Angular", "Vue", "JavaScript", "TypeScript", "HTML", "CSS", "Redux", "MobX", "Frontend Development", "UI/UX"].some((kw) => skillName.includes(kw))) {
            skills.Frontend.push(skillName);
          } else if (["Node.js", "Python", "Java", "Go", "Ruby", "Express", "Spring", "Django", "SQL", "NoSQL", "Database", "Backend Development", "API Development", "Database Management"].some((kw) => skillName.includes(kw))) {
            skills.Backend.push(skillName);
          } else if (["Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Jira", "Figma", "VS Code", "Bash", "Tools & DevOps", "CI/CD"].some((kw) => skillName.includes(kw))) {
            skills.Tools.push(skillName);
          } else if (["MVC Architecture", "Monorepo", "Offline-first apps", "Data Privacy", "Methodologies & Concepts", "Agile"].some((kw) => skillName.includes(kw))) {
            skills.Backend.push(skillName);
          } else {
            skills.Backend.push(skillName);
          }
        }
      });
    }
    let personal_projects = [];
    if (Array.isArray(input.projects) && input.projects.length > 0) {
      personal_projects = input.projects.map((proj) => ({
        name: proj.name || proj.title || "",
        description: proj.description || ""
      }));
    } else if (Array.isArray(input.personal_projects) && input.personal_projects.length > 0) {
      personal_projects = input.personal_projects;
    }
    let education = [];
    if (Array.isArray(input.education) && input.education.length > 0) {
      education = input.education.map((edu) => {
        let year = edu.year || "";
        if (!year && edu.details) {
          const yearMatch = edu.details.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) year = yearMatch[0];
        }
        return {
          degree: edu.degree || "",
          institution: edu.institution || "",
          year,
          details: edu.details || ""
        };
      });
    }
    let contacts = [];
    if (Array.isArray(input.contacts) && input.contacts.length > 0) {
      contacts = input.contacts.map(
        (c) => typeof c === "object" && c.key !== void 0 ? { key: c.key || "", value: c.value || "" } : { key: "", value: String(c || "") }
      );
    }
    let links = [];
    if (Array.isArray(input.links) && input.links.length > 0) {
      links = input.links.map(
        (l) => typeof l === "object" && l.key !== void 0 ? { key: l.key || "", value: l.value || "" } : { key: "", value: String(l || "") }
      );
    }
    const formatted = {
      header: {
        name: input.name || "",
        title: input.title || "Full Stack Software Engineer",
        // Placeholder for now
        contacts,
        links
      },
      summary: input.summary || input.Summary || "",
      experience: work_history,
      // Renamed from work_history
      projects: personal_projects,
      // Renamed from personal_projects
      education,
      skills
      // Will be categorized in next step
    };
    const atsTips = templates?.atsTips || [];
    const validation = {
      hasStandardSections: true,
      hasKeywords: Object.values(formatted.skills).some((arr) => arr.length > 0),
      hasExperience: formatted.experience.length > 0,
      hasEducation: formatted.education.length > 0,
      atsTips
    };
    const result = {
      ...formatted,
      validation
    };
    Object.keys(result).forEach((key) => {
      if (key !== "header" && key !== "summary" && key !== "experience" && key !== "projects" && key !== "education" && key !== "skills" && key !== "validation" && key !== "atsScore" && key !== "optimizationNotes") {
        if (typeof result[key] === "string" && result[key].length > 50) {
          delete result[key];
        }
      }
    });
    return result;
  }
};

// src/agents/text.editor.agent.ts
function buildTextEditorPrompt({ intent, text, language, tone }) {
  const baseSystem = `
You are Likhit AI, an premium writing assistant.
Audience: writers, poets, editors, journalists, teachers, students, lawyers.
Follow these rules:
- Preserve meaning unless asked to change
- Be concise and professional for business, but creative for literature
- No emojis
`;
  switch (intent) {
    case "grammar":
      return `
${baseSystem}
Task: Fix grammar and clarity without changing meaning.

Text:
${text}
`;
    case "rewrite":
      return `
${baseSystem}
Task: Rewrite the text.
Tone: ${tone ?? "neutral"}

Text:
${text}
`;
    case "autocomplete":
      return `
${baseSystem}
Task: Complete the unfinished sentence naturally.

Text:
${text}
`;
    case "continue":
      return `
${baseSystem}
Task: Continue the writing based on the context. If there is a specific 'Instruction', follow it strictly.

Content Context:
${text}
`;
    case "translate":
      return `
${baseSystem}
Task: Translate the text into ${language}.

Text:
${text}
`;
    case "summarize":
      return `
${baseSystem}
Task: Summarize clearly.

Text:
${text}
`;
    default:
      throw new Error("Unknown Likhit intent");
  }
}

// src/agents/text/textEditorAgent.ts
var TextEditorAgent = {
  id: "text-editor-main-agent",
  name: "Text Editor Agent",
  description: "Main text editing agent that handles various text operations",
  execute: async (input, context) => {
    const { intent, text, language, tone } = input;
    const prompt = buildTextEditorPrompt({ intent, text, language, tone });
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    return response.data;
  }
};

// src/agents/text/grammarAgent.ts
var TextGrammarAgent = {
  id: "text-grammar-agent",
  name: "Grammar Check Agent",
  description: "Checks and fixes grammar in text",
  execute: async (input, context) => {
    const { text } = input;
    const grammarRules = await mcpServer.executeTool("style_guide", {
      action: "get_grammar_rules"
    });
    const prompt = buildTextEditorPrompt({
      intent: "grammar",
      text,
      language: input.language,
      tone: input.tone
    });
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    return response.data;
  }
};

// src/agents/text/styleAgent.ts
var StyleAgent = {
  id: "text-style-agent",
  name: "Style Enhancement Agent",
  description: "Enhances text style based on writing style guide",
  execute: async (input, context) => {
    const { text, style } = input;
    const styleGuide = await mcpServer.executeTool("style_guide", {
      action: "get_style_guide",
      style: style || "business"
    });
    const prompt = `
You are a professional writing style editor.
Apply the following style guidelines to improve the text.

Style Guidelines:
${styleGuide.guidelines.join("\n")}

Do's:
${styleGuide.do.join("\n")}

Don'ts:
${styleGuide.dont.join("\n")}

Examples:
${styleGuide.examples.map((ex) => `Before: ${ex.before}
After: ${ex.after}`).join("\n\n")}

Text to improve:
${text}

Return the improved text following the style guide.
    `;
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    return response.data;
  }
};

// src/agents/text/toneAgent.ts
var ToneAgent = {
  id: "text-tone-agent",
  name: "Tone Adjustment Agent",
  description: "Adjusts text tone based on desired tone guide",
  execute: async (input, context) => {
    const { text, tone } = input;
    const toneGuide = await mcpServer.executeTool("style_guide", {
      action: "get_tone_guide",
      tone: tone || "professional"
    });
    const prompt = `
You are a professional tone editor.
Adjust the following text to match the desired tone.

Tone Characteristics:
${toneGuide.characteristics.join("\n")}

Word Choices:
${toneGuide.wordChoices.map((wc) => `Avoid: "${wc.avoid}" \u2192 Use: "${wc.use}"`).join("\n")}

Examples:
${toneGuide.examples.map((ex) => `Before: ${ex.before}
After: ${ex.after}`).join("\n\n")}

Text to adjust:
${text}

Return the text adjusted to match the ${tone} tone.
    `;
    const apiKey = await getApiKey();
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    return response.data;
  }
};

// src/agents/wedding.invitation.agent.ts
function religionStyle(religion) {
  switch (religion) {
    case "hindu":
      return "Traditional Hindu wedding motifs, mandap, marigold flowers";
    case "muslim":
      return "Elegant Islamic geometric patterns, crescent motifs";
    case "christian":
      return "Soft floral Christian wedding invitation style";
    default:
      return "Elegant wedding invitation design";
  }
}
function languageInstruction(language) {
  if (language === "hindi")
    return "All text must be in Hindi (Devanagari script)";
  if (language === "urdu")
    return "All text must be in Urdu (Nastaliq script)";
  return "All text must be in English";
}
function buildInvitationPrompt(data) {
  return `
Create a vertical wedding invitation card.

Style:
- ${religionStyle(data.religion)}
- Premium, clean, print-ready
- No spelling mistakes
- No watermark

Language:
- ${languageInstruction(data.language)}

Text content (exact):
"${data.groomName} & ${data.brideName}"
Date: ${data.date}
Time: ${data.time}
Venue: ${data.venue}
${data.familyDetails ? `Family: ${data.familyDetails}` : ""}
${data.rsvpContact ? `RSVP: ${data.rsvpContact}` : ""}

Output:
- High-resolution PNG
- Suitable for WhatsApp and print
`;
}

// src/agents/invitation/designAgent.ts
var DesignAgent = {
  id: "invitation-design-agent",
  name: "Invitation Design Agent",
  description: "Generates invitation designs with cultural and design context",
  execute: async (input, context) => {
    const { data, theme } = input;
    const culturalPatterns = await mcpServer.executeTool("design_resources", {
      action: "get_cultural_patterns",
      religion: data.religion
    });
    const designTemplates = await mcpServer.executeTool("design_resources", {
      action: "get_design_templates",
      theme: theme || "wedding"
    });
    const colorScheme = await mcpServer.executeTool("design_resources", {
      action: "get_color_scheme",
      religion: data.religion,
      theme: theme || "wedding"
    });
    const basePrompt = buildInvitationPrompt(data);
    const enhancedPrompt = `
${basePrompt}

Design Context:
- Cultural Motifs: ${culturalPatterns.motifs.join(", ")}
- Design Elements: ${designTemplates.elements.join(", ")}
- Color Scheme: ${colorScheme.description}
- Primary Colors: ${colorScheme.primary.join(", ")}
- Layout Style: ${designTemplates.layout}

Follow these design guidelines:
${designTemplates.recommendations.join("\n")}
    `;
    const apiKey = await getApiKey();
    const response = await callGeminiImageWithUserPreference(apiKey, enhancedPrompt);
    return {
      ...response,
      designContext: {
        culturalPatterns,
        designTemplates,
        colorScheme
      }
    };
  }
};

// src/agents/invitation/localizationAgent.ts
var InvitationLocalizationAgent = {
  id: "invitation-localization-agent",
  name: "Invitation Localization Agent",
  description: "Adds language-specific formatting and cultural context",
  execute: async (input, context) => {
    const { data, image } = input;
    const languageResources = await mcpServer.executeTool("design_resources", {
      action: "get_language_resources",
      language: data.language || "english"
    });
    const localizedData = {
      ...data,
      languageFormatting: {
        commonPhrases: languageResources.commonPhrases,
        formattingRules: languageResources.formattingRules,
        typography: languageResources.typography
      },
      examples: languageResources.examples
    };
    return {
      ...input,
      data: localizedData,
      localization: languageResources
    };
  }
};

// src/agents/invitation/qualityAgent.ts
var QualityAgent = {
  id: "invitation-quality-agent",
  name: "Quality Assurance Agent",
  description: "Validates invitation quality and completeness",
  execute: async (input, context) => {
    const { data, image } = input;
    const qualityChecks = {
      hasRequiredFields: !!(data.groomName && data.brideName && data.date && data.time && data.venue),
      hasImage: !!image,
      languageConsistent: true,
      culturalAppropriate: true,
      designQuality: "high"
    };
    const designTemplate = await mcpServer.executeTool("design_resources", {
      action: "get_design_templates",
      theme: input.theme || "wedding"
    });
    const validation = {
      ...qualityChecks,
      requiredElements: designTemplate.elements,
      recommendations: designTemplate.recommendations,
      score: Object.values(qualityChecks).filter(Boolean).length / Object.keys(qualityChecks).length * 100
    };
    return {
      ...input,
      validation,
      qualityScore: validation.score
    };
  }
};

// src/agents/index.ts
function registerAllAgents() {
  agentRegistry.register(RouteAgent);
  agentRegistry.register(CostAgent);
  agentRegistry.register(WeatherAgent);
  agentRegistry.register(LocalizationAgent);
  agentRegistry.register(ResumeAgent);
  agentRegistry.register(GrammarAgent);
  agentRegistry.register(ATSScoringAgent);
  agentRegistry.register(FormattingAgent);
  agentRegistry.register(TextEditorAgent);
  agentRegistry.register(TextGrammarAgent);
  agentRegistry.register(StyleAgent);
  agentRegistry.register(ToneAgent);
  agentRegistry.register(DesignAgent);
  agentRegistry.register(InvitationLocalizationAgent);
  agentRegistry.register(QualityAgent);
}

// src/server.ts
var import_meta = {};
var SERVER_DIR = typeof __dirname !== "undefined" ? __dirname : import_path3.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
async function startServer() {
  try {
    console.log("\u23F3 Initializing database...");
    await db.init();
    console.log("\u2705 Database ready");
    console.log("\u23F3 Registering agents...");
    registerAllAgents();
    console.log("\u2705 Agents registered");
    const app = (0, import_express8.default)();
    app.use((0, import_cors.default)());
    app.use(import_express8.default.json());
    app.use("/api/v1", apiRouter);
    app.get("/health", (_req, res) => {
      res.json({
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    const publicPath = process.env.WEB_DIST_PATH || import_path3.default.join(SERVER_DIR, "../web");
    console.log(`\u{1F4C2} Serving frontend from: ${publicPath}`);
    app.use(import_express8.default.static(publicPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(import_path3.default.join(publicPath, "index.html"));
    });
    const PORT = Number(process.env.PORT) || 0;
    const server = app.listen(PORT, () => {
      const address = server.address();
      const actualPort = typeof address === "string" ? PORT : address?.port;
      console.log(`\u2705 Server running on http://localhost:${actualPort}`);
      LoggerModel.log("Session started: Server initialized");
      if (process.send) {
        process.send({
          type: "server-ready",
          port: actualPort
        });
      }
    });
    server.on("error", (err) => {
      console.error("\u274C Server error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("\u274C Failed to start server");
    console.error(err);
    process.exit(1);
  }
}
process.on("SIGTERM", () => {
  LoggerModel.log("Session ended: Received SIGTERM");
  process.exit(0);
});
process.on("SIGINT", () => {
  LoggerModel.log("Session ended: Received SIGINT");
  process.exit(0);
});
startServer();
