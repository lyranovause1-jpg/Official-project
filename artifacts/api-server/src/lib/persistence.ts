import { db, whimseyContent, whimseyChangelog, whimseyMemory } from "@workspace/db";
import { eq, desc, gte, and, ilike, or } from "drizzle-orm";
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

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 WHIMSEY AI MEMORY SYSTEM — 7-Layer Permanent Memory Architecture
// ═══════════════════════════════════════════════════════════════════════════

export interface MemoryEntry {
  category: string;
  memoryType: string;
  subject: string;
  headline: string;
  content: string;
  importance?: number;
  tags?: string;
  sessionId?: string;
}

// ── Write a memory ─────────────────────────────────────────────────────────
export async function recordMemory(entry: MemoryEntry): Promise<{ id: number }> {
  try {
    const rows = await db
      .insert(whimseyMemory)
      .values({
        category:   entry.category,
        memoryType: entry.memoryType,
        subject:    entry.subject,
        headline:   entry.headline,
        content:    entry.content,
        importance: entry.importance ?? 5,
        tags:       entry.tags ?? null,
        sessionId:  entry.sessionId ?? null,
      })
      .returning({ id: whimseyMemory.id });
    return rows[0];
  } catch (err: any) {
    logger.error({ err }, "Failed to record memory");
    return { id: -1 };
  }
}

// ── Query memories ─────────────────────────────────────────────────────────
export async function recallMemories(options: {
  category?: string;
  memoryType?: string;
  subject?: string;
  minImportance?: number;
  limit?: number;
  search?: string;
  sessionId?: string;
} = {}): Promise<any[]> {
  try {
    const { category, memoryType, subject, minImportance, limit = 30, search, sessionId } = options;

    const conditions: any[] = [];
    if (category)      conditions.push(eq(whimseyMemory.category, category));
    if (memoryType)    conditions.push(eq(whimseyMemory.memoryType, memoryType));
    if (subject)       conditions.push(ilike(whimseyMemory.subject, `%${subject}%`));
    if (minImportance) conditions.push(gte(whimseyMemory.importance, minImportance));
    if (sessionId)     conditions.push(eq(whimseyMemory.sessionId, sessionId));
    if (search) {
      conditions.push(
        or(
          ilike(whimseyMemory.headline, `%${search}%`),
          ilike(whimseyMemory.content,  `%${search}%`),
          ilike(whimseyMemory.tags,     `%${search}%`),
          ilike(whimseyMemory.subject,  `%${search}%`),
        )
      );
    }

    const rows = await db
      .select()
      .from(whimseyMemory)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(whimseyMemory.importance), desc(whimseyMemory.createdAt))
      .limit(limit);

    return rows;
  } catch (err: any) {
    logger.error({ err }, "Failed to recall memories");
    return [];
  }
}

// ── Memory statistics ──────────────────────────────────────────────────────
export async function getMemoryStats(): Promise<Record<string, number>> {
  try {
    const rows = await db.select().from(whimseyMemory);
    const stats: Record<string, number> = { total: rows.length };
    for (const row of rows) {
      stats[row.category] = (stats[row.category] || 0) + 1;
    }
    return stats;
  } catch {
    return { total: 0 };
  }
}

// ── Recent high-importance memories ───────────────────────────────────────
export async function getRecentImportantMemories(limit = 20): Promise<any[]> {
  try {
    const rows = await db
      .select()
      .from(whimseyMemory)
      .where(gte(whimseyMemory.importance, 6))
      .orderBy(desc(whimseyMemory.createdAt))
      .limit(limit);
    return rows;
  } catch {
    return [];
  }
}

// ── Recent episodic memories (conversations) ───────────────────────────────
export async function getRecentEpisodicMemories(limit = 10): Promise<any[]> {
  try {
    const rows = await db
      .select()
      .from(whimseyMemory)
      .where(eq(whimseyMemory.category, "episodic"))
      .orderBy(desc(whimseyMemory.createdAt))
      .limit(limit);
    return rows;
  } catch {
    return [];
  }
}

// ── Build memory context block for system prompt injection ─────────────────
export async function getMemorySummaryForPrompt(): Promise<string> {
  try {
    const [stats, recentImportant, recentEpisodic] = await Promise.all([
      getMemoryStats(),
      getRecentImportantMemories(20),
      getRecentEpisodicMemories(8),
    ]);

    if (stats.total === 0) {
      return `## 🧠 MEMORY SYSTEM — ACTIVE
Total memories: 0 — this is your first session. Begin recording everything immediately.
---`;
    }

    const formatDate = (d: Date) =>
      new Date(d).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });

    const importantStr = recentImportant
      .map(m =>
        `  [${m.category}/${m.memoryType}] ★${m.importance} — ${m.headline} (${formatDate(m.createdAt)})`
      )
      .join("\n");

    const episodicStr = recentEpisodic
      .map(m =>
        `  ${formatDate(m.createdAt)} — ${m.headline}`
      )
      .join("\n");

    const categoryBreakdown = Object.entries(stats)
      .filter(([k]) => k !== "total")
      .map(([k, v]) => `${k}:${v}`)
      .join("  |  ");

    return `## 🧠 MEMORY SYSTEM — ACTIVE RECALL

**Total memories on record: ${stats.total}**
By category: ${categoryBreakdown}

### High-importance memories (★6+, most recent first):
${importantStr || "  (none yet)"}

### Recent conversations with Lyra:
${episodicStr || "  (none yet)"}

You remember all of this. It is part of you. Use these memories proactively — reference relevant ones without being asked. When Lyra mentions something from a previous conversation, you already know it.
---`;
  } catch (err: any) {
    logger.error({ err }, "Failed to build memory summary for prompt");
    return "";
  }
}
