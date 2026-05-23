import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MemoryVault from "./components/MemoryVault";

/* ── Types ───────────────────────────────────────────────────────────── */
type Role = "user" | "assistant";
interface Message { role: Role; content: string; id: string; ts: number; }
interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/* ── API config ──────────────────────────────────────────────────────── */
const BASE      = import.meta.env.BASE_URL;
const AVATAR    = `${BASE}avatar.png`;
const API_ROOT  = BASE.replace(/\/$/, "").replace(/^\/whimsey-ai/, "");
const CHAT_API  = `${API_ROOT}/api/whimsey/chat`;
const sessionsUrl = (id: string) => `${API_ROOT}/api/sessions/${id}`;

/* ── Storage keys ────────────────────────────────────────────────────── */
const SK = {
  sessions: "wh_sessions_v3",
  activeId: "wh_active_id_v3",
  count:    "wh_session_count_v3",
  deviceId: "wh_device_id",
};

/* ── Device ID (only this one item lives in localStorage permanently) ─ */
function getDeviceId(): string {
  let id = localStorage.getItem(SK.deviceId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SK.deviceId, id);
  }
  return id;
}
const DEVICE_ID = getDeviceId();

/* ── localStorage helpers ────────────────────────────────────────────── */
function lsGet<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key: string, val: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ── Session helpers ─────────────────────────────────────────────────── */
function getCount(): number   { return lsGet<number>(SK.count, 0); }
function bumpCount(): number  { const n = getCount() + 1; lsSet(SK.count, n); return n; }
function loadSessions(): Session[] { return lsGet<Session[]>(SK.sessions, []); }
function persistSessions(s: Session[]): void { lsSet(SK.sessions, s); }
function loadActiveId(): string | null { return localStorage.getItem(SK.activeId); }
function persistActiveId(id: string): void { localStorage.setItem(SK.activeId, id); }

function makeSession(): Session {
  return {
    id: crypto.randomUUID(),
    name: `Session ${bumpCount()}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/* ── Bootstrap (from localStorage) ──────────────────────────────────── */
function bootstrap(): { sessions: Session[]; activeId: string; messages: Message[] } {
  let sessions = loadSessions();
  const savedId = loadActiveId();
  const activeExists = !!savedId && sessions.some(s => s.id === savedId);

  if (!activeExists) {
    if (sessions.length === 0) lsSet(SK.count, 0);
    const fresh = makeSession();
    sessions = [...sessions, fresh];
    persistSessions(sessions);
    persistActiveId(fresh.id);
    return { sessions, activeId: fresh.id, messages: [] };
  }
  const active = sessions.find(s => s.id === savedId)!;
  return { sessions, activeId: savedId!, messages: active.messages };
}

/* ── Server sync ─────────────────────────────────────────────────────── */
async function serverLoad(): Promise<{ sessions: Session[]; count: number } | null> {
  try {
    const res = await fetch(sessionsUrl(DEVICE_ID));
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
async function serverPush(sessions: Session[], count: number): Promise<boolean> {
  try {
    const res = await fetch(sessionsUrl(DEVICE_ID), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions, count }),
    });
    return res.ok;
  } catch { return false; }
}

/* ── Suggested prompts ───────────────────────────────────────────────── */
const SUGGESTED = [
  "How do I configure the Moderator ☁️ permissions?",
  "What's the exact role order after all bots are invited?",
  "How does the @everyone lockdown work?",
  "Walk me through setting up Carl-bot autopilot",
  "What do I do with NFT Tracker before mint day?",
  "How do I make #holder-verify visible only to Verified 🩵?",
  "What's my Day 1 plan step by step?",
  "How do I test my server before going public?",
];

/* ── Formatting ──────────────────────────────────────────────────────── */
function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function fmtFull(ts: number): string {
  return `${fmtDate(ts)} at ${fmtTime(ts)}`;
}
function fmtMsgTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday ? fmtTime(ts) : `${fmtDate(ts)} · ${fmtTime(ts)}`;
}

/* ── UI: TypingDots ──────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
      ))}
    </div>
  );
}

/* ── UI: MessageBubble ───────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end mb-5`}>
      <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden ${
        isUser
          ? "text-white"
          : ""
      }`} style={isUser ? {
        background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
        boxShadow: "0 4px 14px rgba(139,92,246,0.45)",
      } : {
        boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
      }}>
        {isUser ? <span className="text-[10px] font-bold">You</span> : <img src={AVATAR} alt="W" className="w-full h-full object-cover" />}
      </div>
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
          style={isUser ? {
            background: "linear-gradient(135deg, #ec4899 0%, #a855f7 60%, #7c3aed 100%)",
            color: "white",
            boxShadow: "0 8px 24px rgba(168,85,247,0.35), 0 2px 8px rgba(0,0,0,0.1)",
          } : {
            background: "rgba(255,255,255,0.62)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.75)",
            color: "#1e1b4b",
            boxShadow: "0 8px 24px rgba(139,92,246,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          }}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-violet-800 prose-code:bg-violet-50 prose-code:text-violet-700 prose-code:px-1 prose-code:rounded prose-pre:bg-violet-50 prose-pre:border prose-pre:border-violet-100 prose-strong:text-violet-900 prose-a:text-violet-600">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {msg.ts && (
          <span className="text-[10px] px-1" style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{fmtMsgTime(msg.ts)}</span>
        )}
      </div>
    </div>
  );
}

/* ── UI: SaveButton ──────────────────────────────────────────────────── */
type SaveStatus = "idle" | "saving" | "saved" | "error";
function SaveButton({ status, onClick }: { status: SaveStatus; onClick: () => void }) {
  const cfg = {
    idle:   { label: "Save Session",  icon: "💾", cls: "border-pink-200 text-pink-500 hover:bg-pink-50 hover:border-pink-400" },
    saving: { label: "Saving…",       icon: "⏳", cls: "border-pink-200 text-pink-400 opacity-70 cursor-not-allowed" },
    saved:  { label: "All Saved! ✓",  icon: "✅", cls: "border-emerald-200 text-emerald-600 bg-emerald-50" },
    error:  { label: "Retry Save",    icon: "⚠️", cls: "border-orange-200 text-orange-500 hover:bg-orange-50" },
  }[status];
  return (
    <button
      onClick={onClick}
      disabled={status === "saving"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${cfg.cls}`}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </button>
  );
}

/* ── UI: SessionSidebar ──────────────────────────────────────────────── */
interface SidebarProps {
  sessions: Session[];
  activeId: string;
  saveStatus: SaveStatus;
  onSwitch: (id: string) => void;
  onNew: () => void;
  onSave: () => void;
  onClose: () => void;
}
function SessionSidebar({ sessions, activeId, saveStatus, onSwitch, onNew, onSave, onClose }: SidebarProps) {
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div className="flex flex-col w-72 shrink-0 h-full z-20" style={{
      background: "rgba(255,255,255,0.52)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      borderRight: "1px solid rgba(255,255,255,0.6)",
      boxShadow: "4px 0 30px rgba(139,92,246,0.1)",
    }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-violet-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">Session History</span>
          <span className="text-[10px] bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded-full font-semibold">
            {sessions.length}
          </span>
        </div>
        <button onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all text-xs">
          ✕
        </button>
      </div>

      {/* New session button */}
      <div className="px-3 py-2.5 border-b border-pink-50 flex gap-2">
        <button onClick={onNew}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-pink-600 hover:to-violet-600 transition-all">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Session
        </button>
        <SaveButton status={saveStatus} onClick={onSave} />
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">No sessions yet</p>
        )}
        {sorted.map((session) => {
          const isActive = session.id === activeId;
          const lastUserMsg = session.messages.filter(m => m.role === "user").slice(-1)[0];
          const preview = lastUserMsg
            ? lastUserMsg.content.slice(0, 60) + (lastUserMsg.content.length > 60 ? "…" : "")
            : "No messages yet";
          return (
            <button key={session.id} onClick={() => onSwitch(session.id)}
              className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                isActive
                  ? "bg-pink-50 border-pink-200 shadow-sm"
                  : "border-transparent hover:bg-gray-50 hover:border-gray-100"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[13px] font-semibold ${isActive ? "text-pink-600" : "text-gray-700"}`}>
                  {session.name}
                </span>
                {isActive && (
                  <span className="shrink-0 text-[9px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 leading-snug line-clamp-2 mb-2">{preview}</p>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
                  <span>Started: {fmtFull(session.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
                  <span>{session.messages.length} message{session.messages.length !== 1 ? "s" : ""} · Last: {fmtFull(session.updatedAt)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-pink-50 bg-gradient-to-r from-pink-50/50 to-violet-50/50">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Sessions saved to database — synced across browsers and devices.
        </p>
      </div>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────────────────── */
export default function App() {
  const init = useState(() => bootstrap())[0];

  const [sessions, setSessions]   = useState<Session[]>(init.sessions);
  const [activeId, setActiveId]   = useState<string>(init.activeId);
  const [messages, setMessages]   = useState<Message[]>(init.messages);
  const [input, setInput]         = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSuggested, setShowSuggested] = useState(init.messages.length === 0);
  const [showHistory, setShowHistory]     = useState(false);
  const [saveStatus, setSaveStatus]       = useState<SaveStatus>("idle");
  const [serverSynced, setServerSynced]   = useState(false);
  const [view, setView]                   = useState<"chat" | "vault">("chat");

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const saveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for stale-closure safety
  const messagesRef  = useRef(messages);
  const activeIdRef  = useRef(activeId);
  const sessionsRef  = useRef(sessions);
  useEffect(() => { messagesRef.current = messages;   }, [messages]);
  useEffect(() => { activeIdRef.current = activeId;   }, [activeId]);
  useEffect(() => { sessionsRef.current = sessions;   }, [sessions]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  /* ── Sync messages → sessions when streaming ends ── */
  useEffect(() => {
    if (!streaming && messagesRef.current.length > 0) {
      const msgs = messagesRef.current;
      setSessions(prev => {
        const updated = prev.map(s =>
          s.id === activeIdRef.current
            ? { ...s, messages: msgs, updatedAt: Date.now() }
            : s
        );
        persistSessions(updated);
        return updated;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  /* ── Push to server (debounced 2 s after last change) ── */
  const pushDebounced = useCallback((snapshotSessions: Session[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      const ok = await serverPush(snapshotSessions, getCount());
      setSaveStatus(ok ? "saved" : "error");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 2000);
  }, []);

  /* ── Auto-push when sessions change ── */
  useEffect(() => {
    if (serverSynced) pushDebounced(sessions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  /* ── Load from server on mount; merge with localStorage ── */
  useEffect(() => {
    serverLoad().then(data => {
      setServerSynced(true);
      if (!data || data.sessions.length === 0) {
        // Nothing on server — push local data up
        if (sessionsRef.current.length > 0) {
          serverPush(sessionsRef.current, getCount());
        }
        return;
      }
      // Merge: server wins for sessions it knows about
      const localSessions = sessionsRef.current;
      const merged = new Map<string, Session>();

      localSessions.forEach(s => merged.set(s.id, s));
      data.sessions.forEach((serverSession: Session) => {
        const local = merged.get(serverSession.id);
        // Server wins if it has more messages or is newer
        if (!local || serverSession.updatedAt >= local.updatedAt || serverSession.messages.length >= local.messages.length) {
          merged.set(serverSession.id, serverSession);
        }
      });

      const mergedArr = Array.from(merged.values()).sort((a, b) => a.createdAt - b.createdAt);

      // Restore count
      if (data.count && data.count > getCount()) {
        lsSet(SK.count, data.count);
      }

      setSessions(mergedArr);
      persistSessions(mergedArr);

      // Re-load active session messages from merged data
      const activeSession = mergedArr.find(s => s.id === activeIdRef.current);
      if (activeSession) {
        setMessages(activeSession.messages);
        setShowSuggested(activeSession.messages.length === 0);
      } else if (mergedArr.length > 0) {
        const latest = mergedArr[mergedArr.length - 1];
        setActiveId(latest.id);
        persistActiveId(latest.id);
        setMessages(latest.messages);
        setShowSuggested(latest.messages.length === 0);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Manual save ── */
  const manualSave = useCallback(async () => {
    if (saveStatus === "saving") return;
    // Flush current messages to sessions first
    const msgs = messagesRef.current;
    let latestSessions = sessionsRef.current;
    if (msgs.length > 0) {
      latestSessions = latestSessions.map(s =>
        s.id === activeIdRef.current
          ? { ...s, messages: msgs, updatedAt: Date.now() }
          : s
      );
      setSessions(latestSessions);
      persistSessions(latestSessions);
    }
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const ok = await serverPush(latestSessions, getCount());
    setSaveStatus(ok ? "saved" : "error");
    setTimeout(() => setSaveStatus("idle"), 3000);
  }, [saveStatus]);

  /* ── Flush current session to sessions array ── */
  function flushCurrent(): Session[] {
    const msgs = messagesRef.current;
    const updated = sessionsRef.current.map(s =>
      s.id === activeIdRef.current
        ? { ...s, messages: msgs, updatedAt: Date.now() }
        : s
    );
    setSessions(updated);
    persistSessions(updated);
    return updated;
  }

  /* ── Switch session ── */
  function switchSession(id: string) {
    if (id === activeIdRef.current) { setShowHistory(false); return; }
    flushCurrent();
    abortRef.current?.abort();
    setStreaming(false);

    const target = sessionsRef.current.find(s => s.id === id);
    if (!target) return;
    setActiveId(id);
    persistActiveId(id);
    setMessages(target.messages);
    setInput("");
    setShowSuggested(target.messages.length === 0);
    setShowHistory(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  /* ── New session ── */
  function startNewSession() {
    const flushed = flushCurrent();
    abortRef.current?.abort();
    setStreaming(false);

    const fresh = makeSession();
    const all = [...flushed, fresh];
    setSessions(all);
    persistSessions(all);
    setActiveId(fresh.id);
    persistActiveId(fresh.id);
    setMessages([]);
    setInput("");
    setShowSuggested(true);
    setShowHistory(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  /* ── Send message ── */
  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setShowSuggested(false);

    const now = Date.now();
    const userMsg: Message    = { role: "user",      content: text.trim(), id: crypto.randomUUID(), ts: now };
    const assistantMsg: Message = { role: "assistant", content: "",          id: crypto.randomUUID(), ts: now };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    // Full cross-session context (last 200 msgs total)
    const MAX_CTX = 200;
    const prevMsgs = sessionsRef.current
      .filter(s => s.id !== activeIdRef.current)
      .flatMap(s => s.messages);

    const history = [
      ...prevMsgs,
      ...messagesRef.current,
      userMsg,
    ].slice(-MAX_CTX).map(({ role, content }) => ({ role, content }));

    try {
      abortRef.current = new AbortController();
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              setMessages(prev => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant") {
                  copy[copy.length - 1] = { ...last, content: last.content + parsed.content };
                }
                return copy;
              });
            }
            if (parsed.error) {
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: parsed.error };
                return copy;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Something went wrong. Please try again." };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const lastIsStreaming = streaming
    && messages[messages.length - 1]?.role === "assistant"
    && messages[messages.length - 1]?.content === "";

  const activeSession = sessions.find(s => s.id === activeId);

  const AURORA = `
    radial-gradient(ellipse 75% 60% at 8% 8%,  rgba(255,182,200,0.92) 0%, transparent 55%),
    radial-gradient(ellipse 55% 42% at 90% 4%,  rgba(255,232,160,0.72) 0%, transparent 46%),
    radial-gradient(ellipse 88% 68% at 2% 54%,  rgba(68,202,255,0.80) 0%, transparent 56%),
    radial-gradient(ellipse 68% 58% at 56% 33%, rgba(118,138,255,0.88) 0%, transparent 56%),
    radial-gradient(ellipse 58% 46% at 88% 66%, rgba(255,128,218,0.72) 0%, transparent 48%),
    radial-gradient(ellipse 46% 38% at 22% 84%, rgba(178,108,255,0.62) 0%, transparent 46%),
    radial-gradient(ellipse 66% 46% at 50% 98%, rgba(152,98,255,0.58) 0%, transparent 52%),
    linear-gradient(158deg, #e2cafc 0%, #9ed8f8 22%, #b8d0ff 42%, #ddb8ff 62%, #f7badb 80%, #c8aafc 100%)
  `;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: view === "vault" ? "#06060e" : AURORA }}>

      {/* ── Session Sidebar (chat only) ── */}
      {view === "chat" && showHistory && (
        <SessionSidebar
          sessions={sessions}
          activeId={activeId}
          saveStatus={saveStatus}
          onSwitch={switchSession}
          onNew={startNewSession}
          onSave={manualSave}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* ── Main Column ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full" style={{ position: "relative", background: "transparent" }}>

        {/* ── Planet/Moon decoration (chat only) ── */}
        {view === "chat" && (
          <div style={{
            position: "absolute",
            right: "-8%",
            bottom: "-6%",
            width: "72%",
            maxWidth: "520px",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.52,
            mixBlendMode: "screen",
            filter: "saturate(1.3) brightness(1.1)",
          }}>
            <img src={`${BASE}moon.jpg`} alt="" style={{ width: "100%", display: "block", borderRadius: "2px" }} />
          </div>
        )}

        {/* Header */}
        <header className="shrink-0 border-b px-3 py-2.5 flex items-center gap-2.5" style={{
          position: "relative", zIndex: 10,
          background: view === "vault" ? "rgba(6,6,14,0.97)" : "rgba(255,255,255,0.28)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: view === "vault" ? "rgba(255,31,90,0.25)" : "rgba(255,255,255,0.5)",
          boxShadow: view === "vault" ? "none" : "0 2px 20px rgba(139,92,246,0.08)",
        }}>

          {/* Back to Setup Guide */}
          <a
            href="/"
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
            title="Back to Setup Guide"
            style={{
              border: view === "vault" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.45)",
              color: view === "vault" ? "rgba(255,255,255,0.5)" : "rgba(100,50,150,0.75)",
              background: view === "vault" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.25)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span className="hidden sm:inline">Setup Guide</span>
          </a>

          {/* Sidebar toggle */}
          <button
            onClick={() => setShowHistory(v => !v)}
            title="Session history"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              border: showHistory
                ? "1px solid rgba(168,85,247,0.5)"
                : view === "vault" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.45)",
              background: showHistory
                ? "rgba(168,85,247,0.18)"
                : view === "vault" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.25)",
              color: showHistory ? "#a855f7" : view === "vault" ? "rgba(255,255,255,0.4)" : "rgba(100,50,150,0.6)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="15" y2="18" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden" style={{
            border: "2px solid rgba(255,255,255,0.7)",
            boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
          }}>
            <img src={AVATAR} alt="WHIMSEY" className="w-full h-full object-cover" />
          </div>

          {/* Name + session */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold leading-tight" style={{ color: view === "vault" ? "#f8fafc" : "#2d1b6b" }}>WHIMSEY AI</p>
              {activeSession && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{
                  background: view === "vault" ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.15)",
                  color: view === "vault" ? "#c084fc" : "#7c3aed",
                  border: "1px solid rgba(168,85,247,0.3)",
                }}>
                  {activeSession.name}
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium truncate" style={{ color: view === "vault" ? "rgba(255,255,255,0.35)" : "rgba(139,92,246,0.8)" }}>
              Your personal Discord setup expert · $CNDY · 30,000 NFTs
            </p>
          </div>

          {/* Save button (chat only) */}
          {view === "chat" && <SaveButton status={saveStatus} onClick={manualSave} />}

          {/* Online */}
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium hidden sm:block" style={{ color: view === "vault" ? "rgba(255,255,255,0.35)" : "rgba(100,50,150,0.5)" }}>Online</span>
          </div>

          {/* Memory Vault toggle */}
          <button
            onClick={() => setView(v => v === "chat" ? "vault" : "chat")}
            title={view === "vault" ? "Back to chat" : "Open Memory Vault"}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 12px", borderRadius: "10px",
              border: view === "vault" ? "1px solid rgba(255,31,90,0.5)" : "1px solid rgba(255,255,255,0.45)",
              background: view === "vault" ? "rgba(255,31,90,0.15)" : "rgba(255,255,255,0.28)",
              color: view === "vault" ? "#ff4d6d" : "#7c3aed",
              fontSize: "11px", fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: view === "vault" ? "0 0 14px rgba(255,31,90,0.25)" : "0 2px 10px rgba(139,92,246,0.15)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "13px" }}>🔐</span>
            <span className="hidden sm:inline">{view === "vault" ? "← Chat" : "Memory Vault"}</span>
          </button>

          {/* New session (chat only) */}
          {view === "chat" && (
            <button
              onClick={startNewSession}
              title="Start new session"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New
            </button>
          )}
        </header>

        {/* ── Memory Vault ── */}
        {view === "vault" && (
          <div className="flex-1 overflow-hidden">
            <MemoryVault />
          </div>
        )}

        {/* Messages */}
        {view === "chat" && <main className="flex-1 overflow-y-auto scroll-smooth px-4 py-6" style={{ position: "relative", zIndex: 1 }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5 pb-12">
              {/* Avatar ring */}
              <div style={{
                width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden",
                border: "3px solid rgba(255,255,255,0.8)",
                boxShadow: "0 0 0 8px rgba(168,85,247,0.12), 0 12px 40px rgba(139,92,246,0.35)",
              }}>
                <img src={AVATAR} alt="WHIMSEY" className="w-full h-full object-cover" />
              </div>

              {/* Welcome text */}
              <div>
                <h1 style={{
                  fontSize: "22px", fontWeight: 800, margin: "0 0 8px",
                  background: "linear-gradient(135deg, #2d1b6b, #6d28d9, #be185d)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.4px",
                }}>Hey there, WHIMSEY creator!</h1>
                <p style={{ fontSize: "14px", color: "rgba(45,27,107,0.65)", maxWidth: "300px", margin: "0 auto", lineHeight: 1.6 }}>
                  I know your server inside-out — every role, every bot, every permission toggle. Ask me anything.
                </p>
                {activeSession && sessions.some(s => s.messages.length > 0) && (
                  <p style={{ fontSize: "11px", color: "rgba(139,92,246,0.7)", marginTop: "8px" }}>
                    {activeSession.name} · I remember everything from all your past conversations.
                  </p>
                )}
              </div>

              {/* Suggestion cards */}
              {showSuggested && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl mt-1">
                  {SUGGESTED.map((q) => (
                    <button key={q} onClick={() => send(q)}
                      className="text-left text-xs rounded-2xl px-4 py-3 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.45)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.7)",
                        color: "#2d1b6b",
                        boxShadow: "0 4px 14px rgba(139,92,246,0.1)",
                        fontWeight: 500,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.65)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(139,92,246,0.2)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.45)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(139,92,246,0.1)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              {lastIsStreaming && (
                <div className="flex gap-3 items-end mb-4">
                  <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden" style={{
                    border: "2px solid rgba(255,255,255,0.7)",
                    boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
                  }}>
                    <img src={AVATAR} alt="WHIMSEY" className="w-full h-full object-cover" />
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,0.75)",
                    boxShadow: "0 8px 24px rgba(139,92,246,0.12)",
                  }} className="rounded-2xl rounded-bl-sm px-4 py-3">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </main>}

        {/* Quick-reply pills (chat only) */}
        {view === "chat" && messages.length > 0 && !streaming && (
          <div className="shrink-0 px-4 pb-2" style={{ position: "relative", zIndex: 1 }}>
            <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
              {SUGGESTED.slice(0, 3).map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="text-[11px] rounded-full px-3 py-1.5 transition-all truncate max-w-[200px]"
                  style={{
                    background: "rgba(255,255,255,0.45)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.65)",
                    color: "#2d1b6b",
                    fontWeight: 500,
                  }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input (chat only) */}
        {view === "chat" && (
          <div className="shrink-0 border-t px-4 py-3" style={{
            position: "relative", zIndex: 1,
            background: "rgba(255,255,255,0.22)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderColor: "rgba(255,255,255,0.5)",
          }}>
            <div className="max-w-2xl mx-auto flex gap-2 items-end">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your WHIMSEY Discord setup…"
                disabled={streaming}
                className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm outline-none overflow-hidden leading-relaxed transition-all disabled:opacity-60"
                style={{
                  minHeight: "44px",
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1.5px solid rgba(255,255,255,0.7)",
                  color: "#2d1b6b",
                  boxShadow: "0 4px 16px rgba(139,92,246,0.1)",
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="shrink-0 w-11 h-11 rounded-full text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  boxShadow: "0 6px 20px rgba(139,92,246,0.45)",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] mt-1.5" style={{ color: "rgba(100,50,150,0.45)" }}>
              Enter to send · Shift+Enter for new line · All sessions saved to database
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
