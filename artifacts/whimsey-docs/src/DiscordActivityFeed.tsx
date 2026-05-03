import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ChangeEntry {
  id: number;
  tool: string;
  summary: string;
  detail: string | null;
  createdAt: string;
}

const DISCORD_TOOLS = new Set([
  "send_discord_message",
  "update_channel",
  "create_channel",
  "delete_channel",
  "create_role",
  "update_role",
  "delete_role",
  "assign_role",
  "remove_role",
  "kick_member",
  "ban_member",
  "timeout_member",
  "unban_member",
  "pin_message",
  "delete_message",
  "edit_message",
  "create_invite",
  "set_nickname",
  "set_channel_permissions",
]);

interface ActionMeta {
  label: string;
  emoji: string;
  badgeColor: string;
  dotColor: string;
  rowColor: string;
}

const ACTION_META: Record<string, ActionMeta> = {
  ban_member:             { label: "BAN",         emoji: "🔨", badgeColor: "bg-red-100 text-red-700",     dotColor: "bg-red-500",    rowColor: "hover:bg-red-50/40" },
  kick_member:            { label: "KICK",        emoji: "🚪", badgeColor: "bg-orange-100 text-orange-700", dotColor: "bg-orange-400", rowColor: "hover:bg-orange-50/40" },
  timeout_member:         { label: "TIMEOUT",     emoji: "⏱️", badgeColor: "bg-amber-100 text-amber-700",  dotColor: "bg-amber-400",  rowColor: "hover:bg-amber-50/40" },
  unban_member:           { label: "UNBAN",       emoji: "✅", badgeColor: "bg-emerald-100 text-emerald-700", dotColor: "bg-emerald-500", rowColor: "hover:bg-emerald-50/40" },
  send_discord_message:   { label: "MESSAGE",     emoji: "✉️", badgeColor: "bg-blue-100 text-blue-700",   dotColor: "bg-blue-400",   rowColor: "hover:bg-blue-50/40" },
  pin_message:            { label: "PIN",         emoji: "📌", badgeColor: "bg-sky-100 text-sky-700",     dotColor: "bg-sky-400",    rowColor: "hover:bg-sky-50/40" },
  delete_message:         { label: "DEL MSG",     emoji: "🗑️", badgeColor: "bg-red-100 text-red-600",     dotColor: "bg-red-400",    rowColor: "hover:bg-red-50/40" },
  edit_message:           { label: "EDIT MSG",    emoji: "✏️", badgeColor: "bg-violet-100 text-violet-700", dotColor: "bg-violet-400", rowColor: "hover:bg-violet-50/40" },
  create_channel:         { label: "NEW CHANNEL", emoji: "📢", badgeColor: "bg-teal-100 text-teal-700",   dotColor: "bg-teal-500",   rowColor: "hover:bg-teal-50/40" },
  delete_channel:         { label: "DEL CHANNEL", emoji: "🗑️", badgeColor: "bg-red-100 text-red-600",     dotColor: "bg-red-400",    rowColor: "hover:bg-red-50/40" },
  update_channel:         { label: "CHANNEL",     emoji: "📋", badgeColor: "bg-teal-100 text-teal-700",   dotColor: "bg-teal-400",   rowColor: "hover:bg-teal-50/40" },
  set_channel_permissions:{ label: "PERMISSIONS", emoji: "🔒", badgeColor: "bg-indigo-100 text-indigo-700", dotColor: "bg-indigo-500", rowColor: "hover:bg-indigo-50/40" },
  create_role:            { label: "NEW ROLE",    emoji: "🎭", badgeColor: "bg-purple-100 text-purple-700", dotColor: "bg-purple-500", rowColor: "hover:bg-purple-50/40" },
  update_role:            { label: "ROLE",        emoji: "🎭", badgeColor: "bg-purple-100 text-purple-700", dotColor: "bg-purple-400", rowColor: "hover:bg-purple-50/40" },
  delete_role:            { label: "DEL ROLE",    emoji: "🗑️", badgeColor: "bg-red-100 text-red-600",     dotColor: "bg-red-400",    rowColor: "hover:bg-red-50/40" },
  assign_role:            { label: "ROLE ADDED",  emoji: "🏷️", badgeColor: "bg-green-100 text-green-700", dotColor: "bg-green-500",  rowColor: "hover:bg-green-50/40" },
  remove_role:            { label: "ROLE REMOVED",emoji: "🏷️", badgeColor: "bg-rose-100 text-rose-700",   dotColor: "bg-rose-400",   rowColor: "hover:bg-rose-50/40" },
  create_invite:          { label: "INVITE",      emoji: "🔗", badgeColor: "bg-cyan-100 text-cyan-700",   dotColor: "bg-cyan-500",   rowColor: "hover:bg-cyan-50/40" },
  set_nickname:           { label: "NICKNAME",    emoji: "🏷️", badgeColor: "bg-slate-100 text-slate-700", dotColor: "bg-slate-400",  rowColor: "hover:bg-slate-50/40" },
};

const DEFAULT_META: ActionMeta = {
  label: "ACTION", emoji: "⚡",
  badgeColor: "bg-gray-100 text-gray-600", dotColor: "bg-gray-400", rowColor: "hover:bg-gray-50",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (secs < 10)   return "just now";
  if (secs < 60)   return `${secs}s ago`;
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatExact(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function DiscordActivityFeed() {
  const [entries, setEntries] = useState<ChangeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [tick, setTick]         = useState(0);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/changelog`, { cache: "no-store" });
      const d = await r.json();
      if (d.ok && Array.isArray(d.entries)) {
        setEntries(d.entries.filter((e: ChangeEntry) => DISCORD_TOOLS.has(e.tool)));
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    return () => clearInterval(poll);
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(id);
  }, []);
  void tick;

  const visible = entries.slice(0, 10);

  if (loading) return null;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="relative flex">
            <span className={`w-2 h-2 rounded-full ${entries.length > 0 ? "bg-emerald-500" : "bg-gray-300"}`} />
            {entries.length > 0 && (
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-60" />
            )}
          </div>
          <p className="text-xs font-bold text-gray-800">WHIMSEY AI — Discord activity</p>
          {entries.length > 0 && (
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              {entries.length} action{entries.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-300">live · updates every 8s</span>
      </div>

      {/* ── Empty state ── */}
      {entries.length === 0 && (
        <div className="px-5 py-8 text-center">
          <p className="text-2xl mb-2">🤖</p>
          <p className="text-xs font-semibold text-gray-600 mb-1">No Discord actions yet</p>
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
            Every time WHIMSEY AI bans someone, updates a channel, changes a role, or sends a message — it appears here instantly.
          </p>
        </div>
      )}

      {/* ── Activity rows ── */}
      {visible.length > 0 && (
        <div className="divide-y divide-gray-50">
          {visible.map((entry, i) => {
            const meta    = ACTION_META[entry.tool] ?? DEFAULT_META;
            const isFirst = i === 0;
            const isOpen  = expanded === entry.id;

            return (
              <div
                key={entry.id}
                className={`px-4 py-3 transition-colors cursor-default ${meta.rowColor} ${isFirst ? "bg-gray-50/60" : ""}`}
              >
                <div className="flex items-start gap-3">

                  {/* Emoji icon */}
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {meta.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row: badge + summary + NEW pill */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[9px] font-black tracking-[0.12em] uppercase px-1.5 py-0.5 rounded-md ${meta.badgeColor}`}>
                        {meta.label}
                      </span>
                      <p className="text-xs text-gray-700 leading-snug font-medium truncate flex-1">
                        {entry.summary}
                      </p>
                      {isFirst && (
                        <span className="text-[9px] font-bold tracking-widest bg-emerald-500 text-white rounded-full px-1.5 py-0.5 uppercase shrink-0">
                          New
                        </span>
                      )}
                    </div>

                    {/* Bottom row: time + detail toggle */}
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${meta.dotColor} shrink-0`} />
                      <span className="text-[10px] text-gray-400">{relativeTime(entry.createdAt)}</span>
                      <span className="text-gray-200 text-[10px]">·</span>
                      <span className="text-[10px] text-gray-300 hidden sm:inline">{formatExact(entry.createdAt)}</span>
                      {entry.detail && (
                        <>
                          <span className="text-gray-200 text-[10px] hidden sm:inline">·</span>
                          <button
                            onClick={() => setExpanded(isOpen ? null : entry.id)}
                            className="text-[10px] text-violet-400 hover:text-violet-600 font-medium transition-colors"
                          >
                            {isOpen ? "hide ↑" : "details ↓"}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Expandable detail */}
                    {isOpen && entry.detail && (
                      <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 leading-relaxed font-mono break-all">
                        {entry.detail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      {entries.length > 10 && (
        <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/40">
          <p className="text-[10px] text-gray-400 text-center">
            Showing 10 most recent — {entries.length - 10} older action{entries.length - 10 !== 1 ? "s" : ""} not shown
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="px-5 py-2.5 border-t border-gray-50">
          <p className="text-[10px] text-gray-300 text-center">
            App edits (pages, blocks, style) are in the change log below
          </p>
        </div>
      )}
    </div>
  );
}
