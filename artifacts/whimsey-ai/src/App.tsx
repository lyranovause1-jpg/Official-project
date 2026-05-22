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
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
        isUser ? "bg-pink-500 text-white" : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
      }`}>
        {isUser ? <span className="text-[10px] font-bold">You</span> : <img src={AVATAR} alt="W" className="w-full h-full object-cover" />}
      </div>
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
          isUser
            ? "bg-pink-500 text-white rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm border border-pink-100"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm prose-pink max-w-none prose-p:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-pink-700 prose-code:bg-pink-50 prose-code:text-pink-800 prose-code:px-1 prose-code:rounded prose-pre:bg-pink-50 prose-pre:border prose-pre:border-pink-100 prose-strong:text-gray-900 prose-a:text-pink-600">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {msg.ts && (
          <span className="text-[10px] text-gray-300 px-1">{fmtMsgTime(msg.ts)}</span>
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
    <div className="flex flex-col w-72 shrink-0 bg-white/98 backdrop-blur border-r border-pink-100 h-full shadow-xl z-20">

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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: view === "vault" ? "#06060e" : undefined }}>

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
      <div className="flex flex-col flex-1 min-w-0 h-full" style={{ background: view === "vault" ? "#06060e" : "linear-gradient(to bottom, #fdf2f8, white, #f5f3ff)" }}>

        {/* Header */}
        <header className="shrink-0 backdrop-blur-md border-b px-3 py-2.5 flex items-center gap-2.5 shadow-sm" style={{
          background: view === "vault" ? "rgba(6,6,14,0.95)" : "rgba(255,255,255,0.9)",
          borderColor: view === "vault" ? "rgba(255,31,90,0.25)" : "rgb(252,231,243)",
        }}>

          {/* Back to Setup Guide */}
          <a
            href="/"
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-pink-100 text-pink-500 hover:bg-pink-50 hover:border-pink-200 transition-all text-xs font-semibold"
            title="Back to Setup Guide"
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
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              showHistory
                ? "bg-pink-100 text-pink-600 border border-pink-200"
                : "border border-pink-100 text-gray-400 hover:text-pink-500 hover:bg-pink-50 hover:border-pink-200"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="15" y2="18" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden shadow border border-pink-100">
            <img src={AVATAR} alt="WHIMSEY" className="w-full h-full object-cover" />
          </div>

          {/* Name + session */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900 leading-tight">WHIMSEY AI</p>
              {activeSession && (
                <span className="shrink-0 text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-semibold">
                  {activeSession.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-pink-500 font-medium truncate">
              Your personal Discord setup expert · $CNDY · 30,000 NFTs
            </p>
          </div>

          {/* Save button (chat only) */}
          {view === "chat" && <SaveButton status={saveStatus} onClick={manualSave} />}

          {/* Online */}
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium hidden sm:block" style={{ color: view === "vault" ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>Online</span>
          </div>

          {/* Memory Vault toggle */}
          <button
            onClick={() => setView(v => v === "chat" ? "vault" : "chat")}
            title={view === "vault" ? "Back to chat" : "Open Memory Vault"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 10px",
              borderRadius: "10px",
              border: view === "vault"
                ? "1px solid rgba(255,31,90,0.5)"
                : "1px solid rgba(252,231,243,1)",
              background: view === "vault"
                ? "rgba(255,31,90,0.15)"
                : "transparent",
              color: view === "vault" ? "#ff1f5a" : "#ec4899",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: view === "vault" ? "1px" : "0",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: view === "vault" ? "0 0 12px rgba(255,31,90,0.3)" : "none",
              fontFamily: view === "vault" ? "'Courier New', monospace" : "inherit",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "13px" }}>🔐</span>
            <span className="hidden sm:inline">{view === "vault" ? "CHAT" : "Memory Vault"}</span>
          </button>

          {/* New session (chat only) */}
          {view === "chat" && (
            <button
              onClick={startNewSession}
              title="Start new session"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-pink-600 hover:to-violet-600 transition-all"
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
        {view === "chat" && <main className="flex-1 overflow-y-auto scroll-smooth px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-pink-100">
                <img src={AVATAR} alt="WHIMSEY" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Hey there, WHIMSEY creator!</h1>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  I know your server inside-out — every role, every bot, every permission toggle.
                  Ask me anything about setting it up.
                </p>
                {activeSession && sessions.some(s => s.messages.length > 0) && (
                  <p className="text-[11px] text-pink-400 mt-2">
                    {activeSession.name} · I remember everything from all your past conversations.
                  </p>
                )}
              </div>
              {showSuggested && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl mt-2">
                  {SUGGESTED.map((q) => (
                    <button key={q} onClick={() => send(q)}
                      className="text-left text-xs bg-white border border-pink-100 hover:border-pink-300 hover:bg-pink-50 rounded-xl px-3 py-2.5 text-gray-700 transition-colors shadow-sm">
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
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm shrink-0 border border-pink-100">
                    <img src={AVATAR} alt="WHIMSEY" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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
          <div className="shrink-0 px-4 pb-2">
            <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
              {SUGGESTED.slice(0, 3).map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="text-[11px] bg-white border border-pink-100 hover:border-pink-300 hover:bg-pink-50 rounded-full px-3 py-1 text-gray-600 transition-colors shadow-sm truncate max-w-[200px]">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input (chat only) */}
        {view === "chat" && (
          <div className="shrink-0 bg-white/90 backdrop-blur-md border-t border-pink-100 px-4 py-3">
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
                className="flex-1 resize-none rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-pink-300 outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 disabled:opacity-60 transition-all overflow-hidden leading-relaxed"
                style={{ minHeight: "42px" }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                aria-label="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-300 mt-1.5">
              Enter to send · Shift+Enter for new line · All sessions saved to database
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
