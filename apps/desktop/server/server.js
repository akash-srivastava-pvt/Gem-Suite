"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/server.ts
var import_express5 = __toESM(require("express"), 1);
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
      } else {
        console.log(`Creating new database at: ${this.dbPath}`);
        this.db = new SQL.Database();
        this.db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY, 
          name TEXT
        )`);
        this.db.run(`CREATE TABLE IF NOT EXISTS activate (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          apiKey TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
var import_express4 = require("express");

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
  return `
You are an expert travel planner and route optimizer specializing in Indian geography.

---

### TRIP PARAMETERS
- **Start Location:** ${startLocation}
- **End Location:** ${endLocation}
- **Trip Type:** ${tripType === "roundtrip" ? "Round Trip (Return to Start Location)" : "One Way (End at Destination)"}
- **Places to Visit (attraction/city/state):**
${places.map((p) => `- ${p}`).join("\n")}

- **Dates:** ${startDate} to ${endDate}
- **Group Size:** ${peopleCount} People

---

### CORE PLANNING RULES
1. **Route Logic:** - Start the journey from ${startLocation}.
   - If Trip Type is "roundtrip", the final day must involve traveling back to ${startLocation} from the last visited city.
   - If Trip Type is "oneway", the journey ends at ${endLocation}.
2. **Grouping:** Group attractions by city/state to avoid backtracking.
3. **Transport Assumptions:** - Use trains for <700km and flights for >700km distances from the Start Location and between cities.
   - Use INR (\u20B9) for all estimates based on current Indian budget-to-mid-range standards.
4. **Efficiency:** Optimize the sequence of cities based on geographical proximity to minimize total travel time.

---

### DAILY ITINERARY & COST REQUIREMENTS
Each day must include city/state, attractions, travel mode/duration/cost, stay type/cost, and food style/cost.

---

### OUTPUT FORMAT (STRICT JSON ONLY)
Return ONLY valid JSON matching this structure:

{
  "summary": {
    "startPoint": "${startLocation}",
    "endPoint": "${tripType === "roundtrip" ? startLocation : endLocation}",
    "tripType": "${tripType}",
    "totalDays": number,
    "citiesCovered": string[],
    "routeOptimized": boolean
  },
  "itinerary": [
    {
      "day": number,
      "city": string,
      "state": string,
      "attractions": string[],
      "travel": {
        "mode": string,
        "from": string,
        "to": string,
        "duration": string,
        "cost": number
      },
      "stay": { "type": string, "cost": number },
      "food": { "type": string, "cost": number },
      "dailyTotalCost": number
    }
  ],
  "costBreakdown": {
    "interCityTravel": number,
    "localTransportAndSightseeing": number,
    "stay": number,
    "food": number,
    "totalTripCost": number,
    "costPerPerson": number
  },
  "assumptions": string[],
  "tips": string[]
}

Return ONLY JSON. No markdown backticks. No conversational text.
`;
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
    const rawResponse = (await callGemini(apiKey, message)).data;
    const cleanedData = rawResponse.replace(/```json|```/g, "").trim();
    try {
      const parsedData = JSON.parse(cleanedData);
      return res.status(200).json({ success: true, data: parsedData });
    } catch (parseError) {
      console.error("AI JSON Parse Error:", cleanedData);
      return res.status(502).json({ error: "AI generated an invalid response format" });
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
You are Likhit AI, an intelligent writing assistant.
Audience: journalists, teachers, students, lawyers.
Follow these rules:
- Preserve meaning unless asked to change
- Be concise and professional
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
Task: Continue writing in the same style.

Text:
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
    const result = (await callGemini(apiKey, prompt)).data;
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

// src/routes/index.ts
var apiRouter = (0, import_express4.Router)();
apiRouter.use("/activate", activateRoutes_default);
apiRouter.use("/trip", tripRoutes_default);
apiRouter.use("/text-editor", textEditorRoutes_default);

// src/server.ts
var import_meta = {};
var SERVER_DIR = typeof __dirname !== "undefined" ? __dirname : import_path3.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
async function startServer() {
  try {
    console.log("\u23F3 Initializing database...");
    await db.init();
    console.log("\u2705 Database ready");
    const app = (0, import_express5.default)();
    app.use((0, import_cors.default)());
    app.use(import_express5.default.json());
    app.use("/api/v1", apiRouter);
    app.get("/health", (_req, res) => {
      res.json({
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    const publicPath = process.env.WEB_DIST_PATH || import_path3.default.join(SERVER_DIR, "../web");
    console.log(`\u{1F4C2} Serving frontend from: ${publicPath}`);
    app.use(import_express5.default.static(publicPath));
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
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
startServer();
