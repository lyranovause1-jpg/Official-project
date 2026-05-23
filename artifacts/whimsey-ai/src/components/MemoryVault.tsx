import { useState, useEffect, useCallback, useRef } from "react";

const BASE     = import.meta.env.BASE_URL;
const API_ROOT = BASE.replace(/\/$/, "").replace(/^\/whimsey-ai/, "");
const MEM_API  = `${API_ROOT}/api/whimsey/memory`;
const STAT_API = `${API_ROOT}/api/whimsey/memory/stats`;

/* ── Types ──────────────────────────────────────────────────────────── */
interface MemEntry {
  id: number;
  category: string;
  memoryType: string;
  subject: string;
  headline: string;
  content: string;
  importance: number;
  tags: string | null;
  sessionId: string | null;
  createdAt: string;
}
interface Stats { total: number; [cat: string]: number; }

/* ── Classification tiers ──────────────────────────────────────────── */
type Tier = { label: string; short: string; color: string; bg: string; border: string };
const TIERS: Record<number, Tier> = {
  10: { label: "Cosmic Top Secret", short: "COSMIC", color: "#ff4d6d", bg: "rgba(255,77,109,0.15)", border: "rgba(255,77,109,0.4)" },
  9:  { label: "Top Secret",        short: "TOP SECRET", color: "#ff4d6d", bg: "rgba(255,77,109,0.12)", border: "rgba(255,77,109,0.35)" },
  8:  { label: "Secret",            short: "SECRET", color: "#ff8c42", bg: "rgba(255,140,66,0.12)", border: "rgba(255,140,66,0.35)" },
  7:  { label: "Secret",            short: "SECRET", color: "#ffc107", bg: "rgba(255,193,7,0.12)",  border: "rgba(255,193,7,0.35)" },
  6:  { label: "Confidential",      short: "CONFIDENTIAL", color: "#20b2aa", bg: "rgba(32,178,170,0.12)", border: "rgba(32,178,170,0.35)" },
  5:  { label: "Confidential",      short: "CONFIDENTIAL", color: "#00bcd4", bg: "rgba(0,188,212,0.1)", border: "rgba(0,188,212,0.3)" },
  4:  { label: "Restricted",        short: "RESTRICTED", color: "#7c83fd", bg: "rgba(124,131,253,0.1)", border: "rgba(124,131,253,0.3)" },
  3:  { label: "Restricted",        short: "RESTRICTED", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
  2:  { label: "Unclassified",      short: "UNCLASSIFIED", color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)" },
  1:  { label: "Unclassified",      short: "UNCLASSIFIED", color: "#4b5563", bg: "rgba(75,85,99,0.06)", border: "rgba(75,85,99,0.18)" },
};
function getTier(imp: number): Tier { return TIERS[Math.max(1, Math.min(10, Math.round(imp)))] || TIERS[5]; }

/* ── Categories ─────────────────────────────────────────────────────── */
const CATS: Record<string, { emoji: string; label: string; desc: string; color: string }> = {
  all:         { emoji: "🗂", label: "All Records",  desc: "Everything",           color: "#e2e8f0" },
  episodic:    { emoji: "🧠", label: "Episodic",     desc: "Past conversations",    color: "#a78bfa" },
  action:      { emoji: "⚡", label: "Actions",      desc: "AI decisions & moves",  color: "#fb923c" },
  member:      { emoji: "👤", label: "Members",      desc: "Community profiles",    color: "#38bdf8" },
  event:       { emoji: "📡", label: "Events",       desc: "Tracked happenings",    color: "#4ade80" },
  observation: { emoji: "👁", label: "Intelligence", desc: "Observations & intel",  color: "#f472b6" },
  milestone:   { emoji: "🏆", label: "Milestones",   desc: "Key achievements",      color: "#fbbf24" },
  operational: { emoji: "⚙️", label: "Operational",  desc: "System & config data",  color: "#94a3b8" },
};
const ALL_CAT_KEYS = ["all", "episodic", "action", "member", "event", "observation", "milestone", "operational"];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function fmtDate(ts: string): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function parseContent(raw: string): string {
  try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
}
function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(",").map(t => t.trim()).filter(Boolean);
}

/* ── Category Tab ─────────────────────────────────────────────────────── */
function CatTab({ id, count, active, onClick }: { id: string; count: number; active: boolean; onClick: () => void }) {
  const c = CATS[id] || CATS.all;
  return (
    <button onClick={onClick} style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      padding: "8px 14px",
      borderRadius: "8px",
      border: active ? `1.5px solid ${c.color}60` : "1.5px solid transparent",
      background: active ? `${c.color}18` : "rgba(255,255,255,0.03)",
      color: active ? c.color : "rgba(255,255,255,0.5)",
      cursor: "pointer",
      transition: "all 0.18s",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: "15px" }}>{c.emoji}</span>
      <span style={{ fontSize: "13px", fontWeight: active ? 600 : 400 }}>{c.label}</span>
      <span style={{
        fontSize: "11px",
        background: active ? `${c.color}30` : "rgba(255,255,255,0.08)",
        color: active ? c.color : "rgba(255,255,255,0.3)",
        borderRadius: "20px",
        padding: "1px 7px",
        fontWeight: 600,
      }}>{count}</span>
    </button>
  );
}

/* ── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: "13px",
      padding: "16px 20px",
      minWidth: "110px",
      flex: 1,
      position: "relative",
      outline: "1px solid rgba(255,255,255,0.07)",
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.3)`,
    }}>
      {/* Iridescent top border glow */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(196,181,253,0.5), rgba(249,168,212,0.5), rgba(147,210,255,0.5), transparent)",
        borderRadius: "1px",
      }} />
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", letterSpacing: "0.5px", marginBottom: "6px", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: "28px", fontWeight: 700, color, lineHeight: 1, marginBottom: "4px" }}>{value}</p>
      {sub && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>{sub}</p>}
    </div>
  );
}

/* ── Memory Card ─────────────────────────────────────────────────────── */
function MemCard({ mem }: { mem: MemEntry }) {
  const [expanded, setExpanded] = useState(false);
  const tier    = getTier(mem.importance);
  const catCfg  = CATS[mem.category] || { emoji: "◎", label: mem.category, color: "#6b7280" };
  const tags    = parseTags(mem.tags);
  const content = parseContent(mem.content);

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: "14px",
      overflow: "hidden",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${tier.color}50`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Top bar: classification + category */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: tier.bg,
        borderBottom: `1px solid ${tier.border}`,
        flexWrap: "wrap",
        gap: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Classification badge */}
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            color: tier.color,
            background: `${tier.color}20`,
            border: `1px solid ${tier.color}50`,
            borderRadius: "4px",
            padding: "2px 8px",
          }}>
            {tier.short}
          </span>
          {/* Category */}
          <span style={{
            fontSize: "12px",
            color: catCfg.color,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontWeight: 500,
          }}>
            <span>{catCfg.emoji}</span>
            <span>{catCfg.label}</span>
          </span>
          {/* Type */}
          <span style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            padding: "1px 7px",
          }}>
            {mem.memoryType}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Importance */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Priority</span>
            <div style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: i < mem.importance ? tier.color : "rgba(255,255,255,0.1)",
                }} />
              ))}
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: tier.color }}>{mem.importance}/10</span>
          </div>
          {/* Record ID */}
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
            #{String(mem.id).padStart(5, "0")}
          </span>
        </div>
      </div>

      {/* Main body */}
      <div style={{ padding: "14px 16px" }}>
        {/* Subject */}
        <p style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.35)",
          marginBottom: "5px",
          letterSpacing: "0.3px",
          textTransform: "uppercase",
          fontWeight: 500,
        }}>
          Subject: <span style={{ color: "rgba(255,255,255,0.6)", textTransform: "none", letterSpacing: 0 }}>{mem.subject}</span>
        </p>

        {/* Headline */}
        <h3 style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#f1f5f9",
          lineHeight: 1.5,
          margin: "0 0 12px 0",
        }}>
          {mem.headline}
        </h3>

        {/* Tags + timestamp row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {tags.map(tag => (
              <span key={tag} style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "2px 9px",
              }}>#{tag}</span>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{fmtDate(mem.createdAt)}</span>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "12px",
            padding: "5px 12px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = `${tier.color}60`;
            (e.currentTarget as HTMLElement).style.color = tier.color;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <span>{expanded ? "▲" : "▼"}</span>
          <span>{expanded ? "Hide full record" : "View full record"}</span>
        </button>

        {/* Expanded: full content */}
        {expanded && (
          <div style={{
            marginTop: "12px",
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${tier.border}`,
            borderRadius: "8px",
            padding: "14px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: tier.color,
              }}>
                FULL RECORD — {tier.label.toUpperCase()} — EYES ONLY
              </span>
            </div>
            <pre style={{
              fontSize: "12px",
              lineHeight: 1.7,
              color: "#a7f3d0",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "'Courier New', Courier, monospace",
              margin: 0,
            }}>
              {content}
            </pre>
            {mem.sessionId && (
              <p style={{
                marginTop: "10px",
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                fontFamily: "monospace",
              }}>
                Session ID: {mem.sessionId}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Priority filter button ─────────────────────────────────────────── */
function PrioBtn({ val, label, active, onClick }: { val: number; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px",
      borderRadius: "6px",
      border: active ? "1.5px solid #fbbf24" : "1.5px solid rgba(255,255,255,0.1)",
      background: active ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.03)",
      color: active ? "#fbbf24" : "rgba(255,255,255,0.4)",
      fontSize: "12px",
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

/* ── Sorting button ────────────────────────────────────────────────── */
function SortBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px",
      borderRadius: "6px",
      border: active ? "1.5px solid #818cf8" : "1.5px solid rgba(255,255,255,0.1)",
      background: active ? "rgba(129,140,248,0.15)" : "rgba(255,255,255,0.03)",
      color: active ? "#818cf8" : "rgba(255,255,255,0.4)",
      fontSize: "12px",
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

/* ── Main MemoryVault ─────────────────────────────────────────────── */
export default function MemoryVault() {
  const [memories, setMemories]     = useState<MemEntry[]>([]);
  const [stats, setStats]           = useState<Stats>({ total: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [activeCat, setActiveCat]   = useState("all");
  const [minImp, setMinImp]         = useState(0);
  const [sort, setSort]             = useState<"newest" | "oldest" | "priority">("newest");
  const [refreshKey, setRefreshKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadStats = useCallback(async () => {
    try {
      const r = await fetch(STAT_API);
      if (r.ok) { const d = await r.json(); setStats(d.stats || { total: 0 }); }
    } catch {}
  }, []);

  const loadMemories = useCallback(async (cat: string, srch: string, imp: number) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (cat !== "all") params.set("category", cat);
      if (srch)          params.set("search", srch);
      if (imp > 0)       params.set("minImportance", String(imp));
      const r = await fetch(`${MEM_API}?${params}`);
      if (!r.ok) { setError("Failed to load records. Please try again."); setLoading(false); return; }
      const d = await r.json();
      setMemories(d.memories || []);
    } catch { setError("Connection error. Is the API running?"); }
    setLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats, refreshKey]);
  useEffect(() => { loadMemories(activeCat, search, minImp); }, [activeCat, search, minImp, loadMemories, refreshKey]);

  function applySearch() { setSearch(draftSearch); }
  function clearAll() { setDraftSearch(""); setSearch(""); setActiveCat("all"); setMinImp(0); }

  /* Sort memories */
  const sorted = [...memories].sort((a, b) => {
    if (sort === "priority") return b.importance - a.importance;
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  /* Top-importance record */
  const topRecord = memories.reduce((best, m) => m.importance > (best?.importance ?? 0) ? m : best, memories[0]);

  const BASE = import.meta.env.BASE_URL;

  return (
    <div style={{
      height: "100%",
      background: "#0a0a14",
      color: "#e2e8f0",
      overflowY: "auto",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: "relative",
    }}>

      {/* Subtle aurora glow blobs */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "55%", height: "65%",
          background: "radial-gradient(ellipse, rgba(120,80,220,0.12) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "50%", height: "60%",
          background: "radial-gradient(ellipse, rgba(60,160,255,0.08) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: "35%", height: "40%",
          background: "radial-gradient(ellipse, rgba(255,80,130,0.06) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(40px)" }} />
        {/* Moon silhouette, extremely faint */}
        <img src={`${BASE}moon.jpg`} alt="" style={{
          position: "absolute", right: "-15%", bottom: "-10%",
          width: "55%", opacity: 0.06, mixBlendMode: "screen",
          filter: "saturate(0.5) blur(2px)", pointerEvents: "none",
        }} />
      </div>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "24px 20px 60px", position: "relative", zIndex: 1 }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #ff4d6d, #ff8c42)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>🔐</div>
            <div>
              <h1 style={{
                fontSize: "22px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px",
                background: "linear-gradient(135deg, #f8fafc 0%, #c4b5fd 40%, #f9a8d4 80%, #f8fafc 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                WHIMSEY Intelligence Vault
              </h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", margin: 0 }}>
                Permanent memory archive · Clearance Level OMEGA
              </p>
            </div>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              style={{
                marginLeft: "auto",
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "12px", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
            >
              ↺ Refresh
            </button>
          </div>

          {/* Breadcrumb status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "rgba(255,77,109,0.08)",
            border: "1px solid rgba(255,77,109,0.2)",
            borderRadius: "6px",
            width: "fit-content",
          }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ff4d6d", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,200,200,0.7)", letterSpacing: "0.5px" }}>
              LIVE INTEL FEED · All memory records updated in real-time as WHIMSEY AI operates
            </span>
          </div>
        </div>

        {/* ── STATS OVERVIEW ── */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          <StatCard label="Total Records" value={stats.total || 0} sub="All categories" color="#f8fafc" />
          <StatCard label="Episodic Memories" value={stats.episodic || 0} sub="Conversations & context" color="#a78bfa" />
          <StatCard label="Member Profiles" value={stats.member || 0} sub="Community intelligence" color="#38bdf8" />
          <StatCard label="Events Tracked" value={stats.event || 0} sub="Server activity log" color="#4ade80" />
          <StatCard label="Top Priority" value={topRecord ? `★${topRecord.importance}` : "–"} sub={topRecord ? topRecord.headline.slice(0, 22) + "…" : "No records yet"} color="#ff4d6d" />
        </div>

        {/* ── SEARCH BAR ── */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 14px",
            }}>
              <span style={{ fontSize: "14px", opacity: 0.4 }}>🔍</span>
              <input
                ref={inputRef}
                value={draftSearch}
                onChange={e => setDraftSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applySearch()}
                placeholder="Search by subject, headline, content, or tags…"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#f1f5f9", fontSize: "14px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              />
              {(draftSearch || search) && (
                <button onClick={clearAll} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                  cursor: "pointer", fontSize: "16px", padding: "0",
                }}>✕</button>
              )}
            </div>
            <button
              onClick={applySearch}
              style={{
                padding: "9px 20px", borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", color: "white",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >
              Search
            </button>
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Min Priority:</span>
            {[
              { val: 0, label: "All" },
              { val: 5, label: "★5+" },
              { val: 7, label: "★7+" },
              { val: 9, label: "★9+" },
            ].map(o => (
              <PrioBtn key={o.val} val={o.val} label={o.label} active={minImp === o.val} onClick={() => setMinImp(o.val)} />
            ))}
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Sort:</span>
            {(["newest", "oldest", "priority"] as const).map(s => (
              <SortBtn key={s} label={s === "newest" ? "Newest first" : s === "oldest" ? "Oldest first" : "By priority"} active={sort === s} onClick={() => setSort(s)} />
            ))}
          </div>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          marginBottom: "20px",
          paddingBottom: "4px",
        }}>
          {ALL_CAT_KEYS.map(key => (
            <CatTab
              key={key}
              id={key}
              count={key === "all" ? (stats.total || 0) : (stats[key] || 0)}
              active={activeCat === key}
              onClick={() => setActiveCat(key)}
            />
          ))}
        </div>

        {/* ── STATUS LINE ── */}
        {!loading && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
              {memories.length === 0
                ? "No records match your filters"
                : `Showing ${sorted.length} record${sorted.length !== 1 ? "s" : ""} · ${CATS[activeCat]?.label || "All"} · sorted by ${sort}`
              }
            </p>
            {search && (
              <span style={{
                fontSize: "11px",
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "20px",
                padding: "2px 10px",
              }}>
                Search: "{search}"
              </span>
            )}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.06)",
              borderTop: "3px solid #6366f1",
              margin: "0 auto 16px",
              animation: "spin 0.9s linear infinite",
            }} />
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Loading intelligence archive…</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "14px", color: "#fca5a5", margin: "0 0 8px" }}>⚠️ {error}</p>
            <button onClick={() => setRefreshKey(k => k + 1)} style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", borderRadius: "6px",
              padding: "6px 16px", cursor: "pointer", fontSize: "13px",
            }}>Try Again</button>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && sorted.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: "16px",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.4 }}>🗄</div>
            <h3 style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", margin: "0 0 8px" }}>
              {stats.total === 0 ? "Memory Archive Is Empty" : "No Records Match Your Filters"}
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", maxWidth: "340px", margin: "0 auto" }}>
              {stats.total === 0
                ? "WHIMSEY AI will automatically record memories as she operates — conversations, member activity, milestones, and more will appear here."
                : "Try adjusting your filters, changing the category, or clearing the search."}
            </p>
            {stats.total > 0 && (
              <button onClick={clearAll} style={{
                marginTop: "16px",
                padding: "8px 20px", borderRadius: "8px",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#818cf8", cursor: "pointer", fontSize: "13px",
              }}>Clear All Filters</button>
            )}
          </div>
        )}

        {/* ── MEMORY CARDS ── */}
        {!loading && !error && sorted.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sorted.map(mem => <MemCard key={mem.id} mem={mem} />)}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: "40px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "rgba(255,255,255,0.2)",
        }}>
          <span>WHIMSEY Intelligence Network · Permanent Archive</span>
          <span>Clearance OMEGA · All records encrypted · Eyes Only</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(255,77,109,0.5); } 50% { opacity:0.7; box-shadow:0 0 0 5px rgba(255,77,109,0); } }
        @keyframes spin  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
