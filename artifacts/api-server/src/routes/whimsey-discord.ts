import { Router } from "express";

const router = Router();

const GUILD_ID = "1495034928801382411";
const BASE = "https://discord.com/api/v10";

function auth() {
  return { Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN?.trim() };
}

async function dget(path: string) {
  const r = await fetch(BASE + path, { headers: auth() });
  return r.json();
}

async function dpost(path: string, body: unknown) {
  const r = await fetch(BASE + path, {
    method: "POST",
    headers: { ...auth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function dpatch(path: string, body: unknown) {
  const r = await fetch(BASE + path, {
    method: "PATCH",
    headers: { ...auth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function ddel(path: string) {
  const r = await fetch(BASE + path, { method: "DELETE", headers: auth() });
  return r.status === 204 ? { success: true } : r.json();
}

// ── GET /api/discord/status ──────────────────────────────────────────────────
// Full server health snapshot — members, channels, roles, bot statuses
router.get("/discord/status", async (req, res) => {
  try {
    const [guild, channels, roles, bots] = await Promise.all([
      dget(`/guilds/${GUILD_ID}?with_counts=true`),
      dget(`/guilds/${GUILD_ID}/channels`),
      dget(`/guilds/${GUILD_ID}/roles`),
      dget(`/guilds/${GUILD_ID}/members?limit=100`),
    ]);

    const textChannels = Array.isArray(channels)
      ? channels.filter((c: any) => c.type === 0).map((c: any) => ({
          id: c.id, name: c.name, parent_id: c.parent_id,
          slowmode: c.rate_limit_per_user || 0, topic: c.topic || null,
        }))
      : [];

    const categories = Array.isArray(channels)
      ? channels.filter((c: any) => c.type === 4).map((c: any) => ({
          id: c.id, name: c.name,
        }))
      : [];

    const roleList = Array.isArray(roles)
      ? roles.map((r: any) => ({
          id: r.id, name: r.name, color: r.color,
          position: r.position, managed: r.managed,
          memberCount: null,
        }))
      : [];

    const botMembers = Array.isArray(bots)
      ? bots.filter((m: any) => m.user?.bot).map((m: any) => ({
          username: m.user.username,
          id: m.user.id,
          roles: m.roles,
          joinedAt: m.joined_at,
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
      bots: botMembers,
    });
  } catch (err) {
    req.log.error({ err }, "Discord status error");
    res.status(500).json({ ok: false, error: "Failed to fetch Discord status" });
  }
});

// ── GET /api/discord/members ─────────────────────────────────────────────────
// Recent members + role counts
router.get("/discord/members", async (req, res) => {
  try {
    const members = await dget(`/guilds/${GUILD_ID}/members?limit=100`);
    const roles = await dget(`/guilds/${GUILD_ID}/roles`);

    if (!Array.isArray(members)) {
      res.json({ ok: false, error: (members as any).message });
      return;
    }

    const roleCounts: Record<string, number> = {};
    for (const m of members) {
      for (const rid of m.roles) {
        roleCounts[rid] = (roleCounts[rid] || 0) + 1;
      }
    }

    const roleMap: Record<string, string> = {};
    if (Array.isArray(roles)) {
      for (const r of roles) roleMap[r.id] = r.name;
    }

    const roleSummary = Object.entries(roleCounts).map(([id, count]) => ({
      id, name: roleMap[id] || id, count,
    })).sort((a, b) => b.count - a.count);

    res.json({
      ok: true,
      totalFetched: members.length,
      humanMembers: members.filter((m: any) => !m.user?.bot).length,
      botMembers: members.filter((m: any) => m.user?.bot).length,
      roleSummary,
      recentJoins: members
        .filter((m: any) => !m.user?.bot)
        .sort((a: any, b: any) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())
        .slice(0, 10)
        .map((m: any) => ({
          username: m.user.username,
          joinedAt: m.joined_at,
          roles: m.roles.map((rid: string) => roleMap[rid] || rid),
        })),
    });
  } catch (err) {
    req.log.error({ err }, "Discord members error");
    res.status(500).json({ ok: false, error: "Failed to fetch members" });
  }
});

// ── GET /api/discord/channels ────────────────────────────────────────────────
// All channels with their categories and slowmode
router.get("/discord/channels", async (req, res) => {
  try {
    const channels = await dget(`/guilds/${GUILD_ID}/channels`);
    if (!Array.isArray(channels)) {
      res.json({ ok: false, error: (channels as any).message });
      return;
    }

    const catMap: Record<string, string> = {};
    channels.filter((c: any) => c.type === 4).forEach((c: any) => {
      catMap[c.id] = c.name;
    });

    const structured = channels
      .filter((c: any) => c.type !== 4)
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
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
      permissions: r.permissions,
      hoist: r.hoist,
    }));
    res.json({ ok: true, count: sorted.length, roles: sorted });
  } catch (err) {
    req.log.error({ err }, "Discord roles error");
    res.status(500).json({ ok: false, error: "Failed to fetch roles" });
  }
});

// ── GET /api/discord/bots ────────────────────────────────────────────────────
router.get("/discord/bots", async (req, res) => {
  try {
    const members = await dget(`/guilds/${GUILD_ID}/members?limit=100`);
    if (!Array.isArray(members)) {
      res.json({ ok: false, error: (members as any).message });
      return;
    }
    const bots = members
      .filter((m: any) => m.user?.bot)
      .map((m: any) => ({
        username: m.user.username,
        id: m.user.id,
        discriminator: m.user.discriminator,
        avatar: m.user.avatar
          ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
          : null,
        joinedAt: m.joined_at,
        roles: m.roles,
      }));

    const expectedBots = ["Carl-bot", "Auth", "Collab.Land", "Ticket Tool", "WHIMSEY AI"];
    const present = bots.map((b: any) => b.username);
    const missing = expectedBots.filter(name =>
      !present.some((p: string) => p.toLowerCase().includes(name.toLowerCase()))
    );

    res.json({
      ok: true,
      bots,
      expectedBots,
      missingBots: missing,
      allBotsPresent: missing.length === 0,
    });
  } catch (err) {
    req.log.error({ err }, "Discord bots error");
    res.status(500).json({ ok: false, error: "Failed to fetch bots" });
  }
});

// ── POST /api/discord/message ─────────────────────────────────────────────────
// Send a message to any channel
router.post("/discord/message", async (req, res) => {
  const { channelId, channelName, content, embed } = req.body as {
    channelId?: string;
    channelName?: string;
    content?: string;
    embed?: Record<string, unknown>;
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
          c.name.toLowerCase() === channelName.toLowerCase().replace("#", "")
        );
        targetId = found?.id;
      }
    }

    if (!targetId) {
      res.status(400).json({ ok: false, error: "Channel not found" });
      return;
    }

    const body: Record<string, unknown> = {};
    if (content) body.content = content;
    if (embed) body.embeds = [embed];

    const result = await dpost(`/channels/${targetId}/messages`, body);
    res.json({ ok: true, messageId: result.id, channelId: targetId });
  } catch (err) {
    req.log.error({ err }, "Discord message error");
    res.status(500).json({ ok: false, error: "Failed to send message" });
  }
});

// ── PATCH /api/discord/channel/:id ───────────────────────────────────────────
// Edit a channel (slowmode, topic, name)
router.patch("/discord/channel/:id", async (req, res) => {
  const { id } = req.params;
  const { slowmode, topic, name } = req.body as {
    slowmode?: number;
    topic?: string;
    name?: string;
  };

  try {
    const body: Record<string, unknown> = {};
    if (slowmode !== undefined) body.rate_limit_per_user = slowmode;
    if (topic !== undefined) body.topic = topic;
    if (name !== undefined) body.name = name;

    const result = await dpatch(`/channels/${id}`, body);
    res.json({ ok: true, channel: { id: result.id, name: result.name } });
  } catch (err) {
    req.log.error({ err }, "Discord channel patch error");
    res.status(500).json({ ok: false, error: "Failed to update channel" });
  }
});

// ── POST /api/discord/role ────────────────────────────────────────────────────
// Assign a role to a member
router.post("/discord/role", async (req, res) => {
  const { userId, roleId } = req.body as { userId: string; roleId: string };
  if (!userId || !roleId) {
    res.status(400).json({ ok: false, error: "userId and roleId required" });
    return;
  }
  try {
    const result = await fetch(
      `${BASE}/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
      { method: "PUT", headers: auth() }
    );
    res.json({ ok: result.status === 204, status: result.status });
  } catch (err) {
    req.log.error({ err }, "Discord role assign error");
    res.status(500).json({ ok: false, error: "Failed to assign role" });
  }
});

// ── DELETE /api/discord/role ──────────────────────────────────────────────────
// Remove a role from a member
router.delete("/discord/role", async (req, res) => {
  const { userId, roleId } = req.body as { userId: string; roleId: string };
  if (!userId || !roleId) {
    res.status(400).json({ ok: false, error: "userId and roleId required" });
    return;
  }
  try {
    const result = await fetch(
      `${BASE}/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
      { method: "DELETE", headers: auth() }
    );
    res.json({ ok: result.status === 204, status: result.status });
  } catch (err) {
    req.log.error({ err }, "Discord role remove error");
    res.status(500).json({ ok: false, error: "Failed to remove role" });
  }
});

// ── POST /api/discord/kick ────────────────────────────────────────────────────
router.post("/discord/kick", async (req, res) => {
  const { userId, reason } = req.body as { userId: string; reason?: string };
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
    const result = await fetch(
      `${BASE}/guilds/${GUILD_ID}/bans/${userId}`,
      {
        method: "PUT",
        headers: { ...auth(), "Content-Type": "application/json" },
        body: JSON.stringify({
          delete_message_seconds: (deleteMessageDays || 0) * 86400,
          reason: reason || "Banned via WHIMSEY AI",
        }),
      }
    );
    res.json({ ok: result.status === 204, status: result.status });
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
      code: inv.code,
      uses: inv.uses,
      maxUses: inv.max_uses,
      channel: inv.channel?.name,
      createdBy: inv.inviter?.username,
      expiresAt: inv.expires_at,
      temporary: inv.temporary,
    }));
    res.json({ ok: true, count: mapped.length, invites: mapped });
  } catch (err) {
    req.log.error({ err }, "Discord invites error");
    res.status(500).json({ ok: false, error: "Failed to fetch invites" });
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
    const r = await fetch(`${BASE}/channels/${channelId}/pins/${messageId}`, {
      method: "PUT", headers: auth(),
    });
    res.json({ ok: r.status === 204, status: r.status });
  } catch (err) {
    req.log.error({ err }, "Discord pin error");
    res.status(500).json({ ok: false, error: "Failed to pin message" });
  }
});

export default router;
