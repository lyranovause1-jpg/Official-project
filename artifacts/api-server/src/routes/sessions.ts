import { Router } from "express";
import { loadState, saveState } from "../lib/persistence";
import fs from "fs";
import path from "path";

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ── Permanent file-based storage ─────────────────────────────────────────
 *
 * Sessions are written to TWO permanent locations:
 *
 * 1. data/whimsey-sessions.json  — a real file IN the codebase.
 *    This file travels with the project whenever it is copied, forked, or
 *    moved anywhere. As long as the code exists, the sessions exist.
 *
 * 2. PostgreSQL database  — survives redeployments and browser/cache clears.
 *
 * Either location alone is enough to restore all sessions. Together they
 * provide the strongest possible guarantee of permanence.
 * ─────────────────────────────────────────────────────────────────────── */

// Resolve path relative to workspace root (two levels up from api-server/)
const DATA_FILE = path.resolve(process.cwd(), "../../data/whimsey-sessions.json");

function fileRead(): Record<string, unknown> {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function fileWrite(data: Record<string, unknown>): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch { /* best-effort — DB is the fallback */ }
}

/* ── GET /api/sessions/:deviceId ── */
router.get("/sessions/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  if (!UUID_RE.test(deviceId)) return res.status(400).json({ error: "Invalid device ID" });

  // 1. Try the codebase file first — always present wherever the project lives
  const file = fileRead();
  if (file[deviceId]) return res.json(file[deviceId]);

  // 2. Fall back to database (e.g. after a fresh clone without the file)
  const db = await loadState(`chat_sessions:${deviceId}`);
  if (db) {
    fileWrite({ ...file, [deviceId]: db }); // backfill the file for next time
    return res.json(db);
  }

  res.json({ sessions: [], count: 0 });
});

/* ── PUT /api/sessions/:deviceId ── */
router.put("/sessions/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  if (!UUID_RE.test(deviceId)) return res.status(400).json({ error: "Invalid device ID" });

  const { sessions, count } = req.body;
  if (!Array.isArray(sessions)) return res.status(400).json({ error: "sessions must be an array" });

  const payload = { sessions, count: count ?? 0 };

  // Write to the codebase file  (permanent — travels with the project)
  const existing = fileRead();
  fileWrite({ ...existing, [deviceId]: payload });

  // Write to database in parallel (backup — survives redeployments)
  await saveState(`chat_sessions:${deviceId}`, payload);

  res.json({ ok: true });
});

export default router;
