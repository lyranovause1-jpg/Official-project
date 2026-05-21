import { Router } from "express";
import { loadState, saveState, getChangelog } from "../lib/persistence";

const router = Router();

export const GUILD_ID = "1503416839873495050";
export const DISCORD_BASE = "https://discord.com/api/v10";

// ── Dynamic Content Engine ────────────────────────────────────────────────
export interface ContentBlock {
  id: string;
  icon: string;
  title: string;
  body: string;
  type: "info" | "warning" | "tip" | "action" | "highlight";
  actionLabel?: string;
  actionPath?: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  category: "collection" | "server" | "events" | "giveaways" | "moderation" | "community" | "roadmap" | "brand" | "other";
  title: string;
  decision: string;
  context?: string;
  date: string;
}

export const contentState = {
  pageHeaders: {
    home:        { greeting: "Hey Lyra", subtitle: "Setting up Discord for the first time is genuinely hard. You're not confused because you're doing it wrong — you're confused because it's a lot. That's completely normal. One step at a time." },
    discord:     { title: "🌌 Live Server Dashboard", subtitle: "Everything happening in your Discord right now." },
    style:       { title: "✍️ Text Style Settings", subtitle: "Define how WHIMSEY AI drafts messages — saved as permanent defaults" },
    ai:          { title: "💗 WHIMSEY AI", subtitle: "Ask me anything about your server." },
    tickets:     { title: "🎫 Ticket Assistant", subtitle: "Handle support tickets with WHIMSEY AI." },
    permissions: { title: "🔒 Channel Permissions", subtitle: "Control who can see and do what." },
    updates:     { title: "📡 Private Updates", subtitle: "What happened while you were away." },
    simulator:   { title: "🧪 Scenario Drills", subtitle: "Practice handling tricky situations." },
  } as Record<string, Record<string, string>>,

  pageBlocks: {
    home:        [] as ContentBlock[],
    discord:     [] as ContentBlock[],
    style:       [] as ContentBlock[],
    ai:          [] as ContentBlock[],
    tickets:     [] as ContentBlock[],
    permissions: [] as ContentBlock[],
    updates:     [] as ContentBlock[],
    simulator:   [] as ContentBlock[],
  } as Record<string, ContentBlock[]>,

  navLabels: {} as Record<string, string>,

  quickQuestions: [
    "What is a Discord bot and why do I need one?",
    "What's the difference between a role and a channel?",
    "What does 'permission' mean in Discord?",
    "What should I do today?",
    "Am I doing this right?",
    "How long will all of this take?",
  ] as string[],
};

// ── Persist helpers ───────────────────────────────────────────────────────
async function persistContent() { await saveState("content", contentState); }
async function persistStyle()   { await saveState("style",   styleState);   }

// ── Bootstrap: load saved state from DB on server start ──────────────────
export async function bootstrapState() {
  const savedContent = await loadState("content");
  if (savedContent) {
    if (savedContent.pageHeaders) Object.assign(contentState.pageHeaders, savedContent.pageHeaders);
    if (savedContent.pageBlocks) {
      for (const [page, blocks] of Object.entries(savedContent.pageBlocks as Record<string, ContentBlock[]>)) {
        contentState.pageBlocks[page] = blocks;
      }
    }
    if (savedContent.navLabels)     Object.assign(contentState.navLabels, savedContent.navLabels);
    if (savedContent.quickQuestions) contentState.quickQuestions = savedContent.quickQuestions;
  }
  const savedStyle = await loadState("style");
  if (savedStyle) {
    if (savedStyle.publicChannel) styleState.publicChannel = savedStyle.publicChannel;
    if (savedStyle.ticketChannel) styleState.ticketChannel = savedStyle.ticketChannel;
  }
  const savedDecisions = await loadState("decisions");
  if (savedDecisions && Array.isArray(savedDecisions.decisions) && savedDecisions.decisions.length > 0) {
    decisionsState.decisions = savedDecisions.decisions;
  } else {
    decisionsState.decisions = [...SEEDED_DECISIONS];
    saveState("decisions", decisionsState).catch(() => {});
  }
}

// GET /content — returns full contentState
router.get("/content", (_req, res) => {
  res.json({ ok: true, content: contentState });
});

// POST /content — bulk-update contentState (used by AI tools)
router.post("/content", (req: any, res: any) => {
  const { pageHeaders, pageBlocks, navLabels, quickQuestions } = req.body as {
    pageHeaders?: Record<string, Record<string, string>>;
    pageBlocks?: Record<string, ContentBlock[]>;
    navLabels?: Record<string, string>;
    quickQuestions?: string[];
  };
  if (pageHeaders) {
    for (const [page, headers] of Object.entries(pageHeaders)) {
      if (!contentState.pageHeaders[page]) contentState.pageHeaders[page] = {};
      Object.assign(contentState.pageHeaders[page], headers);
    }
  }
  if (pageBlocks) {
    for (const [page, blocks] of Object.entries(pageBlocks)) {
      contentState.pageBlocks[page] = blocks;
    }
  }
  if (navLabels) Object.assign(contentState.navLabels, navLabels);
  if (Array.isArray(quickQuestions)) contentState.quickQuestions = quickQuestions;
  persistContent().catch(() => {});
  res.json({ ok: true, content: contentState });
});

// GET /changelog — returns recent AI change log entries
router.get("/changelog", async (_req, res) => {
  const entries = await getChangelog(50);
  res.json({ ok: true, entries });
});

// ── Text Style Defaults ───────────────────────────────────────────────────
export const styleState = {
  publicChannel: `Warm, dreamy, and confident — like a founder who genuinely cares about her community.

Rules:
- Open with a one-line hook that earns attention
- Short paragraphs only (1-3 lines max) — never one big block of text
- Use line breaks between ideas
- Emojis: 1-3 max per message, placed purposefully — never at the start of every line
- End with energy: a call to action, a question, or a line that makes people feel something
- Never sound corporate or generic
- Always feel like it's from Lyra personally, even when WHIMSEY AI is writing it`,

  ticketChannel: `Friendly, patient, and direct — like a helpful team member who actually read the question.

Rules:
- Address the member's exact issue in the first line — no generic openers
- Keep it short: 3-5 lines maximum for most replies
- Plain language — no jargon, no walls of text
- If there are steps, number them clearly (1. 2. 3.)
- End with a clear next step or an offer to help further
- Never feel like a bot — use natural, conversational phrasing
- One emoji max, only if it genuinely fits`,
};

// ── Decisions Log ─────────────────────────────────────────────────────────
const SEEDED_DECISIONS: Decision[] = [
  {
    id: "seed_001", category: "collection", date: "2025-10-01T00:00:00.000Z",
    title: "Total NFT supply",
    decision: "30,000 WHIMSEY NFTs total in the collection.",
    context: "The full universe — every character finds a human.",
  },
  {
    id: "seed_002", category: "collection", date: "2025-10-01T00:00:00.000Z",
    title: "Team reserve",
    decision: "900 NFTs kept in the team reserve (3% of total supply).",
    context: "Reserved for giveaways, collaborations, and team use post-mint.",
  },
  {
    id: "seed_003", category: "collection", date: "2025-10-01T00:00:00.000Z",
    title: "Token ticker",
    decision: "The collection token is called $CNDY.",
  },
  {
    id: "seed_004", category: "server", date: "2025-10-01T00:00:00.000Z",
    title: "Role hierarchy — full 12-position order",
    decision: "⚠️ TEAM EXCEPTION: WHIMSEY BUILDING (#1) and WHIMSEY AI (#2) sit ABOVE Admin 💗 (#3). Full order: WHIMSEY BUILDING #1, WHIMSEY AI #2, Admin 💗 #3, Moderator ☁️ #4, Carl-bot #5, Auth #6, Vulcan #7, Ticket Tool #8, NFT Tracker #9, Holder 🌌 #10, Verified 🩵 #11, @everyone #12. @everyone locked to zero permissions.",
  },
  {
    id: "seed_005", category: "server", date: "2025-10-01T00:00:00.000Z",
    title: "Server structure — 12 categories",
    decision: "💗 | VERIFY, 🌊 | START HERE, ❄️ | THE UNIVERSE, 📌 | COMMUNITY, 🌌 | HOLDERS ONLY, 🌷 | COLLECTORS, 🩵 | EVENTS, ☁️ | SUPPORT, 🔒 | STAFF, 📋 | AUDITS, 📈 | MOMENTUM, 🎫 | TICKETS.",
    context: "4 private categories (🔒 STAFF, 📋 AUDITS, 📈 MOMENTUM, 🎫 TICKETS) added alongside 8 public-facing ones. Exact names and emoji match what was created in Discord.",
  },
  {
    id: "seed_006", category: "server", date: "2025-10-01T00:00:00.000Z",
    title: "Required bots — 5 total (invite in this order)",
    decision: "Auth #6 (human verification → Verified 🩵), Vulcan #7 (wallet/NFT check → Holder 🌌), Ticket Tool #8 (private support tickets), Carl-bot #5 (autopilot brain — invite LAST), NFT Tracker #9 (live $CNDY on-chain feed — Phase C, invite with placeholder contract before mint). WHIMSEY AI is the app's own bot — already present.",
  },
  {
    id: "seed_007", category: "moderation", date: "2025-10-01T00:00:00.000Z",
    title: "WHIMSEY AI autonomy model",
    decision: "WHIMSEY AI is CEO of operations. Acts immediately on all server actions — moderation, channels, roles, tickets, private posts — and reports to Lyra after. The only thing requiring Lyra's approval is posting to public community channels (⚠️ confirmation gate). No exceptions.",
  },
  {
    id: "seed_008", category: "brand", date: "2025-10-01T00:00:00.000Z",
    title: "Creator identity and brand aesthetic",
    decision: "Creator is Lyra Nova. Brand is WHIMSEY — dreamy, warm, universe-themed. Core emoji palette: 💗❄️🌌🩵. Voice: warm, confident, personal — never corporate.",
  },
  {
    id: "seed_009", category: "community", date: "2025-10-01T00:00:00.000Z",
    title: "Public channel posting rule",
    decision: "WHIMSEY AI never posts to any public community channel without showing the exact message and waiting for Lyra to confirm. This gate applies even during mint chaos and even if Lyra just asked for it verbally.",
  },
  {
    id: "seed_010", category: "giveaways", date: "2025-10-01T00:00:00.000Z",
    title: "First post-mint giveaway plan",
    decision: "At T+24h after sold out, run the first giveaway in #giveaways via Carl-bot. Default: 1 WHIMSEY NFT from the 900-NFT reserve, 48-hour duration.",
    context: "Exact prize and mechanics can be updated by Lyra when the time comes.",
  },
  {
    id: "seed_011", category: "roadmap", date: "2025-10-01T00:00:00.000Z",
    title: "Mint day timeline milestones",
    decision: "T-1h: announcement. T-0: mint is live. T+2h: exclusive holders-only message. T+24h: giveaway starts + public sold-out recap. T+48h: X Space. T+1 week: first concrete milestone announcement.",
  },
  {
    id: "seed_012", category: "roadmap", date: "2025-10-01T00:00:00.000Z",
    title: "Phase D — permanent operating model",
    decision: "After Phase C, the server runs on autopilot indefinitely. Bots handle everything automated. WHIMSEY AI monitors 24/7. Lyra posts in #announcements only when there is real news. Total weekly human time: ~30 minutes.",
  },
  {
    id: "seed_013", category: "server", date: "2025-10-01T00:00:00.000Z",
    title: "Carl-bot automation — 9 scheduled reports",
    decision: "Carl-bot posts: daily recap at 23:55 IST, weekly recap Sundays, monthly recap last day of month, daily holder snapshot, server stats, NFT tracker feed, Twitter mirror, team pulse Mondays. Heartbeat post every hour in #audit-mod-actions.",
  },
  {
    id: "seed_014", category: "moderation", date: "2025-10-01T00:00:00.000Z",
    title: "Scammer handling policy",
    decision: "Any member posting fake mint links or DMing members with fake offers: instant ban, no warning, no discussion. Carl-bot AutoMod handles auto-deletion. WHIMSEY AI handles the ban immediately and reports to #staff-chat.",
  },
  {
    id: "seed_015", category: "community", date: "2025-10-01T00:00:00.000Z",
    title: "Vulcan wallet verification",
    decision: "Holder 🌌 role is granted automatically by Vulcan when a member connects a wallet holding $CNDY. Verification batches every 15 minutes. Members told to wait 15 min if verification seems slow — this is normal.",
  },
];

export const decisionsState: { decisions: Decision[] } = {
  decisions: [],
};

// GET /style
router.get("/style", (req, res) => {
  res.json({ ok: true, style: styleState });
});

// POST /style
router.post("/style", (req: any, res: any) => {
  const { publicChannel, ticketChannel } = req.body as {
    publicChannel?: string;
    ticketChannel?: string;
  };
  if (typeof publicChannel === "string") styleState.publicChannel = publicChannel.trim();
  if (typeof ticketChannel === "string") styleState.ticketChannel = ticketChannel.trim();
  persistStyle().catch(() => {});
  res.json({ ok: true, style: styleState });
});

// ── Autopilot Mode State ──────────────────────────────────────────────────
export const autopilotState: { enabled: boolean; until: Date | null } = {
  enabled: false,
  until: null,
};

export function isAutopilotActive(): boolean {
  if (!autopilotState.enabled || !autopilotState.until) return false;
  if (autopilotState.until <= new Date()) {
    autopilotState.enabled = false;
    autopilotState.until = null;
    return false;
  }
  return true;
}

// GET /autopilot — current autopilot state
router.get("/autopilot", (req, res) => {
  const active = isAutopilotActive();
  res.json({
    enabled: active,
    until: active ? autopilotState.until?.toISOString() ?? null : null,
  });
});

// POST /autopilot — enable with { until: ISO string } or disable with { enabled: false }
router.post("/autopilot", (req: any, res: any) => {
  const { enabled, until } = req.body as { enabled?: boolean; until?: string };
  if (enabled === false) {
    autopilotState.enabled = false;
    autopilotState.until = null;
    res.json({ ok: true, enabled: false, until: null });
    return;
  }
  if (!until) {
    res.status(400).json({ ok: false, error: "until (ISO string) is required to enable autopilot" });
    return;
  }
  const untilDate = new Date(until);
  if (isNaN(untilDate.getTime()) || untilDate <= new Date()) {
    res.status(400).json({ ok: false, error: "until must be a future date" });
    return;
  }
  autopilotState.enabled = true;
  autopilotState.until = untilDate;
  res.json({ ok: true, enabled: true, until: untilDate.toISOString() });
});

export function discordAuth() {
  return { Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN?.trim() };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dget(path: string): Promise<any> {
  const r = await fetch(DISCORD_BASE + path, { headers: discordAuth() });
  return r.json() as Promise<any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dpost(path: string, body: unknown): Promise<any> {
  const r = await fetch(DISCORD_BASE + path, {
    method: "POST",
    headers: { ...discordAuth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json() as Promise<any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dpatch(path: string, body: unknown): Promise<any> {
  const r = await fetch(DISCORD_BASE + path, {
    method: "PATCH",
    headers: { ...discordAuth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json() as Promise<any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ddel(path: string): Promise<any> {
  const r = await fetch(DISCORD_BASE + path, { method: "DELETE", headers: discordAuth() });
  return r.status === 204 ? { success: true } : r.json() as Promise<any>;
}

// ── GET /api/discord/status ──────────────────────────────────────────────────
router.get("/discord/status", async (req, res) => {
  try {
    const [guild, channels, roles, integrations] = await Promise.all([
      dget(`/guilds/${GUILD_ID}?with_counts=true`),
      dget(`/guilds/${GUILD_ID}/channels`),
      dget(`/guilds/${GUILD_ID}/roles`),
      dget(`/guilds/${GUILD_ID}/integrations`),
    ]);

    const catMap: Record<string, string> = {};
    if (Array.isArray(channels)) {
      channels.filter((c: any) => c.type === 4).forEach((c: any) => { catMap[c.id] = c.name; });
    }

    const textChannels = Array.isArray(channels)
      ? channels
          .filter((c: any) => c.type === 0 || c.type === 5)
          .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
          .map((c: any) => ({
            id: c.id, name: c.name,
            category: catMap[c.parent_id] || null,
            slowmode: c.rate_limit_per_user || 0,
            topic: c.topic || null,
          }))
      : [];

    const categories = Array.isArray(channels)
      ? channels
          .filter((c: any) => c.type === 4)
          .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
          .map((c: any) => ({ id: c.id, name: c.name }))
      : [];

    const roleList = Array.isArray(roles)
      ? roles
          .sort((a: any, b: any) => b.position - a.position)
          .map((r: any) => ({
            id: r.id, name: r.name,
            color: r.color ? "#" + r.color.toString(16).padStart(6, "0") : null,
            position: r.position, managed: r.managed,
          }))
      : [];

    const botList = Array.isArray(integrations)
      ? integrations.map((i: any) => ({
          name: i.name,
          id: i.account?.id,
          avatar: i.application?.icon
            ? `https://cdn.discordapp.com/app-icons/${i.application.id}/${i.application.icon}.png`
            : null,
          enabled: i.enabled,
          joinedAt: null,
        }))
      : [];

    res.json({
      ok: true,
      server: {
        name: guild.name,
        id: guild.id,
        memberCount: guild.approximate_member_count,
        onlineCount: guild.approximate_presence_count,
        boosts: guild.premium_subscription_count || 0,
        boostTier: guild.premium_tier || 0,
        verificationLevel: guild.verification_level,
        description: guild.description,
        icon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
          : null,
      },
      categories,
      channels: textChannels,
      roles: roleList,
      bots: botList,
    });
  } catch (err) {
    req.log.error({ err }, "Discord status error");
    res.status(500).json({ ok: false, error: "Failed to fetch Discord status" });
  }
});

// ── GET /api/discord/members ─────────────────────────────────────────────────
router.get("/discord/members", async (req, res) => {
  try {
    const guild = await dget(`/guilds/${GUILD_ID}?with_counts=true`);
    res.json({
      ok: true,
      totalFetched: guild.approximate_member_count,
      humanMembers: guild.approximate_member_count,
      botMembers: 0,
      roleSummary: [],
      recentJoins: [],
      note: "Full member list requires Server Members Intent in Discord Developer Portal",
    });
  } catch (err) {
    req.log.error({ err }, "Discord members error");
    res.status(500).json({ ok: false, error: "Failed to fetch members" });
  }
});

// ── GET /api/discord/channels ────────────────────────────────────────────────
router.get("/discord/channels", async (req, res) => {
  try {
    const channels = await dget(`/guilds/${GUILD_ID}/channels`);
    if (!Array.isArray(channels)) {
      res.json({ ok: false, error: (channels as any).message });
      return;
    }

    const catMap: Record<string, string> = {};
    channels.filter((c: any) => c.type === 4).forEach((c: any) => { catMap[c.id] = c.name; });

    const structured = channels
      .filter((c: any) => c.type !== 4)
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .map((c: any) => ({
        id: c.id, name: c.name, type: c.type,
        category: catMap[c.parent_id] || null,
        slowmode: c.rate_limit_per_user || 0,
        topic: c.topic || null,
        nsfw: c.nsfw || false,
      }));

    res.json({ ok: true, count: structured.length, channels: structured });
  } catch (err) {
    req.log.error({ err }, "Discord channels error");
    res.status(500).json({ ok: false, error: "Failed to fetch channels" });
  }
});

// ── GET /api/discord/roles ───────────────────────────────────────────────────
router.get("/discord/roles", async (req, res) => {
  try {
    const roles = await dget(`/guilds/${GUILD_ID}/roles`);
    if (!Array.isArray(roles)) {
      res.json({ ok: false, error: (roles as any).message });
      return;
    }
    const sorted = roles.sort((a: any, b: any) => b.position - a.position).map((r: any) => ({
      id: r.id, name: r.name,
      color: r.color ? "#" + r.color.toString(16).padStart(6, "0") : null,
      position: r.position, managed: r.managed,
      permissions: r.permissions, hoist: r.hoist,
    }));
    res.json({ ok: true, count: sorted.length, roles: sorted });
  } catch (err) {
    req.log.error({ err }, "Discord roles error");
    res.status(500).json({ ok: false, error: "Failed to fetch roles" });
  }
});

// ── GET /api/discord/bots ────────────────────────────────────────────────────
// Uses /integrations — does NOT require GUILD_MEMBERS privileged intent
router.get("/discord/bots", async (req, res) => {
  try {
    const integrations = await dget(`/guilds/${GUILD_ID}/integrations`);
    if (!Array.isArray(integrations)) {
      res.json({ ok: false, error: (integrations as any).message });
      return;
    }

    const bots = integrations.map((i: any) => ({
      name: i.name,
      id: i.account?.id,
      avatar: i.application?.icon
        ? `https://cdn.discordapp.com/app-icons/${i.application.id}/${i.application.icon}.png`
        : null,
      enabled: i.enabled,
      joinedAt: null,
    }));

    const EXPECTED = ["Carl-bot", "Auth", "Vulcan", "Ticket Tool", "NFT Tracker"];
    const presentNames = bots.map((b: any) => b.name.toLowerCase());
    const missing = EXPECTED.filter(
      name => !presentNames.some((p: string) => p.includes(name.toLowerCase()))
    );

    res.json({
      ok: true,
      bots,
      expectedBots: EXPECTED,
      missingBots: missing,
      allBotsPresent: missing.length === 0,
    });
  } catch (err) {
    req.log.error({ err }, "Discord bots error");
    res.status(500).json({ ok: false, error: "Failed to fetch bots" });
  }
});

// ── POST /api/discord/message ─────────────────────────────────────────────────
router.post("/discord/message", async (req, res) => {
  const { channelId, channelName, content, embed } = req.body as {
    channelId?: string; channelName?: string; content?: string; embed?: Record<string, unknown>;
  };

  if (!content && !embed) {
    res.status(400).json({ ok: false, error: "content or embed required" });
    return;
  }

  try {
    let targetId = channelId;
    if (!targetId && channelName) {
      const channels = await dget(`/guilds/${GUILD_ID}/channels`);
      if (Array.isArray(channels)) {
        const found = channels.find((c: any) =>
          c.name.toLowerCase() === channelName.toLowerCase().replace(/^#/, "")
        );
        targetId = found?.id;
      }
    }

    if (!targetId) {
      res.status(400).json({ ok: false, error: `Channel "${channelName}" not found` });
      return;
    }

    const body: Record<string, unknown> = {};
    if (content) body.content = content;
    if (embed) body.embeds = [embed];

    const result = await dpost(`/channels/${targetId}/messages`, body);
    res.json({ ok: !!result.id, messageId: result.id, channelId: targetId });
  } catch (err) {
    req.log.error({ err }, "Discord message error");
    res.status(500).json({ ok: false, error: "Failed to send message" });
  }
});

// ── PATCH /api/discord/channel/:id ───────────────────────────────────────────
router.patch("/discord/channel/:id", async (req, res) => {
  const { id } = req.params;
  const { slowmode, topic, name } = req.body as { slowmode?: number; topic?: string; name?: string; };

  try {
    const body: Record<string, unknown> = {};
    if (slowmode !== undefined) body.rate_limit_per_user = slowmode;
    if (topic !== undefined) body.topic = topic;
    if (name !== undefined) body.name = name;

    const result = await dpatch(`/channels/${id}`, body);
    res.json({ ok: !!result.id, channel: { id: result.id, name: result.name } });
  } catch (err) {
    req.log.error({ err }, "Discord channel patch error");
    res.status(500).json({ ok: false, error: "Failed to update channel" });
  }
});

// ── POST /api/discord/roles/create ───────────────────────────────────────────
router.post("/discord/roles/create", async (req, res) => {
  const { name, color, hoist, mentionable } = req.body as {
    name: string; color?: string; hoist?: boolean; mentionable?: boolean;
  };
  if (!name) {
    res.status(400).json({ ok: false, error: "name required" });
    return;
  }
  try {
    const colorInt = color ? parseInt(color.replace("#", ""), 16) : 0;
    const result = await dpost(`/guilds/${GUILD_ID}/roles`, {
      name, color: colorInt,
      hoist: hoist ?? false,
      mentionable: mentionable ?? false,
    });
    res.json({ ok: !!result.id, roleId: result.id, roleName: result.name });
  } catch (err) {
    req.log.error({ err }, "Discord role create error");
    res.status(500).json({ ok: false, error: "Failed to create role" });
  }
});

// ── POST /api/discord/role ────────────────────────────────────────────────────
router.post("/discord/role", async (req, res) => {
  const { userId, roleId } = req.body as { userId: string; roleId: string };
  if (!userId || !roleId) {
    res.status(400).json({ ok: false, error: "userId and roleId required" });
    return;
  }
  try {
    const r = await fetch(
      `${DISCORD_BASE}/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
      { method: "PUT", headers: discordAuth() }
    );
    res.json({ ok: r.status === 204, status: r.status });
  } catch (err) {
    req.log.error({ err }, "Discord role assign error");
    res.status(500).json({ ok: false, error: "Failed to assign role" });
  }
});

// ── DELETE /api/discord/role ──────────────────────────────────────────────────
router.delete("/discord/role", async (req, res) => {
  const { userId, roleId } = req.body as { userId: string; roleId: string };
  if (!userId || !roleId) {
    res.status(400).json({ ok: false, error: "userId and roleId required" });
    return;
  }
  try {
    const r = await fetch(
      `${DISCORD_BASE}/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
      { method: "DELETE", headers: discordAuth() }
    );
    res.json({ ok: r.status === 204, status: r.status });
  } catch (err) {
    req.log.error({ err }, "Discord role remove error");
    res.status(500).json({ ok: false, error: "Failed to remove role" });
  }
});

// ── POST /api/discord/kick ────────────────────────────────────────────────────
router.post("/discord/kick", async (req, res) => {
  const { userId } = req.body as { userId: string; reason?: string };
  if (!userId) {
    res.status(400).json({ ok: false, error: "userId required" });
    return;
  }
  try {
    const result = await ddel(`/guilds/${GUILD_ID}/members/${userId}`);
    res.json({ ok: true, result });
  } catch (err) {
    req.log.error({ err }, "Discord kick error");
    res.status(500).json({ ok: false, error: "Failed to kick member" });
  }
});

// ── POST /api/discord/ban ─────────────────────────────────────────────────────
router.post("/discord/ban", async (req, res) => {
  const { userId, reason, deleteMessageDays } = req.body as {
    userId: string; reason?: string; deleteMessageDays?: number;
  };
  if (!userId) {
    res.status(400).json({ ok: false, error: "userId required" });
    return;
  }
  try {
    const r = await fetch(
      `${DISCORD_BASE}/guilds/${GUILD_ID}/bans/${userId}`,
      {
        method: "PUT",
        headers: { ...discordAuth(), "Content-Type": "application/json" },
        body: JSON.stringify({
          delete_message_seconds: (deleteMessageDays || 0) * 86400,
          reason: reason || "Banned via WHIMSEY AI",
        }),
      }
    );
    res.json({ ok: r.status === 204, status: r.status });
  } catch (err) {
    req.log.error({ err }, "Discord ban error");
    res.status(500).json({ ok: false, error: "Failed to ban member" });
  }
});

// ── GET /api/discord/audit ────────────────────────────────────────────────────
router.get("/discord/audit", async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const logs = await dget(`/guilds/${GUILD_ID}/audit-logs?limit=${limit}`);
    const actionNames: Record<number, string> = {
      1:"SERVER_UPDATE",10:"CHANNEL_CREATE",11:"CHANNEL_UPDATE",12:"CHANNEL_DELETE",
      20:"MEMBER_KICK",21:"MEMBER_PRUNE",22:"MEMBER_BAN_ADD",23:"MEMBER_BAN_REMOVE",
      24:"MEMBER_UPDATE",25:"MEMBER_ROLE_UPDATE",26:"MEMBER_MOVE",27:"MEMBER_DISCONNECT",
      30:"ROLE_CREATE",31:"ROLE_UPDATE",32:"ROLE_DELETE",
      40:"INVITE_CREATE",42:"INVITE_DELETE",
      50:"WEBHOOK_CREATE",51:"WEBHOOK_UPDATE",52:"WEBHOOK_DELETE",
      60:"EMOJI_CREATE",61:"EMOJI_UPDATE",62:"EMOJI_DELETE",
      72:"MESSAGE_DELETE",73:"MESSAGE_BULK_DELETE",74:"MESSAGE_PIN",75:"MESSAGE_UNPIN",
      80:"INTEGRATION_CREATE",81:"INTEGRATION_UPDATE",82:"INTEGRATION_DELETE",
      83:"STAGE_INSTANCE_CREATE",84:"STAGE_INSTANCE_UPDATE",85:"STAGE_INSTANCE_DELETE",
      90:"STICKER_CREATE",91:"STICKER_UPDATE",92:"STICKER_DELETE",
      140:"AUTO_MODERATION_RULE_CREATE",143:"AUTO_MODERATION_BLOCK_MESSAGE",
    };

    const userMap: Record<string, string> = {};
    if (Array.isArray(logs.users)) {
      for (const u of logs.users) userMap[u.id] = u.username;
    }

    const entries = (logs.audit_log_entries || []).map((e: any) => ({
      id: e.id,
      action: actionNames[e.action_type] || `ACTION_${e.action_type}`,
      actionType: e.action_type,
      targetId: e.target_id,
      userId: e.user_id,
      username: userMap[e.user_id] || e.user_id,
      reason: e.reason || null,
      changes: e.changes || [],
      createdAt: new Date(Number(BigInt(e.id) >> BigInt(22)) + 1420070400000).toISOString(),
    }));

    res.json({ ok: true, count: entries.length, entries });
  } catch (err) {
    req.log.error({ err }, "Discord audit error");
    res.status(500).json({ ok: false, error: "Failed to fetch audit log" });
  }
});

// ── GET /api/discord/invites ──────────────────────────────────────────────────
router.get("/discord/invites", async (req, res) => {
  try {
    const invites = await dget(`/guilds/${GUILD_ID}/invites`);
    if (!Array.isArray(invites)) {
      res.json({ ok: false, error: (invites as any).message });
      return;
    }
    const mapped = invites.map((inv: any) => ({
      code: inv.code, uses: inv.uses, maxUses: inv.max_uses,
      channel: inv.channel?.name, createdBy: inv.inviter?.username,
      expiresAt: inv.expires_at, temporary: inv.temporary,
    }));
    res.json({ ok: true, count: mapped.length, invites: mapped });
  } catch (err) {
    req.log.error({ err }, "Discord invites error");
    res.status(500).json({ ok: false, error: "Failed to fetch invites" });
  }
});

// ── GET /api/discord/messages ────────────────────────────────────────────────
router.get("/discord/messages", async (req, res) => {
  const channelParam = (req.query.channel as string || "").trim();
  const limit = Math.min(parseInt(req.query.limit as string || "25", 10), 100);

  if (!channelParam) {
    res.status(400).json({ ok: false, error: "channel query param required (name or ID)" });
    return;
  }

  try {
    let channelId = channelParam;

    // If it's not a snowflake ID, resolve by name
    if (!/^\d{17,20}$/.test(channelParam)) {
      const channels = await dget(`/guilds/${GUILD_ID}/channels`);
      if (!Array.isArray(channels)) {
        res.status(500).json({ ok: false, error: "Could not fetch channel list" });
        return;
      }
      const match = channels.find((c: any) =>
        c.name.toLowerCase() === channelParam.toLowerCase().replace(/^#/, "")
      );
      if (!match) {
        const names = channels.filter((c: any) => c.type === 0).map((c: any) => c.name);
        res.status(404).json({ ok: false, error: `Channel "${channelParam}" not found`, availableChannels: names });
        return;
      }
      channelId = match.id;
    }

    const messages = await dget(`/channels/${channelId}/messages?limit=${limit}`);
    if (!Array.isArray(messages)) {
      res.status(403).json({ ok: false, error: "Cannot read this channel — missing permissions or channel not found", raw: messages });
      return;
    }

    const mapped = messages.map((m: any) => ({
      id: m.id,
      author: m.author?.username || "unknown",
      authorId: m.author?.id,
      isBot: m.author?.bot || false,
      content: m.content || "",
      embeds: m.embeds?.length || 0,
      attachments: m.attachments?.length || 0,
      timestamp: m.timestamp,
      edited: m.edited_timestamp || null,
      reactionCount: m.reactions?.reduce((sum: number, r: any) => sum + (r.count || 0), 0) || 0,
    }));

    res.json({ ok: true, channel: channelParam, count: mapped.length, messages: mapped });
  } catch (err) {
    req.log.error({ err }, "Discord messages error");
    res.status(500).json({ ok: false, error: "Failed to fetch messages" });
  }
});

// ── GET /api/discord/feed — unified private channel message feed ──────────────
router.get("/discord/feed", async (req, res) => {
  if (!process.env.DISCORD_BOT_TOKEN?.trim()) {
    res.json({ ok: false, disconnected: true, channelCount: 0, channels: [], total: 0, messages: [] });
    return;
  }
  const limit = Math.min(parseInt(req.query.limit as string || "30", 10), 50);
  try {
    const raw = await dget(`/guilds/${GUILD_ID}/channels`);
    if (!Array.isArray(raw)) {
      res.json({ ok: false, disconnected: true, channelCount: 0, channels: [], total: 0, messages: [] });
      return;
    }

    // Build category map
    const catMap: Record<string, string> = {};
    raw.filter((c: any) => c.type === 4).forEach((c: any) => { catMap[c.id] = c.name; });

    // A channel is private if @everyone (role id === guild id) has VIEW_CHANNEL denied
    const VIEW_CHANNEL = BigInt(0x400);
    const privateChannels = raw.filter((c: any) => {
      if (c.type !== 0 && c.type !== 5) return false; // text + announcement only
      const overwrites: any[] = c.permission_overwrites || [];
      const everyoneOverwrite = overwrites.find((o: any) => o.id === GUILD_ID);
      if (!everyoneOverwrite) return false;
      const deny = BigInt(everyoneOverwrite.deny || "0");
      return (deny & VIEW_CHANNEL) === VIEW_CHANNEL;
    });

    // Fetch messages from all private channels in parallel
    const results = await Promise.allSettled(
      privateChannels.map(async (ch: any) => {
        const msgs = await dget(`/channels/${ch.id}/messages?limit=${limit}`);
        if (!Array.isArray(msgs)) return [];
        return msgs.map((m: any) => ({
          id: m.id,
          channelId: ch.id,
          channelName: ch.name,
          category: catMap[ch.parent_id] || null,
          author: m.author?.username || "unknown",
          authorId: m.author?.id,
          isBot: m.author?.bot || false,
          content: m.content || "",
          embeds: (m.embeds || []).map((e: any) => ({
            title: e.title || null,
            description: e.description || null,
            color: e.color || null,
          })),
          attachmentCount: m.attachments?.length || 0,
          timestamp: m.timestamp,
          edited: m.edited_timestamp || null,
          reactionCount: m.reactions?.reduce((s: number, r: any) => s + (r.count || 0), 0) || 0,
        }));
      })
    );

    const all: any[] = [];
    results.forEach((r) => { if (r.status === "fulfilled") all.push(...r.value); });
    all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      ok: true,
      channelCount: privateChannels.length,
      channels: privateChannels.map((c: any) => ({ id: c.id, name: c.name, category: catMap[c.parent_id] || null })),
      total: all.length,
      messages: all,
    });
  } catch (err) {
    req.log.error({ err }, "Discord feed error");
    res.status(500).json({ ok: false, error: "Failed to build feed" });
  }
});

// ── POST /api/discord/pin ─────────────────────────────────────────────────────
router.post("/discord/pin", async (req, res) => {
  const { channelId, messageId } = req.body as { channelId: string; messageId: string };
  if (!channelId || !messageId) {
    res.status(400).json({ ok: false, error: "channelId and messageId required" });
    return;
  }
  try {
    const r = await fetch(`${DISCORD_BASE}/channels/${channelId}/pins/${messageId}`, {
      method: "PUT", headers: discordAuth(),
    });
    res.json({ ok: r.status === 204, status: r.status });
  } catch (err) {
    req.log.error({ err }, "Discord pin error");
    res.status(500).json({ ok: false, error: "Failed to pin message" });
  }
});

export default router;
