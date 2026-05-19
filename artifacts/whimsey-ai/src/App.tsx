import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ── Types ───────────────────────────────────────────────────────────── */
type Role = "user" | "assistant";
interface Message { role: Role; content: string; id: string; }
interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/* ── Config ──────────────────────────────────────────────────────────── */
const BASE = import.meta.env.BASE_URL;
const API  = `${BASE.replace(/\/$/, "").replace(/^\/whimsey-ai/, "")}/api/whimsey/chat`;

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

/* ── Storage ─────────────────────────────────────────────────────────── */
const SK = {
  sessions: "whimsey_sessions_v2",
  activeId: "whimsey_active_id_v2",
  count:    "whimsey_session_count_v2",
};

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SK.sessions);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

function persistSessions(sessions: Session[]): void {
  try { localStorage.setItem(SK.sessions, JSON.stringify(sessions)); } catch {}
}

function getCount(): number {
  return parseInt(localStorage.getItem(SK.count) || "0", 10);
}

function bumpCount(): number {
  const n = getCount() + 1;
  localStorage.setItem(SK.count, String(n));
  return n;
}

function loadActiveId(): string | null {
  return localStorage.getItem(SK.activeId);
}

function persistActiveId(id: string): void {
  localStorage.setItem(SK.activeId, id);
}

function makeSession(): Session {
  const n = bumpCount();
  return {
    id: crypto.randomUUID(),
    name: `Session ${n}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/* ── Bootstrap ───────────────────────────────────────────────────────── */
function bootstrap(): { sessions: Session[]; activeId: string; messages: Message[] } {
  let sessions = loadSessions();
  const savedId = loadActiveId();
  const activeExists = !!savedId && sessions.some(s => s.id === savedId);

  if (!activeExists) {
    if (sessions.length === 0) localStorage.setItem(SK.count, "0");
    const fresh = makeSession();
    sessions = [...sessions, fresh];
    persistSessions(sessions);
    persistActiveId(fresh.id);
    return { sessions, activeId: fresh.id, messages: [] };
  }

  const active = sessions.find(s => s.id === savedId)!;
  return { sessions, activeId: savedId!, messages: active.messages };
}

/* ── UI Sub-components ───────────────────────────────────────────────── */
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

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end mb-4`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
        isUser ? "bg-pink-500 text-white" : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
      }`}>
        {isUser ? "You" : "💗"}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
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
    </div>
  );
}

function fmt(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

interface SidebarProps {
  sessions: Session[];
  activeId: string;
  onSwitch: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}

function SessionSidebar({ sessions, activeId, onSwitch, onNew, onClose }: SidebarProps) {
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div className="flex flex-col w-72 shrink-0 bg-white/95 backdrop-blur border-r border-pink-100 h-full shadow-xl z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-violet-50">
        <div className="flex items-center gap-2">
          <span className="text-base">🗂️</span>
          <span className="font-bold text-gray-800 text-sm">Session History</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all text-sm"
        >✕</button>
      </div>

      {/* New session button */}
      <div className="px-3 py-3 border-b border-pink-50">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:from-pink-600 hover:to-violet-600 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">No sessions yet</p>
        )}
        {sorted.map((session) => {
          const isActive = session.id === activeId;
          const lastMsg = session.messages.filter(m => m.role === "user").slice(-1)[0];
          const preview = lastMsg ? lastMsg.content.slice(0, 55) + (lastMsg.content.length > 55 ? "…" : "") : "Empty session";
          return (
            <button
              key={session.id}
              onClick={() => onSwitch(session.id)}
              className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                isActive
                  ? "bg-pink-50 border-pink-200 shadow-sm"
                  : "border-transparent hover:bg-gray-50 hover:border-gray-100"
              }`}
            >
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
              <p className="text-[11px] text-gray-400 leading-snug line-clamp-2 mb-1.5">{preview}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-300">
                  {session.messages.length} msg{session.messages.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[10px] text-gray-300">{fmt(session.updatedAt)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2.5 border-t border-pink-50 bg-pink-50/50">
        <p className="text-[10px] text-gray-400 text-center">
          WHIMSEY AI remembers everything across all sessions 💗
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

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  // Refs to avoid stale closures in effects / async functions
  const messagesRef = useRef(messages);
  const activeIdRef = useRef(activeId);
  const sessionsRef = useRef(sessions);
  useEffect(() => { messagesRef.current = messages; },   [messages]);
  useEffect(() => { activeIdRef.current = activeId; },   [activeId]);
  useEffect(() => { sessionsRef.current = sessions; },   [sessions]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Sync current messages to sessions storage when streaming ends
  useEffect(() => {
    if (!streaming) {
      setSessions(prev => {
        const updated = prev.map(s =>
          s.id === activeIdRef.current
            ? { ...s, messages: messagesRef.current, updatedAt: Date.now() }
            : s
        );
        persistSessions(updated);
        return updated;
      });
    }
  }, [streaming]);

  /* ── Session management ── */
  function flushCurrentSession() {
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

  function switchSession(id: string) {
    if (id === activeIdRef.current) { setShowHistory(false); return; }
    flushCurrentSession();
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
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function startNewSession() {
    flushCurrentSession();
    abortRef.current?.abort();
    setStreaming(false);

    const fresh = makeSession();
    setSessions(prev => {
      const updated = [...prev, fresh];
      persistSessions(updated);
      return updated;
    });
    setActiveId(fresh.id);
    persistActiveId(fresh.id);
    setMessages([]);
    setInput("");
    setShowSuggested(true);
    setShowHistory(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  /* ── Send message ── */
  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setShowSuggested(false);

    const userMsg: Message = { role: "user",      content: text.trim(), id: crypto.randomUUID() };
    const assistantMsg: Message = { role: "assistant", content: "",         id: crypto.randomUUID() };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    // Full context: all previous sessions + current session + new user message (max 200 msgs)
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
      const res = await fetch(API, {
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
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: "Something went wrong. Please try again. 💗",
          };
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
    <div className="flex h-screen bg-gradient-to-b from-pink-50 via-white to-violet-50 page-enter overflow-hidden">

      {/* ── History Sidebar ── */}
      {showHistory && (
        <SessionSidebar
          sessions={sessions}
          activeId={activeId}
          onSwitch={switchSession}
          onNew={startNewSession}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* ── Chat Column ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Header */}
        <header className="shrink-0 bg-white/90 backdrop-blur-md border-b border-pink-100 px-3 py-3 flex items-center gap-2.5 shadow-sm">
          {/* History toggle */}
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
          <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-base shadow">
            💗
          </div>

          {/* Name + session badge */}
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

          {/* Online dot */}
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-gray-400 font-medium hidden sm:block">Online</span>
          </div>

          {/* New session */}
          <button
            onClick={startNewSession}
            title="Start new session"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-pink-600 hover:to-violet-600 transition-all"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-4xl shadow-lg">
                💗
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Hey there, WHIMSEY creator! 🌷</h1>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  I know your server inside-out — every role, every bot, every permission toggle.
                  Ask me anything about setting it up! ❄️
                </p>
                {activeSession && sessions.filter(s => s.messages.length > 0).length > 0 && (
                  <p className="text-[11px] text-pink-400 mt-2">
                    Continuing in {activeSession.name} · I remember everything from your past conversations 💗
                  </p>
                )}
              </div>

              {showSuggested && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl mt-2">
                  {SUGGESTED.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left text-xs bg-white border border-pink-100 hover:border-pink-300 hover:bg-pink-50 rounded-xl px-3 py-2.5 text-gray-700 transition-colors shadow-sm"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                    💗
                  </div>
                  <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        {/* Suggested quick-reply pills */}
        {messages.length > 0 && !streaming && (
          <div className="shrink-0 px-4 pb-2">
            <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
              {SUGGESTED.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[11px] bg-white border border-pink-100 hover:border-pink-300 hover:bg-pink-50 rounded-full px-3 py-1 text-gray-600 transition-colors shadow-sm truncate max-w-[200px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
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
              placeholder="Ask anything about your WHIMSEY Discord setup… 💗"
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
                <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-1.5">
            Enter to send · Shift+Enter for new line · Powered by Replit AI
          </p>
        </div>
      </div>
    </div>
  );
}
