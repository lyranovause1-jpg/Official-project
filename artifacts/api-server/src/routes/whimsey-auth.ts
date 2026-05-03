import { Router } from "express";

const router = Router();

router.post("/auth/verify", (req, res) => {
  const { code } = req.body as { code?: string };

  if (!code || typeof code !== "string") {
    res.status(400).json({ ok: false, error: "Missing code" });
    return;
  }

  const trimmed = code.trim().toUpperCase();
  const ownerCode   = (process.env["OWNER_ACCESS_CODE"]   ?? "").toUpperCase();
  const managerCode = (process.env["MANAGER_ACCESS_CODE"] ?? "").toUpperCase();

  if (ownerCode && trimmed === ownerCode) {
    res.json({ ok: true, role: "owner", name: "Lyra" });
    return;
  }

  if (managerCode && trimmed === managerCode) {
    res.json({ ok: true, role: "manager", name: "Aria" });
    return;
  }

  res.status(401).json({ ok: false, error: "Invalid access code" });
});

export default router;
