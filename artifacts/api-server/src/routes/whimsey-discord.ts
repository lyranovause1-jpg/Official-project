import { Router } from "express";

const router = Router();

export const GUILD_ID = "1495034928801382411";
export const DISCORD_BASE = "https://discord.com/api/v10";

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

export async function dget(path: string) {
  const r = await fetch(DISCORD_BASE + path, { headers: discordAuth() });
  return r.json();
}

export async function dpost(path: string, body: unknown) {
  const r = await fetch(DISCORD_BASE + path, {
    method: "POST",
    headers: { ...discordAuth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function dpatch(path: string, body: unknown) {
  const r = await fetch(DISCORD_BASE + path, {
    method: "PATCH",
    headers: { ...discordAuth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function ddel(path: string) {
  const r = await fetch(DISCORD_BASE + path, { method: "DELETE", headers: discordAuth() });
  return r.status === 204 ? { success: true } : r.json();
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

    const EXPECTED = ["Carl-bot", "Auth", "Collab.Land", "Ticket Tool", "WHIMSEY AI"];
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
  const limit = Math.min(parseInt(req.query.limit as string || "30", 10), 50);
  try {
    const raw = await dget(`/guilds/${GUILD_ID}/channels`);
    if (!Array.isArray(raw)) {
      res.status(500).json({ ok: false, error: "Could not fetch channels" });
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
