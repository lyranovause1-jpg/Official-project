import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "wouter";

type Role = "user" | "assistant";
interface Message { role: Role; content: string; id: string }

const STORAGE_KEY = "whimsey_ai_history";
const MAX_STORED   = 60;

const SUGGESTED = [
  "What's the current state of my server right now?",
  "Which bots are missing from my server?",
  "What do I need to do next?",
  "Create the Admin 💗 role with color #FF66B2",
  "How do I configure Moderator ☁️ permissions?",
  "Walk me through setting up Carl-bot",
  "How do I test my server before going public?",
  "Post 'Hello WHIMSEY fam! 💗' to general-chat",
];

const TOOL_LABELS: Record<string, string> = {
  get_server_status:    "Reading your live server…",
  get_bots:             "Checking bot status…",
  get_audit_log:        "Reading audit log…",
  get_channels:         "Fetching channels…",
  get_roles:            "Fetching roles…",
  get_invites:          "Fetching invites…",
  send_discord_message:    "Sending to Discord…",
  update_channel:          "Updating channel…",
  create_channel:          "Creating channel…",
  delete_channel:          "Deleting channel…",
  create_role:             "Creating role…",
  update_role:             "Updating role…",
  delete_role:             "Deleting role…",
  assign_role:             "Assigning role…",
  remove_role:             "Removing role…",
  kick_member:             "Kicking member…",
  ban_member:              "Banning member…",
  timeout_member:          "Timing out member…",
  unban_member:            "Unbanning member…",
  pin_message:             "Pinning message…",
  delete_message:          "Deleting message…",
  edit_message:            "Editing message…",
  get_channel_messages:    "Reading channel messages…",
  get_members:             "Fetching members…",
  set_channel_permissions: "Setting channel permissions…",
  create_invite:           "Creating invite link…",
  get_bans:                "Fetching ban list…",
  set_nickname:            "Setting nickname…",
};

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveHistory(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_STORED)));
  } catch { /* storage full */ }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-pink-300 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
      ))}
    </div>
  );
}

function ToolBanner({ label }: { label: string }) {
  return (
    <div className="flex gap-3 items-end mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">W</div>
      <div className="bg-violet-50 border border-violet-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
        <span className="text-violet-700 text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}

function MessageBubble({ msg, userInitial }: { msg: Message; userInitial: string }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end mb-4`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
        isUser
          ? "bg-pink-500 text-white"
          : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
      }`}>
        {isUser ? userInitial : "W"}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
        isUser
          ? "bg-pink-500 text-white rounded-br-sm"
          : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-gray-800 prose-headings:font-semibold prose-code:bg-gray-100 prose-code:text-pink-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-strong:text-gray-900 prose-a:text-pink-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function ClearModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-200">
        <h2 className="text-base font-bold text-gray-900 text-center mb-1">Start a new conversation?</h2>
        <p className="text-sm text-gray-500 text-center mb-5 leading-relaxed">
          This will clear your saved chat history. Your guide and AI knowledge are always here.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
            Keep chatting
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors shadow-sm">
            Clear &amp; start fresh
          </button>
        </div>
      </div>
    </div>
  );
}

function loadCurrentSession(): { name: string; role: string } | null {
  try {
    const raw = sessionStorage.getItem("whimsey_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function AiChat() {
  const session = loadCurrentSession();
  const userName  = session?.name  ?? "Lyra";
  const userRole  = session?.role  ?? "owner";
  const userInitial = userName[0].toUpperCase();

  const [messages, setMessages]   = useState<Message[]>(() => loadHistory());
  const [input, setInput]         = useState("");
  const [streaming, setStreaming] = useState(false);
  const [toolLabel, setToolLabel] = useState<string | null>(null);
  const [showClear, setShowClear] = useState(false);

  const [autoQ] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q?.trim()) {
      window.history.replaceState({}, "", window.location.pathname);
      return q.trim();
    }
    return null;
  });

  const [savedLabel, setSavedLabel] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, toolLabel]);

  useEffect(() => {
    if (messages.length === 0) return;
    saveHistory(messages);
    setSavedLabel("Saved");
    const t = setTimeout(() => setSavedLabel(""), 2000);
    return () => clearTimeout(t);
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setSavedLabel("");
    localStorage.removeItem(STORAGE_KEY);
    setShowClear(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const autoQFired = useRef(false);
  useEffect(() => {
    if (autoQ && !autoQFired.current) {
      autoQFired.current = true;
      const t = setTimeout(() => send(autoQ), 300);
      return () => clearTimeout(t);
    }
  }, [autoQ]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message      = { role: "user",      content: text.trim(), id: crypto.randomUUID() };
    const assistantMsg: Message = { role: "assistant", content: "",          id: crypto.randomUUID() };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);
    setToolLabel(null);

    const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/whimsey/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

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
              setToolLabel(null);
              setMessages(prev => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant") {
                  copy[copy.length - 1] = { ...last, content: last.content + parsed.content };
                }
                return copy;
              });
            }
            if (parsed.tool_call) {
              setToolLabel(TOOL_LABELS[parsed.tool_call] || `Running ${parsed.tool_call}…`);
            }
            if (parsed.tool_done) {
              setToolLabel(null);
            }
            if (parsed.error) {
              setToolLabel(null);
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
      setToolLabel(null);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const lastIsTyping = streaming && toolLabel === null
    && messages[messages.length - 1]?.role === "assistant"
    && messages[messages.length - 1]?.content === "";
  const hasHistory = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-[#fafafa]">

      {showClear && <ClearModal onConfirm={clearHistory} onCancel={() => setShowClear(false)} />}

      {/* ── Header ── */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3">
        <Link href="/">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700" aria-label="Back">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          W
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">WHIMSEY AI</p>
          <p className="text-[11px] text-gray-400">Live Discord access · $CNDY · 30,000 NFTs</p>
        </div>
        <div className="flex items-center gap-2">
          {savedLabel && (
            <span className="text-[10px] font-medium text-emerald-500">{savedLabel}</span>
          )}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
            userRole === "manager"
              ? "bg-violet-50 border-violet-100"
              : "bg-pink-50 border-pink-100"
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
              userRole === "manager" ? "bg-violet-500" : "bg-pink-500"
            }`}>{userInitial}</span>
            <span className={`text-[11px] font-semibold ${userRole === "manager" ? "text-violet-700" : "text-pink-700"}`}>
              {userName}
            </span>
            <span className={`text-[9px] font-medium uppercase tracking-wide ${userRole === "manager" ? "text-violet-400" : "text-pink-400"}`}>
              {userRole === "manager" ? "manager" : "owner"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-700 font-medium">Live</span>
          </div>
          <Link href="/discord">
            <button className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
              Server
            </button>
          </Link>
          {hasHistory && (
            <button
              onClick={() => setShowClear(true)}
              title="New conversation"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* ── Returning user banner ── */}
      {hasHistory && messages.length >= 2 && (
        <div className="shrink-0 bg-pink-50 border-b border-pink-100 px-5 py-2 flex items-center justify-between">
          <span className="text-[11px] text-pink-700 font-medium">
            Picking up where you left off · {messages.length} messages saved
          </span>
          <button onClick={() => setShowClear(true)} className="text-[11px] text-pink-500 hover:text-pink-700 underline underline-offset-2 transition-colors">
            Start fresh
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-5 py-6">
        {!hasHistory ? (
          <div className="flex flex-col justify-center h-full max-w-lg mx-auto pb-8">
            <div className="mb-6">
              <p className="text-xs font-semibold text-pink-500 uppercase tracking-widest mb-2">WHIMSEY AI</p>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Hey, {userName}! {userRole === "manager" ? "✨" : "🌷"}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                I know your entire WHIMSEY server — every role, every bot, every channel. I can also read and act on your server in real time. Just ask.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Try asking</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="text-left text-sm bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 rounded-xl px-4 py-3 text-gray-700 transition-colors font-medium leading-snug">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} userInitial={userInitial} />
            ))}
            {toolLabel && <ToolBanner label={toolLabel} />}
            {lastIsTyping && (
              <div className="flex gap-3 items-end mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">W</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* ── Quick suggestions ── */}
      {hasHistory && !streaming && (
        <div className="shrink-0 px-5 pb-2">
          <div className="max-w-2xl mx-auto flex gap-1.5 flex-wrap">
            {SUGGESTED.slice(0, 4).map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-[11px] bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 rounded-full px-3 py-1.5 text-gray-600 transition-colors shadow-sm font-medium truncate max-w-[220px]">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-5 py-3">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — or tell me to post, create roles, check your server…"
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 disabled:opacity-60 transition-all overflow-hidden leading-relaxed"
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="shrink-0 w-10 h-10 rounded-xl bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-1.5">
          Enter to send · Shift+Enter for new line · Auto-saved · Live Discord access
        </p>
      </div>
    </div>
  );
}
