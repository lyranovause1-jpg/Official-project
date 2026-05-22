import { useState, useEffect, useCallback, useRef } from "react";

const BASE     = import.meta.env.BASE_URL;
const API_ROOT = BASE.replace(/\/$/, "").replace(/^\/whimsey-ai/, "");
const MEM_API  = `${API_ROOT}/api/whimsey/memory`;
const STAT_API = `${API_ROOT}/api/whimsey/memory/stats`;

/* ── Types ─────────────────────────────────────────────────────────── */
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

/* ── Classification config ──────────────────────────────────────────── */
const CLF: Record<number, { label: string; color: string; bg: string; glow: string }> = {
  10: { label: "COSMIC TOP SECRET", color: "#ff1f5a", bg: "rgba(255,31,90,0.12)",  glow: "0 0 24px rgba(255,31,90,0.5)"  },
  9:  { label: "TOP SECRET",        color: "#ff1f5a", bg: "rgba(255,31,90,0.09)",  glow: "0 0 18px rgba(255,31,90,0.4)"  },
  8:  { label: "SECRET",            color: "#ff6030", bg: "rgba(255,96,48,0.09)",  glow: "0 0 14px rgba(255,96,48,0.35)" },
  7:  { label: "SECRET",            color: "#f59e0b", bg: "rgba(245,158,11,0.08)", glow: "0 0 12px rgba(245,158,11,0.3)" },
  6:  { label: "CONFIDENTIAL",      color: "#0d9488", bg: "rgba(13,148,136,0.08)", glow: "0 0 10px rgba(13,148,136,0.25)"},
  5:  { label: "CONFIDENTIAL",      color: "#0891b2", bg: "rgba(8,145,178,0.06)",  glow: "0 0 8px rgba(8,145,178,0.2)"  },
  4:  { label: "RESTRICTED",        color: "#6366f1", bg: "rgba(99,102,241,0.06)", glow: "0 0 8px rgba(99,102,241,0.2)" },
  3:  { label: "RESTRICTED",        color: "#8b5cf6", bg: "rgba(139,92,246,0.05)", glow: "0 0 6px rgba(139,92,246,0.15)"},
  2:  { label: "UNCLASSIFIED",      color: "#374151", bg: "rgba(55,65,81,0.04)",   glow: "none"                         },
  1:  { label: "UNCLASSIFIED",      color: "#1f2937", bg: "rgba(31,41,55,0.03)",   glow: "none"                         },
};
function getClf(imp: number) { return CLF[Math.max(1, Math.min(10, imp))] || CLF[5]; }

/* ── Category config ────────────────────────────────────────────────── */
const CAT: Record<string, { icon: string; label: string; color: string }> = {
  episodic:    { icon: "◈", label: "EPISODIC",     color: "#a78bfa" },
  action:      { icon: "◆", label: "ACTION LOG",   color: "#fb923c" },
  member:      { icon: "◉", label: "MEMBER FILE",  color: "#38bdf8" },
  event:       { icon: "◎", label: "EVENT LOG",    color: "#4ade80" },
  observation: { icon: "◍", label: "INTELLIGENCE", color: "#f472b6" },
  milestone:   { icon: "★", label: "MILESTONE",    color: "#fbbf24" },
  operational: { icon: "◇", label: "OPERATIONAL",  color: "#94a3b8" },
};
const ALL_CATS = ["all", "episodic", "action", "member", "event", "observation", "milestone", "operational"];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function fmtTs(ts: string) {
  return new Date(ts).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "2-digit", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function tryParseContent(raw: string): string {
  try {
    const obj = JSON.parse(raw);
    return JSON.stringify(obj, null, 2);
  } catch {
    return raw;
  }
}

/* ── Blinking cursor ─────────────────────────────────────────────────── */
function Cursor() {
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVis(v => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color: "#22c55e", opacity: vis ? 1 : 0 }}>█</span>;
}

/* ── Stat tile ───────────────────────────────────────────────────────── */
function StatTile({ cat, count, active, onClick }: {
  cat: string; count: number; active: boolean; onClick: () => void;
}) {
  const cfg = cat === "all"
    ? { icon: "⬡", label: "ALL RECORDS", color: "#e2e8f0" }
    : (CAT[cat] || { icon: "?", label: cat.toUpperCase(), color: "#6b7280" });

  return (
    <button onClick={onClick} style={{
      background: active ? `rgba(255,255,255,0.06)` : "transparent",
      border: `1px solid ${active ? cfg.color + "80" : "rgba(255,255,255,0.07)"}`,
      boxShadow: active ? `0 0 12px ${cfg.color}30, inset 0 0 8px ${cfg.color}10` : "none",
      color: active ? cfg.color : "rgba(255,255,255,0.35)",
      borderRadius: "6px",
      padding: "8px 10px",
      cursor: "pointer",
      minWidth: "90px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      transition: "all 0.2s",
      fontFamily: "'Courier New', monospace",
    }}>
      <span style={{ fontSize: "18px", lineHeight: 1 }}>{cfg.icon}</span>
      <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.5px" }}>{count}</span>
      <span style={{ fontSize: "9px", letterSpacing: "1.5px", fontWeight: 600 }}>{cfg.label}</span>
    </button>
  );
}

/* ── Memory card ─────────────────────────────────────────────────────── */
function MemCard({ mem }: { mem: MemEntry }) {
  const [expanded, setExpanded] = useState(false);
  const clf   = getClf(mem.importance);
  const catCfg = CAT[mem.category] || { icon: "?", label: mem.category.toUpperCase(), color: "#6b7280" };
  const tags   = mem.tags ? mem.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <div style={{
      background: `linear-gradient(135deg, #0c0c14 0%, ${clf.bg} 100%)`,
      border: `1px solid ${clf.color}30`,
      borderLeft: `3px solid ${clf.color}`,
      boxShadow: expanded ? clf.glow : "none",
      borderRadius: "6px",
      overflow: "hidden",
      transition: "all 0.25s",
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Classification banner */}
      <div style={{
        background: `${clf.color}18`,
        borderBottom: `1px solid ${clf.color}25`,
        padding: "4px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "2px",
            color: clf.color,
            textShadow: `0 0 8px ${clf.color}`,
          }}>{clf.label}</span>
          <span style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "1px",
          }}>ID-{String(mem.id).padStart(6, "0")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            fontSize: "9px",
            color: catCfg.color,
            letterSpacing: "1px",
            fontWeight: 600,
          }}>{catCfg.icon} {catCfg.label}</span>
          <span style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "1px",
          }}>{mem.memoryType.toUpperCase()}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px" }}>
        {/* Subject */}
        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px" }}>SUBJECT: </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.5px" }}>{mem.subject}</span>
        </div>

        {/* Headline */}
        <p style={{
          fontSize: "13px",
          color: "#e2e8f0",
          lineHeight: 1.5,
          margin: "0 0 8px 0",
          fontWeight: 500,
        }}>{mem.headline}</p>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Importance bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>PRIORITY</span>
            <div style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  width: "4px",
                  height: "10px",
                  borderRadius: "1px",
                  background: i < mem.importance ? clf.color : "rgba(255,255,255,0.08)",
                  boxShadow: i < mem.importance ? `0 0 4px ${clf.color}` : "none",
                }} />
              ))}
            </div>
            <span style={{ fontSize: "9px", color: clf.color, fontWeight: 700 }}>{mem.importance}/10</span>
          </div>

          {/* Timestamp */}
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.5px" }}>
            {fmtTs(mem.createdAt)}
          </span>

          {/* Tags */}
          {tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: "9px",
              color: "rgba(255,255,255,0.25)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "3px",
              padding: "1px 5px",
              letterSpacing: "0.5px",
            }}>{tag}</span>
          ))}
        </div>

        {/* Expand button */}
        <button onClick={() => setExpanded(v => !v)} style={{
          marginTop: "8px",
          background: "none",
          border: `1px solid ${clf.color}30`,
          borderRadius: "4px",
          color: clf.color,
          fontSize: "10px",
          padding: "3px 8px",
          cursor: "pointer",
          letterSpacing: "1px",
          fontFamily: "'Courier New', monospace",
          transition: "all 0.15s",
        }}>
          {expanded ? "▲ COLLAPSE" : "▼ VIEW CLASSIFIED CONTENT"}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div style={{
            marginTop: "10px",
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${clf.color}20`,
            borderRadius: "4px",
            padding: "10px",
          }}>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "9px",
                color: clf.color,
                letterSpacing: "2px",
                fontWeight: 700,
                textShadow: `0 0 6px ${clf.color}`,
              }}>[ CLASSIFIED CONTENT — EYES ONLY ]</span>
            </div>
            <pre style={{
              fontSize: "11px",
              color: "#22c55e",
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "'Courier New', monospace",
            }}>{tryParseContent(mem.content)}</pre>
            {mem.sessionId && (
              <div style={{ marginTop: "8px", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>
                SESSION: {mem.sessionId}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main MemoryVault ─────────────────────────────────────────────────── */
export default function MemoryVault() {
  const [memories, setMemories]   = useState<MemEntry[]>([]);
  const [stats, setStats]         = useState<Stats>({ total: 0 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [minImp, setMinImp]       = useState(0);
  const [scanline, setScanline]   = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scanline animation
  useEffect(() => {
    const t = setInterval(() => setScanline(v => (v + 1) % 120), 50);
    return () => clearInterval(t);
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const r = await fetch(STAT_API);
      if (r.ok) { const d = await r.json(); setStats(d.stats || { total: 0 }); }
    } catch {}
  }, []);

  // Load memories
  const loadMemories = useCallback(async (cat: string, srch: string, imp: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "150" });
      if (cat !== "all") params.set("category", cat);
      if (srch)          params.set("search", srch);
      if (imp > 0)       params.set("minImportance", String(imp));
      const r = await fetch(`${MEM_API}?${params}`);
      if (r.ok) { const d = await r.json(); setMemories(d.memories || []); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadMemories(activeCat, activeSearch, minImp); }, [activeCat, activeSearch, minImp, loadMemories]);

  function handleSearch() { setActiveSearch(search); }
  function handleKey(e: React.KeyboardEvent) { if (e.key === "Enter") handleSearch(); }

  const totalByCategory = (cat: string) => cat === "all" ? (stats.total || 0) : (stats[cat] || 0);

  return (
    <div style={{
      height: "100%",
      background: "#06060e",
      color: "#e2e8f0",
      overflowY: "auto",
      position: "relative",
      fontFamily: "'Courier New', monospace",
    }}>

      {/* Scanline overlay */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 50,
        background: `linear-gradient(transparent ${scanline * 0.83}%, rgba(255,255,255,0.012) ${scanline * 0.83 + 0.5}%, transparent ${scanline * 0.83 + 1}%)`,
        mixBlendMode: "overlay",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 16px 48px" }}>

        {/* ── TOP HEADER ── */}
        <div style={{
          borderBottom: "1px solid rgba(255,31,90,0.3)",
          padding: "20px 0 16px",
          marginBottom: "20px",
        }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#ff1f5a",
                boxShadow: "0 0 12px #ff1f5a, 0 0 24px #ff1f5a80",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: "10px", color: "#ff1f5a", letterSpacing: "3px", fontWeight: 700 }}>
                LIVE INTEL FEED
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px" }}>
                CLEARANCE: OMEGA-9
              </span>
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px" }}>
                {new Date().toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata", day: "2-digit", month: "short",
                  year: "numeric", hour: "2-digit", minute: "2-digit",
                })} IST
              </span>
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(18px, 3vw, 28px)",
            fontWeight: 900,
            letterSpacing: "4px",
            margin: "0 0 4px 0",
            background: "linear-gradient(135deg, #ff1f5a, #ff6030 40%, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            lineHeight: 1.1,
          }}>
            WHIMSEY INTELLIGENCE NETWORK
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px" }}>
              PERMANENT MEMORY ARCHIVE · EYES ONLY · UNAUTHORIZED ACCESS PROHIBITED
            </span>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{
          marginBottom: "20px",
          padding: "12px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
        }}>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: "10px" }}>
            MEMORY INDEX — {stats.total || 0} TOTAL RECORDS
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {ALL_CATS.map(cat => (
              <StatTile
                key={cat}
                cat={cat}
                count={totalByCategory(cat)}
                active={activeCat === cat}
                onClick={() => setActiveCat(cat)}
              />
            ))}
          </div>
        </div>

        {/* ── SEARCH TERMINAL ── */}
        <div style={{
          marginBottom: "16px",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "6px",
          padding: "12px 14px",
          boxShadow: "0 0 20px rgba(34,197,94,0.08)",
        }}>
          <div style={{ fontSize: "9px", color: "#22c55e", letterSpacing: "2px", marginBottom: "8px", opacity: 0.7 }}>
            QUERY TERMINAL — WHIMSEY/INTELLIGENCE/RECALL v3.1
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#22c55e", fontSize: "13px", userSelect: "none" }}>{">"}</span>
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKey}
                placeholder="search all records..."
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#22c55e",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                }}
              />
              {!search && <Cursor />}
            </div>

            {/* Min importance filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>MIN PRIORITY:</span>
              {[0, 5, 6, 7, 8, 9].map(v => (
                <button key={v} onClick={() => setMinImp(v)} style={{
                  background: minImp === v ? "rgba(245,158,11,0.2)" : "none",
                  border: `1px solid ${minImp === v ? "#f59e0b" : "rgba(255,255,255,0.1)"}`,
                  color: minImp === v ? "#f59e0b" : "rgba(255,255,255,0.3)",
                  borderRadius: "3px",
                  padding: "2px 7px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontFamily: "'Courier New', monospace",
                  transition: "all 0.15s",
                }}>
                  {v === 0 ? "ALL" : `★${v}+`}
                </button>
              ))}
            </div>

            <button onClick={handleSearch} style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#22c55e",
              borderRadius: "4px",
              padding: "5px 14px",
              cursor: "pointer",
              fontSize: "10px",
              letterSpacing: "1.5px",
              fontFamily: "'Courier New', monospace",
              transition: "all 0.15s",
            }}>
              EXECUTE QUERY
            </button>

            <button onClick={() => { setSearch(""); setActiveSearch(""); setActiveCat("all"); setMinImp(0); }} style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.3)",
              borderRadius: "4px",
              padding: "5px 10px",
              cursor: "pointer",
              fontSize: "10px",
              letterSpacing: "1px",
              fontFamily: "'Courier New', monospace",
              transition: "all 0.15s",
            }}>
              CLEAR
            </button>
          </div>
        </div>

        {/* ── STATUS BAR ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          fontSize: "9px",
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "1.5px",
          padding: "0 2px",
        }}>
          <span>
            {loading
              ? "SCANNING ARCHIVES…"
              : `RETRIEVED ${memories.length} RECORD${memories.length !== 1 ? "S" : ""} · CATEGORY: ${activeCat.toUpperCase()}`
            }
          </span>
          <button onClick={() => { loadStats(); loadMemories(activeCat, activeSearch, minImp); }} style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.3)",
            borderRadius: "3px",
            padding: "2px 8px",
            cursor: "pointer",
            fontSize: "9px",
            letterSpacing: "1px",
            fontFamily: "'Courier New', monospace",
          }}>
            ↺ REFRESH
          </button>
        </div>

        {/* ── MEMORY CARDS ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "13px", color: "#22c55e", letterSpacing: "3px", marginBottom: "12px" }}>
              ACCESSING CLASSIFIED ARCHIVES
            </div>
            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{
                  width: "3px",
                  height: "20px",
                  background: "#22c55e",
                  borderRadius: "2px",
                  opacity: 0.6,
                  animation: `barPulse 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                }} />
              ))}
            </div>
          </div>
        ) : memories.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 0",
            color: "rgba(255,255,255,0.2)",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>◎</div>
            <div style={{ fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" }}>NO RECORDS FOUND</div>
            <div style={{ fontSize: "10px", letterSpacing: "1px", opacity: 0.6 }}>
              {stats.total === 0
                ? "Memory archive is empty — records will appear here as WHIMSEY AI operates."
                : "No records match your current query. Adjust filters or clear search."
              }
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {memories.map(mem => <MemCard key={mem.id} mem={mem} />)}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: "32px",
          padding: "12px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "9px",
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "1.5px",
        }}>
          <span>WHIMSEY INTELLIGENCE NETWORK — PERMANENT ARCHIVE</span>
          <span>ALL RECORDS ENCRYPTED · CLEARANCE OMEGA-9 · EYES ONLY</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes barPulse { from { transform: scaleY(0.4); opacity:0.3; } to { transform: scaleY(1); opacity:0.9; } }
      `}</style>
    </div>
  );
}
