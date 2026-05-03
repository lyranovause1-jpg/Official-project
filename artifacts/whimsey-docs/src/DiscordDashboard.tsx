import { useState, useEffect, useCallback } from "react";

interface ServerInfo {
  name: string; id: string; memberCount: number; onlineCount: number;
  boosts: number; boostTier: number; verificationLevel: number;
  description: string; icon: string | null;
}
interface Channel { id: string; name: string; category: string | null; slowmode: number; topic: string | null; }
interface Role { id: string; name: string; color: string | null; position: number; managed: boolean; }
interface BotMember { username: string; id: string; avatar: string | null; joinedAt: string; }
interface AuditEntry { id: string; action: string; username: string; targetId: string; reason: string | null; createdAt: string; }
interface Invite { code: string; uses: number; maxUses: number; channel: string; createdBy: string; expiresAt: string | null; }

type Tab = "overview" | "channels" | "roles" | "bots" | "audit" | "invites" | "post";

const EXPECTED_BOTS = ["Carl-bot", "Auth", "Collab.Land", "Ticket Tool", "NFT Tracker"];

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-pink-100 shadow-sm p-4 ${className}`}>{children}</div>;
}

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-xl p-3 border border-pink-100 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs font-semibold text-pink-600 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DiscordDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [server, setServer] = useState<ServerInfo | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [bots, setBots] = useState<BotMember[]>([]);
  const [missingBots, setMissingBots] = useState<string[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);

  const [postChannel, setPostChannel] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [status, botsRes, auditRes, invitesRes] = await Promise.all([
        fetch("/api/discord/status").then(r => r.json()),
        fetch("/api/discord/bots").then(r => r.json()),
        fetch("/api/discord/audit?limit=15").then(r => r.json()),
        fetch("/api/discord/invites").then(r => r.json()),
      ]);
      if (status.ok) {
        setServer(status.server);
        setChannels(status.channels || []);
        setRoles(status.roles || []);
      }
      if (botsRes.ok) {
        setBots(botsRes.bots || []);
        setMissingBots(botsRes.missingBots || []);
      }
      if (auditRes.ok) setAudit(auditRes.entries || []);
      if (invitesRes.ok) setInvites(invitesRes.invites || []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function sendPost() {
    if (!postChannel.trim() || !postContent.trim()) return;
    setPosting(true);
    setPostResult(null);
    try {
      const r = await fetch("/api/discord/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: postChannel.replace("#", ""), content: postContent }),
      });
      const d = await r.json();
      if (d.ok) {
        setPostResult("✅ Posted successfully to #" + postChannel.replace("#", ""));
        setPostContent("");
      } else {
        setPostResult("❌ Failed: " + (d.error || "Unknown error"));
      }
    } catch {
      setPostResult("❌ Network error");
    } finally {
      setPosting(false);
    }
  }

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: "overview", label: "Overview", emoji: "🌌" },
    { id: "bots", label: "Bots", emoji: "🤖" },
    { id: "channels", label: "Channels", emoji: "📋" },
    { id: "roles", label: "Roles", emoji: "🎭" },
    { id: "audit", label: "Audit Log", emoji: "🔍" },
    { id: "invites", label: "Invites", emoji: "🔗" },
    { id: "post", label: "Post Message", emoji: "✉️" },
  ];

  const verLevels = ["None", "Low", "Medium", "High", "Highest"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-violet-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-pink-100 px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-lg shadow">
          {server?.icon ? <img src={server.icon} className="w-9 h-9 rounded-full" alt="server" /> : "🌌"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{server?.name || "WHIMSEY"} — Live Dashboard</p>
          <p className="text-[11px] text-pink-500 font-medium">Real-time Discord server monitor 💗</p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-[10px] text-gray-400">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[57px] z-10 bg-white/90 backdrop-blur border-b border-pink-100 px-4">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4 max-w-3xl mx-auto space-y-4">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            {server && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox label="Members" value={server.memberCount} />
                  <StatBox label="Online" value={server.onlineCount} />
                  <StatBox label="Boosts" value={server.boosts} sub={`Tier ${server.boostTier}`} />
                  <StatBox label="Verification" value={verLevels[server.verificationLevel] || "?"} />
                </div>

                <Card>
                  <h2 className="text-sm font-bold text-gray-900 mb-1">Server Description</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">{server.description || "No description set."}</p>
                </Card>
              </>
            )}

            {/* Bot health summary */}
            <Card>
              <h2 className="text-sm font-bold text-gray-900 mb-3">Bot Health</h2>
              <div className="space-y-2">
                {EXPECTED_BOTS.map(name => {
                  const present = bots.some(b => b.username.toLowerCase().includes(name.toLowerCase()));
                  return (
                    <div key={name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <StatusDot ok={present} />
                        <span className="text-sm text-gray-800 font-medium">{name}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${present ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {present ? "In server" : "NOT FOUND"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {missingBots.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs text-red-700 font-semibold">⚠️ {missingBots.length} required bot(s) missing — invite them before mint day!</p>
                  <p className="text-xs text-red-500 mt-1">Missing: {missingBots.join(", ")}</p>
                </div>
              )}
              {missingBots.length === 0 && bots.length > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-semibold">✅ All expected bots are present!</p>
                </div>
              )}
            </Card>

            {/* Recent audit */}
            <Card>
              <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h2>
              {audit.length === 0 ? (
                <p className="text-xs text-gray-400">No audit log entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {audit.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-start gap-2 py-1 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800">{e.action}</p>
                        <p className="text-[11px] text-gray-400">by {e.username} · {new Date(e.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* BOTS */}
        {tab === "bots" && (
          <Card>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Bots in Server ({bots.length})</h2>
            {bots.length === 0 ? (
              <p className="text-xs text-gray-400">No bots detected with current permissions. Bots may need GUILD_MEMBERS intent enabled.</p>
            ) : (
              <div className="space-y-3">
                {bots.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    {b.avatar
                      ? <img src={b.avatar} className="w-10 h-10 rounded-full" alt={b.username} />
                      : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">B</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{b.username}</p>
                      <p className="text-[11px] text-gray-400">ID: {b.id} · Joined {new Date(b.joinedAt).toLocaleDateString()}</p>
                    </div>
                    <StatusDot ok={true} />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-700 mb-2">Required Bots Status</h3>
              <div className="space-y-1.5">
                {EXPECTED_BOTS.map(name => {
                  const found = bots.find(b => b.username.toLowerCase().includes(name.toLowerCase()));
                  return (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{name}</span>
                      <span className={`font-medium ${found ? "text-emerald-600" : "text-red-500"}`}>
                        {found ? "✓ " + found.username : "✗ Not in server"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* CHANNELS */}
        {tab === "channels" && (
          <Card>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Channels ({channels.length})</h2>
            <div className="space-y-1">
              {channels.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">#{c.name}</p>
                    {c.category && <p className="text-[10px] text-gray-400">{c.category}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.slowmode > 0 && (
                      <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">
                        {c.slowmode}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ROLES */}
        {tab === "roles" && (
          <Card>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Roles ({roles.length})</h2>
            <div className="space-y-2">
              {roles.sort((a, b) => b.position - a.position).map(r => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 border border-gray-200"
                    style={{ background: r.color || "#99aab5" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.name}</p>
                    <p className="text-[10px] text-gray-400">Position {r.position}{r.managed ? " · Bot-managed" : ""}</p>
                  </div>
                  {r.color && <span className="text-[10px] text-gray-400 font-mono">{r.color}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AUDIT LOG */}
        {tab === "audit" && (
          <Card>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Audit Log (last 15 entries)</h2>
            {audit.length === 0 ? (
              <p className="text-xs text-gray-400">No entries found.</p>
            ) : (
              <div className="space-y-2">
                {audit.map(e => (
                  <div key={e.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">{e.action}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{new Date(e.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">by <span className="font-medium text-gray-900">{e.username}</span></p>
                    {e.reason && <p className="text-[11px] text-gray-500 mt-0.5">Reason: {e.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* INVITES */}
        {tab === "invites" && (
          <Card>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Active Invites ({invites.length})</h2>
            {invites.length === 0 ? (
              <p className="text-xs text-gray-400">No active invites found.</p>
            ) : (
              <div className="space-y-3">
                {invites.map(inv => (
                  <div key={inv.code} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900">discord.gg/{inv.code}</span>
                      <span className="text-xs text-gray-500">{inv.uses}/{inv.maxUses || "∞"} uses</span>
                    </div>
                    <p className="text-[11px] text-gray-500">#{inv.channel} · Created by {inv.createdBy}</p>
                    {inv.expiresAt && <p className="text-[11px] text-amber-600 mt-0.5">Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* POST MESSAGE */}
        {tab === "post" && (
          <Card>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Post a Message</h2>
            <p className="text-xs text-gray-500 mb-4">Send a message to any channel in your WHIMSEY server directly from here.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Channel name</label>
                <input
                  value={postChannel}
                  onChange={e => setPostChannel(e.target.value)}
                  placeholder="e.g. general-chat or #announcements"
                  className="w-full text-sm border border-pink-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Message</label>
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  rows={5}
                  placeholder="Type your message here…"
                  className="w-full text-sm border border-pink-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50/30 resize-none"
                />
              </div>
              <button
                onClick={sendPost}
                disabled={posting || !postChannel.trim() || !postContent.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow"
              >
                {posting ? "Sending…" : "Send to Discord 💗"}
              </button>
              {postResult && (
                <div className={`text-sm p-3 rounded-xl font-medium ${postResult.startsWith("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                  {postResult}
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
