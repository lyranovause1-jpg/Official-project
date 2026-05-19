import { Router } from "express";
import { loadState, saveState } from "../lib/persistence";

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get("/sessions/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  if (!UUID_RE.test(deviceId)) return res.status(400).json({ error: "Invalid device ID" });
  const data = await loadState(`chat_sessions:${deviceId}`);
  res.json(data ?? { sessions: [], count: 0 });
});

router.put("/sessions/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  if (!UUID_RE.test(deviceId)) return res.status(400).json({ error: "Invalid device ID" });
  const { sessions, count } = req.body;
  if (!Array.isArray(sessions)) return res.status(400).json({ error: "sessions must be an array" });
  await saveState(`chat_sessions:${deviceId}`, { sessions, count: count ?? 0 });
  res.json({ ok: true });
});

export default router;
