import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

interface ServerInfo {
  name: string; id: string; memberCount: number; onlineCount: number;
  boosts: number; boostTier: number; verificationLevel: number;
  description: string; icon: string | null;
}
interface Channel { id: string; name: string; category: string | null; slowmode: number; topic: string | null; }
interface Role { id: string; name: string; color: string | null; position: number; managed: boolean; }
interface Bot { name: string; id: string; avatar: string | null; enabled: boolean; }
interface AuditEntry { id: string; action: string; username: string; targetId: string; reason: string | null; createdAt: string; }
interface Invite { code: string; uses: number; maxUses: number; channel: string; createdBy: string; expiresAt: string | null; }

type Tab = "overview" | "channels" | "roles" | "bots" | "audit" | "invites" | "post";

const REQUIRED_BOTS = ["Carl-bot", "Auth", "Collab.Land", "Ticket Tool", "WHIMSEY AI"];

const ROLE_SETUP_TODO = [
  { name: "Admin 💗",     color: "#FF66B2", desc: "You (Lyra). Full administrator access." },
  { name: "Moderator ☁️", color: "#A8D8FF", desc: "Your team. No admin toggle." },
  { name: "Holder 🌌",   color: "#7B2FBE", desc: "NFT holders. Assigned by Collab.Land." },
  { name: "Verified 🩵", color: "#5865F2", desc: "Verified humans. Assigned by Auth." },
];

const VER_LEVELS = ["None", "Low", "Medium", "High", "Highest"];

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview" },
  { id: "bots",      label: "Bots" },
  { id: "channels",  label: "Channels" },
  { id: "roles",     label: "Roles" },
  { id: "audit",     label: "Audit Log" },
  { id: "invites",   label: "Invites" },
  { id: "post",      label: "Post Message" },
];

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
      ok ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
      {ok ? "Present" : "Missing"}
    </span>
  );
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      {note && <p className="text-[11px] text-gray-400 mt-1">{note}</p>}
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function DiscordDashboard() {
  const [tab, setTab]           = useState<Tab>("overview");
  const [loading, setLoading]   = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [server, setServer]     = useState<ServerInfo | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [roles, setRoles]       = useState<Role[]>([]);
  const [bots, setBots]         = useState<Bot[]>([]);
  const [missingBots, setMissingBots] = useState<string[]>([]);
  const [audit, setAudit]       = useState<AuditEntry[]>([]);
  const [invites, setInvites]   = useState<Invite[]>([]);

  const [postChannel, setPostChannel] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting]   = useState(false);
  const [postResult, setPostResult]   = useState<string | null>(null);

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
        body: JSON.stringify({ channelName: postChannel.replace(/^#/, ""), content: postContent }),
      });
      const d = await r.json();
      if (d.ok) {
        setPostResult("Posted successfully to #" + postChannel.replace(/^#/, ""));
        setPostContent("");
      } else {
        setPostResult("Failed: " + (d.error || "Unknown error"));
      }
    } catch {
      setPostResult("Network error — please try again.");
    } finally {
      setPosting(false);
    }
  }

  const rolesNeeded = ROLE_SETUP_TODO.filter(r =>
    !roles.some(e => e.name.toLowerCase().includes(r.name.toLowerCase().split(" ")[0]))
  );

  const groupedChannels = channels.reduce<Record<string, Channel[]>>((acc, ch) => {
    const cat = ch.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3">
        <Link href="/">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700" aria-label="Back">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {server?.icon
            ? <img src={server.icon} className="w-8 h-8 rounded-full" alt="" />
            : "W"
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{server?.name || "WHIMSEY"}</p>
          <p className="text-[11px] text-gray-400">
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ai">
            <button className="px-3 py-1.5 text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors shadow-sm">
              Ask AI 💗
            </button>
          </Link>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              className={loading ? "animate-spin" : ""}>
              <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Setup alert banner ── */}
      {(missingBots.length > 0 || rolesNeeded.length > 0) && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5">
          <div className="max-w-3xl mx-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-amber-800">Setup incomplete —</span>
            {missingBots.length > 0 && (
              <span className="text-xs text-amber-700">Missing bots: <span className="font-medium">{missingBots.join(", ")}</span></span>
            )}
            {missingBots.length > 0 && rolesNeeded.length > 0 && <span className="text-xs text-amber-400">·</span>}
            {rolesNeeded.length > 0 && (
              <span className="text-xs text-amber-700">Roles needed: <span className="font-medium">{rolesNeeded.map(r => r.name).join(", ")}</span></span>
            )}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="sticky top-[57px] z-10 bg-white border-b border-gray-200 px-5">
        <div className="flex gap-1 overflow-x-auto max-w-3xl mx-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-5 py-5 max-w-3xl mx-auto space-y-4">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {server && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Members"      value={server.memberCount} />
                <Stat label="Online"       value={server.onlineCount} />
                <Stat label="Boosts"       value={server.boosts}      note={`Tier ${server.boostTier}`} />
                <Stat label="Verification" value={VER_LEVELS[server.verificationLevel] || "?"} />
              </div>
            )}

            {server?.description && (
              <Section title="About this server">
                <p className="text-sm text-gray-600 leading-relaxed">{server.description}</p>
              </Section>
            )}

            <Section title="Bot health">
              <div className="divide-y divide-gray-50">
                {REQUIRED_BOTS.map(name => {
                  const present = bots.some(b => b.name.toLowerCase().includes(name.toLowerCase()));
                  return (
                    <div key={name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium text-gray-800">{name}</p>
                      <StatusPill ok={present} />
                    </div>
                  );
                })}
              </div>
              {missingBots.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <p className="text-xs text-amber-700 font-medium">{missingBots.length} bot(s) still needed before mint day.</p>
                  <Link href="/ai?q=Which bots do I still need to invite and how do I do it?">
                    <button className="shrink-0 text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                      Get help →
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-emerald-700 font-semibold">All required bots present ✓</p>
                </div>
              )}
            </Section>

            <Section title="Role setup">
              <div className="divide-y divide-gray-50">
                {ROLE_SETUP_TODO.map(r => {
                  const created = roles.some(e => e.name.toLowerCase().includes(r.name.toLowerCase().split(" ")[0]));
                  return (
                    <div key={r.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: r.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{r.name}</p>
                        <p className="text-[11px] text-gray-400">{r.desc}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        created
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {created ? "Created" : "Needed"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {rolesNeeded.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">{rolesNeeded.length} role(s) still to create.</p>
                  <Link href={`/ai?q=Create my Admin, Moderator, Holder, and Verified roles for me`}>
                    <button className="shrink-0 text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                      Ask AI to create them →
                    </button>
                  </Link>
                </div>
              )}
            </Section>

            <Section title="Recent activity">
              {audit.length === 0 ? (
                <p className="text-sm text-gray-400">No recent activity.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {audit.slice(0, 6).map(e => (
                    <div key={e.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-700">{e.action}</span>
                        <span className="text-[11px] text-gray-400 shrink-0">{new Date(e.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">by {e.username}</p>
                      {e.reason && <p className="text-[11px] text-gray-400">Reason: {e.reason}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {/* ── BOTS ── */}
        {tab === "bots" && (
          <>
            <Section title={`Bots in server (${bots.length})`}>
              {bots.length === 0 ? (
                <p className="text-sm text-gray-400">No bots detected.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bots.map(b => (
                    <div key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      {b.avatar
                        ? <img src={b.avatar} className="w-9 h-9 rounded-full" alt={b.name} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        : <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">🤖</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{b.id}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Required bot checklist">
              <div className="divide-y divide-gray-50">
                {REQUIRED_BOTS.map(name => {
                  const found = bots.find(b => b.name.toLowerCase().includes(name.toLowerCase()));
                  return (
                    <div key={name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium text-gray-800">{name}</p>
                      <StatusPill ok={!!found} />
                    </div>
                  );
                })}
              </div>
            </Section>
          </>
        )}

        {/* ── CHANNELS ── */}
        {tab === "channels" && (
          <Section title={`Channels (${channels.length})`}>
            {Object.entries(groupedChannels).map(([cat, chans]) => (
              <div key={cat} className="mb-4 last:mb-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{cat}</p>
                <div className="divide-y divide-gray-50">
                  {chans.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2.5 first:pt-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">#{c.name}</p>
                        {c.topic && <p className="text-[11px] text-gray-400 truncate max-w-[220px]">{c.topic}</p>}
                      </div>
                      {c.slowmode > 0 && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded font-medium shrink-0">
                          {c.slowmode}s slow
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* ── ROLES ── */}
        {tab === "roles" && (
          <>
            <Section title={`Roles (${roles.length})`}>
              <div className="divide-y divide-gray-50">
                {roles.sort((a, b) => b.position - a.position).map(r => (
                  <div key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-3 h-3 rounded-full shrink-0 border border-gray-200" style={{ background: r.color || "#99aab5" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{r.name}</p>
                      <p className="text-[11px] text-gray-400">Position {r.position}{r.managed ? " · Bot-managed" : ""}</p>
                    </div>
                    {r.color && <span className="text-[10px] text-gray-400 font-mono">{r.color}</span>}
                  </div>
                ))}
              </div>
            </Section>

            {rolesNeeded.length > 0 && (
              <Section title="Roles still to create">
                <div className="divide-y divide-gray-50">
                  {rolesNeeded.map(r => (
                    <div key={r.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: r.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{r.name}</p>
                        <p className="text-[11px] text-gray-400">{r.desc}</p>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">{r.color}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href={`/ai?q=Create my Admin, Moderator, Holder, and Verified roles`}>
                    <button className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                      Ask AI to create these roles →
                    </button>
                  </Link>
                </div>
              </Section>
            )}
          </>
        )}

        {/* ── AUDIT LOG ── */}
        {tab === "audit" && (
          <Section title="Audit log (last 15 actions)">
            {audit.length === 0 ? (
              <p className="text-sm text-gray-400">No entries found.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {audit.map(e => (
                  <div key={e.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{e.action}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{new Date(e.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500">by <span className="font-medium text-gray-700">{e.username}</span></p>
                    {e.reason && <p className="text-[11px] text-gray-400 mt-0.5">Reason: {e.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ── INVITES ── */}
        {tab === "invites" && (
          <Section title={`Active invites (${invites.length})`}>
            {invites.length === 0 ? (
              <p className="text-sm text-gray-400">No active invites found.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {invites.map(inv => (
                  <div key={inv.code} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900">discord.gg/{inv.code}</span>
                      <span className="text-xs text-gray-500">{inv.uses}/{inv.maxUses || "∞"} uses</span>
                    </div>
                    <p className="text-[11px] text-gray-400">#{inv.channel} · {inv.createdBy}</p>
                    {inv.expiresAt && (
                      <p className="text-[11px] text-amber-600 mt-0.5">Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ── POST MESSAGE ── */}
        {tab === "post" && (
          <Section title="Post a message">
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">Send a message to any channel directly from here — no need to open Discord.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Channel</label>
                <input
                  value={postChannel}
                  onChange={e => setPostChannel(e.target.value)}
                  placeholder="e.g. general-chat"
                  list="channel-list"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 bg-gray-50 transition-all"
                />
                <datalist id="channel-list">
                  {channels.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Message</label>
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  rows={5}
                  placeholder="Type your message here…"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 bg-gray-50 resize-none transition-all"
                />
              </div>
              <button
                onClick={sendPost}
                disabled={posting || !postChannel.trim() || !postContent.trim()}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-40"
              >
                {posting ? "Sending…" : "Send to Discord →"}
              </button>
              {postResult && (
                <div className={`text-sm p-3.5 rounded-xl font-medium border ${
                  postResult.startsWith("Posted")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}>
                  {postResult}
                </div>
              )}
            </div>
            <div className="mt-5 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-2">Or let the AI write and post it for you</p>
              <Link href="/ai">
                <button className="text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                  Open AI Chat →
                </button>
              </Link>
            </div>
          </Section>
        )}

      </main>
    </div>
  );
}
