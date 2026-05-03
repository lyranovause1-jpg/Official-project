import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ChangeEntry {
  id: number;
  tool: string;
  summary: string;
  detail: string | null;
  createdAt: string;
}

const TOOL_META: Record<string, { emoji: string; color: string }> = {
  add_page_block:        { emoji: "➕", color: "bg-violet-50 text-violet-700 border-violet-100" },
  edit_page_block:       { emoji: "✏️", color: "bg-blue-50 text-blue-700 border-blue-100" },
  remove_page_block:     { emoji: "🗑️", color: "bg-red-50 text-red-600 border-red-100" },
  update_page_header:    { emoji: "🏷️", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  update_nav_label:      { emoji: "🔗", color: "bg-sky-50 text-sky-700 border-sky-100" },
  update_quick_questions:{ emoji: "❓", color: "bg-amber-50 text-amber-700 border-amber-100" },
  update_style:          { emoji: "✍️", color: "bg-pink-50 text-pink-700 border-pink-100" },
  send_discord_message:  { emoji: "✉️", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  update_channel:        { emoji: "📢", color: "bg-teal-50 text-teal-700 border-teal-100" },
  create_role:           { emoji: "🎭", color: "bg-purple-50 text-purple-700 border-purple-100" },
  kick_member:           { emoji: "🚪", color: "bg-orange-50 text-orange-700 border-orange-100" },
  ban_member:            { emoji: "🔨", color: "bg-red-50 text-red-700 border-red-100" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AiChangelog() {
  const [entries, setEntries]     = useState<ChangeEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [showAll, setShowAll]     = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/changelog`, { cache: "no-store" });
      const d = await r.json();
      if (d.ok) setEntries(d.entries);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return null;
  if (entries.length === 0) return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">🕐</span>
        <p className="text-xs font-bold text-gray-800">WHIMSEY AI change log</p>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">
        Nothing yet. Every time WHIMSEY AI changes something — adds a block, renames a nav item, updates your style — it shows up here.
      </p>
    </div>
  );

  const visible = showAll ? entries : entries.slice(0, 5);
  const hiddenCount = entries.length - 5;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">🕐</span>
          <p className="text-xs font-bold text-gray-800">WHIMSEY AI change log</p>
          <span className="text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100 rounded-full px-2 py-0.5">
            {entries.length} {entries.length === 1 ? "change" : "changes"}
          </span>
        </div>
        <span className="text-[10px] text-gray-300 animate-pulse">live</span>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-gray-50">
        {visible.map((entry, i) => {
          const meta = TOOL_META[entry.tool] ?? { emoji: "⚡", color: "bg-gray-50 text-gray-600 border-gray-100" };
          const isOpen = expanded === entry.id;
          const isFirst = i === 0;

          return (
            <div
              key={entry.id}
              className={`px-5 py-3.5 transition-colors ${isFirst ? "bg-violet-50/30" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-sm ${meta.color}`}>
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{entry.summary}</p>
                    {isFirst && (
                      <span className="text-[9px] font-bold tracking-widest bg-violet-500 text-white rounded-full px-1.5 py-0.5 uppercase">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{relativeTime(entry.createdAt)}</span>
                    {entry.detail && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : entry.id)}
                        className="text-[10px] text-violet-500 hover:text-violet-700 font-medium transition-colors"
                      >
                        {isOpen ? "hide detail ↑" : "detail ↓"}
                      </button>
                    )}
                  </div>
                  {isOpen && entry.detail && (
                    <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed font-mono break-all">
                      {entry.detail}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-300 shrink-0 hidden sm:block">{formatTime(entry.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / less */}
      {entries.length > 5 && (
        <div className="px-5 py-3 border-t border-gray-50">
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors text-center"
          >
            {showAll ? "Show less ↑" : `Show ${hiddenCount} more change${hiddenCount !== 1 ? "s" : ""} ↓`}
          </button>
        </div>
      )}
    </div>
  );
}
