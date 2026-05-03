import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import DynamicBlocks, { useContent } from "./DynamicBlocks";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const REFRESH_INTERVAL = 30;
const LS_KEY = "whimsey_feed_last_visit";

interface FeedMessage {
  id: string;
  channelId: string;
  channelName: string;
  category: string | null;
  author: string;
  authorId: string;
  isBot: boolean;
  content: string;
  embeds: { title: string | null; description: string | null; color: number | null }[];
  attachmentCount: number;
  timestamp: string;
  edited: string | null;
  reactionCount: number;
}

interface FeedChannel {
  id: string;
  name: string;
  category: string | null;
}

interface FeedData {
  ok: boolean;
  channelCount: number;
  channels: FeedChannel[];
  total: number;
  messages: FeedMessage[];
}

const CHANNEL_COLORS: Record<string, string> = {
  "ceo":    "bg-amber-100 text-amber-800 border-amber-200",
  "admin":  "bg-red-100 text-red-800 border-red-200",
  "staff":  "bg-violet-100 text-violet-800 border-violet-200",
  "mod":    "bg-blue-100 text-blue-800 border-blue-200",
  "log":    "bg-gray-100 text-gray-700 border-gray-200",
  "audit":  "bg-gray-100 text-gray-700 border-gray-200",
  "bot":    "bg-emerald-100 text-emerald-800 border-emerald-200",
  "ticket": "bg-sky-100 text-sky-800 border-sky-200",
  "report": "bg-orange-100 text-orange-800 border-orange-200",
  "alert":  "bg-red-100 text-red-800 border-red-200",
};

function channelColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, cls] of Object.entries(CHANNEL_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return "bg-indigo-100 text-indigo-800 border-indigo-200";
}

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString([], {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatLastVisit(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 1) return `${Math.floor(diffH * 60)}m ago`;
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  return formatTimestamp(iso);
}

function isCeoMessage(msg: FeedMessage): boolean {
  const n = msg.channelName.toLowerCase();
  const a = msg.author.toLowerCase();
  return n.includes("ceo") || a.includes("ceo") || a.includes("lyra") || a.includes("nova");
}

export default function PrivateFeed() {
  const content = useContent(); void content;
  const [data, setData]               = useState<FeedData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [countdown, setCountdown]     = useState(REFRESH_INTERVAL);
  const [filter, setFilter]           = useState<string>("all");
  const [search, setSearch]           = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [dismissed, setDismissed]     = useState(false);

  // Last-visit tracking — read once on mount, update immediately so next visit is fresh
  const lastVisitRef = useRef<Date | null>(null);
  const firstNewRef  = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) lastVisitRef.current = new Date(raw);
    // Record "now" so the NEXT visit sees today's messages as new
    localStorage.setItem(LS_KEY, new Date().toISOString());
  }, []);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setError(null);
      const r = await fetch(`${BASE}/api/discord/feed?limit=40`);
      const d: FeedData = await r.json();
      if (!d.ok) { setError("Failed to load feed"); return; }
      setData(d);
      setLastRefresh(new Date());
    } catch {
      setError("Network error — couldn't reach the server");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetCountdown = useCallback(() => {
    setCountdown(REFRESH_INTERVAL);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? REFRESH_INTERVAL : prev - 1));
    }, 1000);
  }, []);

  useEffect(() => {
    fetchFeed();
    resetCountdown();
    const poll = setInterval(() => { fetchFeed(); resetCountdown(); }, REFRESH_INTERVAL * 1000);
    return () => { clearInterval(poll); if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [fetchFeed, resetCountdown]);

  const handleRefresh = () => { fetchFeed(); resetCountdown(); };

  const markAllRead = () => {
    localStorage.setItem(LS_KEY, new Date().toISOString());
    lastVisitRef.current = new Date();
    setDismissed(true);
  };

  const jumpToNew = () => {
    firstNewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const channels     = data?.channels ?? [];
  const allMessages  = data?.messages ?? [];
  const cutoff       = lastVisitRef.current;

  const isNew = (msg: FeedMessage) =>
    !dismissed && cutoff !== null && new Date(msg.timestamp) > cutoff;

  const filtered = allMessages.filter(msg => {
    if (filter !== "all" && msg.channelId !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        msg.content.toLowerCase().includes(s) ||
        msg.author.toLowerCase().includes(s) ||
        msg.channelName.toLowerCase().includes(s) ||
        msg.embeds.some(e =>
          (e.title || "").toLowerCase().includes(s) ||
          (e.description || "").toLowerCase().includes(s)
        )
      );
    }
    return true;
  });

  const newMessages  = filtered.filter(isNew);
  const newCount     = newMessages.length;
  const hasCeo       = filtered.filter(isCeoMessage).length > 0 && filter === "all" && !search;
  const ceoPinned    = filtered.filter(isCeoMessage);

  // Index of first "new" message in the filtered list (for divider placement)
  const firstNewIdx = filtered.findIndex(isNew);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>📡</span>
              Private Channel Feed
              {data && (
                <span className="text-xs font-normal text-gray-400 ml-1">
                  {data.channelCount} channels · {data.total} messages
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {countdown}s
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
              title="Refresh now"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                className={loading ? "animate-spin" : ""}>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 9M21 3v6h-6M21 12a9 9 0 0 1-15 6.7L3 15M3 21v-6h6"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Channel filter pills */}
        <div className="max-w-4xl mx-auto mt-2.5 flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              filter === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            All channels
          </button>
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setFilter(filter === ch.id ? "all" : ch.id)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                filter === ch.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : `${channelColor(ch.name)} hover:opacity-80`
              }`}
            >
              #{ch.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-4xl mx-auto mt-2">
          <input
            type="search"
            placeholder="Search messages, authors, channels…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
          />
        </div>
      </header>

      {/* ── "New since your last visit" sticky banner ──────────────────── */}
      {!loading && !error && newCount > 0 && !dismissed && !search && (
        <div className="sticky top-[130px] z-30 max-w-4xl mx-auto w-full px-4 pt-3">
          <div className="flex items-center gap-3 bg-violet-600 text-white rounded-2xl px-4 py-3 shadow-lg shadow-violet-200">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-base shrink-0">✨</span>
              <div className="min-w-0">
                <p className="text-xs font-bold">
                  {newCount} new message{newCount !== 1 ? "s" : ""} since your last visit
                </p>
                {cutoff && (
                  <p className="text-[10px] text-violet-200">
                    You were last here {formatLastVisit(cutoff.toISOString())}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={jumpToNew}
              className="shrink-0 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-xl px-3 py-1.5 transition-colors whitespace-nowrap"
            >
              Jump to new ↓
            </button>
            <button
              onClick={markAllRead}
              className="shrink-0 text-[10px] font-semibold text-violet-200 hover:text-white transition-colors whitespace-nowrap"
            >
              Mark all read
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors text-violet-200 hover:text-white"
              title="Dismiss"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 space-y-3">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Scanning private channels…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={handleRefresh} className="mt-2 text-xs text-red-500 hover:text-red-700 underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
            <p className="text-2xl mb-2">🔇</p>
            <p className="text-sm font-semibold text-gray-700">No messages found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? "Try a different search term." : "No private channels accessible yet."}
            </p>
          </div>
        )}

        {/* CEO highlight strip */}
        {!loading && hasCeo && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">👑</span>
              <p className="text-xs font-bold text-amber-800 tracking-wide uppercase">CEO / Lyra Updates</p>
              <span className="ml-auto text-[10px] text-amber-600">
                {ceoPinned.length} message{ceoPinned.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {ceoPinned.slice(0, 5).map(msg => (
                <div key={msg.id} className="bg-white/70 rounded-xl p-3 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${channelColor(msg.channelName)}`}>
                      #{msg.channelName}
                    </span>
                    {isNew(msg) && (
                      <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-amber-700">{msg.author}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{relativeTime(msg.timestamp)}</span>
                  </div>
                  {msg.content && (
                    <p className="text-xs text-gray-800 leading-relaxed break-words">{msg.content}</p>
                  )}
                  {msg.embeds.map((e, i) => (
                    <div key={i} className="mt-1.5 pl-2 border-l-2 border-amber-300">
                      {e.title && <p className="text-xs font-semibold text-gray-700">{e.title}</p>}
                      {e.description && <p className="text-xs text-gray-500 leading-relaxed">{e.description}</p>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full feed */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            {lastRefresh && (
              <p className="text-[10px] text-gray-400 text-center pb-1">
                Last updated {formatTimestamp(lastRefresh.toISOString())} · auto-refreshes every {REFRESH_INTERVAL}s
              </p>
            )}

            {filtered.map((msg, idx) => {
              const msgIsNew     = isNew(msg);
              const isFirstNew   = idx === firstNewIdx && msgIsNew && !dismissed && !search;
              const prevIsOld    = idx > 0 && !isNew(filtered[idx - 1]);
              const showDivider  = isFirstNew && prevIsOld && newCount > 0;

              return (
                <div key={msg.id}>
                  {/* ── "New messages" divider line ── */}
                  {showDivider && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-violet-200" />
                      <span className="shrink-0 text-[10px] font-bold text-violet-500 tracking-widest uppercase">
                        New messages
                      </span>
                      <div className="flex-1 h-px bg-violet-200" />
                    </div>
                  )}

                  <div ref={isFirstNew ? firstNewRef : undefined}>
                    <MessageCard msg={msg} isNew={msgIsNew} />
                  </div>
                </div>
              );
            })}

            {/* ── "You're all caught up" footer ── */}
            {!loading && filtered.length > 0 && (
              <div className="py-4 text-center">
                <p className="text-[10px] text-gray-300 font-medium">
                  {cutoff && !dismissed && newCount === 0
                    ? "✓ All caught up — no new messages since your last visit"
                    : "End of feed"}
                </p>
              </div>
            )}
          </div>
        )}
        <DynamicBlocks page="updates" className="max-w-4xl mx-auto px-4 mt-4 mb-4" />
      </main>
    </div>
  );
}

function MessageCard({ msg, isNew }: { msg: FeedMessage; isNew: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = msg.content.length > 280;
  const displayContent = isLong && !expanded ? msg.content.slice(0, 280) + "…" : msg.content;

  return (
    <div className={`bg-white rounded-2xl border transition-shadow hover:shadow-sm ${
      isNew
        ? "border-violet-200 ring-1 ring-violet-100"
        : isCeoMessage(msg)
        ? "border-amber-200"
        : "border-gray-100"
    }`}>
      <div className="p-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${channelColor(msg.channelName)}`}>
            #{msg.channelName}
          </span>
          {msg.category && (
            <span className="text-[10px] text-gray-400 font-medium">{msg.category}</span>
          )}
          {isNew && (
            <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full animate-pulse">
              NEW
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {msg.isBot && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-200">
                BOT
              </span>
            )}
            <span className="text-[10px] font-semibold text-gray-700">{msg.author}</span>
            <span className="text-[10px] text-gray-400">· {relativeTime(msg.timestamp)}</span>
          </div>
        </div>

        {/* Content */}
        {msg.content && (
          <div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
              {displayContent}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-violet-500 hover:text-violet-700 mt-1 font-medium"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {/* Embeds */}
        {msg.embeds.map((e, i) => (
          <div key={i} className="mt-2 pl-3 border-l-2 border-indigo-200 bg-indigo-50/40 rounded-r-xl py-2 pr-3">
            {e.title && <p className="text-xs font-semibold text-gray-800 mb-0.5">{e.title}</p>}
            {e.description && <p className="text-xs text-gray-600 leading-relaxed">{e.description}</p>}
          </div>
        ))}

        {/* Attachments / reactions */}
        {(msg.attachmentCount > 0 || msg.reactionCount > 0 || msg.edited) && (
          <div className="flex items-center gap-3 mt-2">
            {msg.attachmentCount > 0 && (
              <span className="text-[10px] text-gray-400">
                📎 {msg.attachmentCount} attachment{msg.attachmentCount !== 1 ? "s" : ""}
              </span>
            )}
            {msg.reactionCount > 0 && (
              <span className="text-[10px] text-gray-400">
                💬 {msg.reactionCount} reaction{msg.reactionCount !== 1 ? "s" : ""}
              </span>
            )}
            {msg.edited && (
              <span className="text-[10px] text-gray-300 italic">edited</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
