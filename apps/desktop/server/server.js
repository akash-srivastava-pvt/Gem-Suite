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
    const message = buildTripPlannerPrompt({
      places: data.places,
      startDate: data.startDate,
      endDate: data.endDate,
      peopleCount: data.peopleCount,
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      tripType: data.tripType
    });
    const rawResponse = (await callGeminiWithUserPreference(apiKey, message)).data;
    LoggerModel.log(`Gemini API called for trip planning: ${data.places.join(", ")}`);
    try {
      const { parseAIJSON: parseAIJSON2 } = await Promise.resolve().then(() => (init_jsonParser(), jsonParser_exports));
      const parsedData = parseAIJSON2(rawResponse);
      return res.status(200).json({ success: true, data: parsedData });
    } catch (parseError) {
      console.error("AI JSON Parse Error:", parseError.message);
      console.error("Response preview:", rawResponse.substring(0, 500));
      return res.status(502).json({
        error: "AI generated an invalid response format",
        details: parseError.message
      });
    }
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

// src/controllers/textEditorController.ts
async function TextEditorController(req, res) {
  try {
    const { data } = req.body;
    if (!data?.intent || !data?.text) {
      return res.status(400).json({ success: false, error: "intent and text required" });
    }
    const { intent, text, language, tone } = data;
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key missing");
    }
    const prompt = await buildTextEditorPrompt({
      intent,
      text,
      language,
      tone
    });
    const result = (await callGeminiWithUserPreference(apiKey, prompt)).data;
    LoggerModel.log(`Gemini API called for text editing: ${intent}`);
    return res.status(200).json({
      success: true,
      data: result
    });
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
    const prompt = buildInvitationPrompt({
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
    });
    const geminiResponse = await callGeminiImageWithUserPreference(apiKey, prompt);
    LoggerModel.log(`Gemini API called for wedding invitation generation: ${groomName} & ${brideName}`);
    if (!geminiResponse?.image?.base64) {
      return res.status(502).json({
        error: "Gemini did not return an image"
      });
    }
    return res.status(200).json({
      success: true,
      image: {
        mimeType: geminiResponse.image.mimeType,
        base64: geminiResponse.image.base64
      }
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

// src/services/GeminiTransformService.ts
init_jsonParser();
var GeminiTransformService = {
  async generateATSResume(anonymisedData) {
    const apiKey = await getApiKey();
    const prompt = `
      You are a professional resume writer and ATS optimization expert.
      Using the provided anonymised candidate data, generate a COMPLETE and ATS-friendly resume.

      Data:
      ${JSON.stringify(anonymisedData, null, 2)}

      Rules:
      - Include ALL sections present in the input:
        - Name (CANDIDATE_NAME)
        - Contacts (placeholders)
        - Links
        - Work History
        - Education
        - Personal Projects
        - Skills
      - Do NOT invent experience or hallucinate achievements.
      - Rewrite content professionally for a student / early-career tone.
      - Optimize for keyword scanning using clear bullet points.
      - Maintain neutral professional phrasing; neutralize any abusive or sensitive language.

      Output format:
      IMPORTANT: Return ONLY valid JSON. Do NOT include markdown code blocks, backticks, or any formatting.
      Return STRICT JSON in the following structure:
      {
        "name": "CANDIDATE_NAME",
        "summary": "...",
        "contacts": [{"key": "string", "value": "string"}],
        "links": [{"key": "string", "value": "string"}],
        "skills": ["..."],
        "work_experience": [
          {
            "title": "...",
            "organization": "...",
            "duration": "...",
            "highlights": ["..."]
          }
        ],
        "education": [
          {
            "degree": "...",
            "institution": "...",
            "details": "..."
          }
        ],
        "projects": [
          {
            "name": "...",
            "description": "..."
          }
        ]
      }
    `;
    const response = await callGeminiWithUserPreference(apiKey, prompt);
    return parseAIJSON(response.data);
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

// src/controllers/resumeController.ts
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
      AuditLogService.log("Data sent to Gemini", "RESUME_ATS", false, "SUCCESS");
      const geminiResult = await GeminiTransformService.generateATSResume(anonymisedData);
      AuditLogService.log("Gemini response received", "RESUME_ATS", false, "SUCCESS");
      const finalResult = AnonymisationService.reinsertIntoJson(geminiResult, originalPII);
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

// src/server.ts
var import_meta = {};
var SERVER_DIR = typeof __dirname !== "undefined" ? __dirname : import_path3.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
async function startServer() {
  try {
    console.log("\u23F3 Initializing database...");
    await db.init();
    console.log("\u2705 Database ready");
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
