import "dotenv/config";
import express from "express";
import fs from "fs";
import { z } from "zod";
import OpenAI from "openai";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import path from "path";
import { fileURLToPath } from "url";

// Server root (directory containing this file). Use this for all repository-relative writes.
const SERVER_ROOT = path.dirname(fileURLToPath(import.meta.url));

// --------------------
// App setup
// --------------------
const app = express();
app.use(express.json());

console.log("Jarvis online");

// Global handlers to surface uncaught errors during development
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

const requiredEnv = [
  "OPENAI_API_KEY",
  "GITHUB_APP_ID",
  "GITHUB_APP_INSTALLATION_ID",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing env var: ${key}`);
    process.exit(1);
  }
}

// --------------------
// OpenAI client
// --------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --------------------
// GitHub App key (LOCAL FILE or ENV VAR)
// --------------------
let privateKey;

if (process.env.GITHUB_APP_PRIVATE_KEY_PATH) {
  privateKey = fs.readFileSync(
    process.env.GITHUB_APP_PRIVATE_KEY_PATH,
    "utf8"
  );
} else {
  privateKey = process.env.GITHUB_APP_PRIVATE_KEY ? process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n") : null;
}

// Private key validation deferred until write-backend selection so local mode can operate without GitHub keys.

// --------------------
// GitHub App Octokit (may be unused in local mode)
// --------------------
let octokit;
try {
  octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      installationId: process.env.GITHUB_APP_INSTALLATION_ID,
      privateKey,
    },
  });
} catch (err) {
  console.error('Failed to initialize Octokit/GitHub App auth (continuing — will use local write backend if configured):', err && err.message ? err.message : err);
  // do not exit; allow local-only mode to work even if GitHub auth is invalid
  octokit = null;
}

// Write backend selection: 'github' | 'local' | 'none'
const WRITE_BACKEND = (process.env.JARVIS_WRITE_BACKEND || 'local').toLowerCase();

async function persistArtifact(config, writePath, markdown) {
  // writePath is the desired relative path (e.g., folder/filename.md or filename.md)
  if (WRITE_BACKEND === 'none') {
    // do not persist, just return the markdown path as null
    return { request_path: null };
  }

  if (WRITE_BACKEND === 'local') {
    try {
      const artifactsDir = path.join(SERVER_ROOT, 'artifacts');
      if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
      // sanitize writePath to a filename under artifacts
      const filename = writePath.replace(/^\/+/, '').replace(/[:\\]/g, '_');
      const outPath = path.join(artifactsDir, filename);
      // ensure parent directory exists (handles writePath with subfolders)
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, markdown, 'utf8');
      // return a path relative to the project root for UI display
      const rel = path.relative(SERVER_ROOT, outPath).replace(/\\/g, '/');
      return { request_path: rel };
    } catch (err) {
      console.error('Failed to persist artifact locally:', err);
      throw err;
    }
  }

  // default: attempt GitHub write if octokit available
  if (!octokit) throw new Error('GitHub write requested but Octokit not initialized');
  // If we reach here, fallback to GitHub write (caller should await)
  return null;
}

// --------------------
// Projects dir
// --------------------
const PROJECTS_DIR = path.join(SERVER_ROOT, "projects");

function loadProject(projectId) {
  const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
  let data;
  if (fs.existsSync(filePath)) {
    data = fs.readFileSync(filePath, "utf8");
  } else {
    const fallback = path.join(PROJECTS_DIR, "default.json");
    if (!fs.existsSync(fallback)) throw new Error("No default project config found");
    data = fs.readFileSync(fallback, "utf8");
  }
  return JSON.parse(data);
}

function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

// --------------------
// Schema
// --------------------
const IntentSchema = z.object({
  intent: z.string().min(5),
});

function extractJson(text) {
  if (!text) return null;
  // strip code fences
  const fenced = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "");
  // try direct parse
  try {
    return JSON.parse(fenced);
  } catch (e) {
    // try to extract first { ... }
    const first = fenced.indexOf("{");
    const last = fenced.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const sub = fenced.slice(first, last + 1);
      try {
        return JSON.parse(sub);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

function titleCaseKey(k) {
  return k
    .replace(/[_\-]/g, " ")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

async function generateFromIntent(config, intent) {
  const keys = Array.isArray(config.schema_keys) ? config.schema_keys : [];
  const systemContent = `${config.system_prompt}\n\nOutput STRICT JSON with keys: ${keys.join(", ")}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: intent },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices?.[0]?.message?.content || "";
  const parsed = extractJson(raw);
  return { parsed, raw };
}

// --------------------
// Root + health
// --------------------
app.get("/", (req, res) => {
  res.json({ ok: true, service: "jarvis-cloud" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// --------------------
// Web UI
// --------------------
// If a production build exists at ../desktop/ui/dist, serve it at /ui
const UI_DIST = path.join(SERVER_ROOT, '..', 'desktop', 'ui', 'dist');
if (fs.existsSync(UI_DIST)) {
  // Serve static assets — Vite build emits absolute `/assets/*` paths, so expose them at root
  const UI_ASSETS = path.join(UI_DIST, 'assets');
  if (fs.existsSync(UI_ASSETS)) {
    app.use('/assets', express.static(UI_ASSETS));
  }
  app.use('/ui', express.static(UI_DIST));
  app.get('/ui', (req, res) => {
    res.sendFile(path.join(UI_DIST, 'index.html'));
  });
} else {
  // fallback: inline legacy UI
  app.get('/ui', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jarvis UI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
    `);
  });
}

// --------------------
// Projects endpoints
// --------------------
app.get("/projects", (req, res) => {
  try {
    const list = listProjects();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// --------------------
// POST /intent/test (safe test endpoint)
// - if body.mock === true, returns a simulated parsed result without calling OpenAI or GitHub
// - otherwise calls OpenAI but DOES NOT write to GitHub (safe read-only test)
// --------------------
app.post("/intent/test", async (req, res) => {
  try {
    const projectId = (req.query.project || req.body?.project || "default").toString();
    const config = loadProject(projectId);
    const { intent } = IntentSchema.parse(req.body);

    if (req.body && req.body.mock === true) {
      // generate a fake parsed object using schema_keys
      const parsed = {};
      for (const k of (config.schema_keys || [])) {
        parsed[k] = `MOCK ${k} for intent: ${intent}`;
      }
      // build markdown
      let body = `# ${config.artifact_prefix}-MOCK\n\n`;
      for (const key of config.schema_keys) {
        body += `## ${titleCaseKey(key)}\n${parsed[key]}\n\n`;
      }
      return res.json({ ok: true, project: projectId, request_path: `mock/${config.artifact_prefix}-MOCK.md`, request_markdown: body.trim(), parsed });
    }

    // real mode: call OpenAI but do not write to GitHub
    const { parsed, raw } = await generateFromIntent(config, intent);
    if (!parsed || typeof parsed !== "object") {
      return res.status(400).json({ ok: false, error: "Model did not return valid JSON.", raw });
    }
    const missingKeys = (config.schema_keys || []).filter((k) => !(k in parsed));
    if (missingKeys.length) {
      return res.status(400).json({ ok: false, error: `Model output missing keys: ${missingKeys.join(", ")}`, raw });
    }
    // render markdown
    let body = `# ${config.artifact_prefix}-TEST\n\n`;
    for (const key of config.schema_keys) {
      body += `## ${titleCaseKey(key)}\n${parsed[key]}\n\n`;
    }
    return res.json({ ok: true, project: projectId, request_path: `test/${config.artifact_prefix}-TEST.md`, request_markdown: body.trim(), parsed, raw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});


// --------------------
// POST /intent
// --------------------
app.post("/intent", async (req, res) => {
  try {
    const projectId = (req.query.project || req.body?.project || "default").toString();
    const config = loadProject(projectId);

    const { intent } = IntentSchema.parse(req.body);

    // basic config validation
    const needed = ["owner", "repo", "folder", "artifact_prefix", "system_prompt", "schema_keys"];
    for (const n of needed) {
      if (!(n in config)) {
        return res.status(500).json({ error: `Project config missing key: ${n}` });
      }
    }

    const { parsed, raw } = await generateFromIntent(config, intent);
    if (!parsed || typeof parsed !== "object") {
      return res.status(400).json({ ok: false, error: "Model did not return valid JSON.", raw });
    }

    const missingKeys = (config.schema_keys || []).filter((k) => !(k in parsed));
    if (missingKeys.length) {
      return res.status(400).json({ ok: false, error: `Model output missing keys: ${missingKeys.join(", ")}`, raw });
    }

    const id = Date.now();
    const filename = `${config.artifact_prefix}-${id}.md`;
    const folder = (config.folder || "").replace(/^\/+|\/+$/g, "");
    const writePath = folder ? `${folder}/${filename}` : filename;

    // build markdown using schema_keys order
    let body = `# ${config.artifact_prefix}-${id}\n\n`;
    for (const key of config.schema_keys) {
      const heading = titleCaseKey(key);
      const value = parsed[key];
      body += `## ${heading}\n${value}\n\n`;
    }
    body = body.trim();

    // Persist artifact according to WRITE_BACKEND. In 'local' mode we save to server/artifacts,
    // in 'github' mode we use Octokit, and in 'none' mode we skip write.
    try {
      if (WRITE_BACKEND === 'github') {
        await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
          owner: config.owner,
          repo: config.repo,
          path: writePath,
          message: `${config.artifact_prefix}-${id}: ${String(parsed[config.schema_keys[0]] || "request")}`,
          content: Buffer.from(body).toString("base64"),
        });
        res.json({ ok: true, project: projectId, request_path: writePath, request_markdown: body });
      } else if (WRITE_BACKEND === 'local') {
        const result = await persistArtifact(config, writePath, body);
        res.json({ ok: true, project: projectId, request_path: result.request_path, request_markdown: body });
      } else if (WRITE_BACKEND === 'none') {
        res.json({ ok: true, project: projectId, request_path: null, request_markdown: body });
      } else {
        // unknown mode — attempt local as safe default
        const result = await persistArtifact(config, writePath, body);
        res.json({ ok: true, project: projectId, request_path: result.request_path, request_markdown: body });
      }
    } catch (err) {
      console.error('Failed to persist artifact:', err);
      res.status(500).json({ error: String(err) });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Jarvis listening on ${PORT}`);
});
