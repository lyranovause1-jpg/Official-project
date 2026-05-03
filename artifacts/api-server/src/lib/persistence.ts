import { db, whimseyContent, whimseyChangelog } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

// ── Load a state blob from DB ─────────────────────────────────────────────
export async function loadState(key: string): Promise<any | null> {
  try {
    const rows = await db
      .select()
      .from(whimseyContent)
      .where(eq(whimseyContent.key, key));
    if (rows.length === 0) return null;
    return JSON.parse(rows[0].value);
  } catch (err: any) {
    logger.error({ err, key }, "Failed to load persisted state");
    return null;
  }
}

// ── Save/upsert a state blob to DB ────────────────────────────────────────
export async function saveState(key: string, value: any): Promise<void> {
  try {
    const json = JSON.stringify(value);
    await db
      .insert(whimseyContent)
      .values({ key, value: json })
      .onConflictDoUpdate({
        target: whimseyContent.key,
        set: { value: json, updatedAt: new Date() },
      });
  } catch (err: any) {
    logger.error({ err, key }, "Failed to persist state");
  }
}

// ── Append a changelog entry ──────────────────────────────────────────────
export async function logChange(tool: string, summary: string, detail?: string): Promise<void> {
  try {
    await db.insert(whimseyChangelog).values({ tool, summary, detail: detail ?? null });
  } catch (err: any) {
    logger.error({ err, tool }, "Failed to write changelog entry");
  }
}

// ── Fetch recent changelog entries ────────────────────────────────────────
export async function getChangelog(limit = 40) {
  try {
    const rows = await db
      .select()
      .from(whimseyChangelog)
      .orderBy(whimseyChangelog.createdAt)
      .limit(limit);
    return rows.reverse();
  } catch (err: any) {
    logger.error({ err }, "Failed to fetch changelog");
    return [];
  }
}
