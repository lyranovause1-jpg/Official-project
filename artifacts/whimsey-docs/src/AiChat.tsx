import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "wouter";

type Role = "user" | "assistant";
interface Message { role: Role; content: string; id: string }

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

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
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
          <div className="prose prose-sm prose-pink max-w-none prose-p:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-pink-700 prose-code:bg-pink-50 prose-code:text-pink-800 prose-code:px-1 prose-code:rounded prose-pre:bg-pink-50 prose-pre:border prose-pre:border-pink-100 prose-strong:text-gray-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiChat() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message      = { role: "user",      content: text.trim(), id: crypto.randomUUID() };
    const assistantMsg: Message = { role: "assistant", content: "",          id: crypto.randomUUID() };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

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
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant") {
                  copy[copy.length - 1] = { ...last, content: last.content + parsed.content };
                }
                return copy;
              });
            }
            if (parsed.error) {
              setMessages((prev) => {
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
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Something went wrong. Please try again. 💗" };
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

  const lastIsTyping = streaming && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "";

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 via-white to-violet-50">

      {/* ── Header ── */}
      <header className="shrink-0 bg-white/80 backdrop-blur border-b border-pink-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/">
          <button className="p-2 rounded-lg hover:bg-pink-50 transition-colors text-muted-foreground hover:text-pink-600" aria-label="Back to docs">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-lg shadow">
          💗
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">WHIMSEY AI</p>
          <p className="text-[11px] text-pink-500 font-medium">Your personal Discord setup expert · $CNDY · 30,000 NFTs</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-gray-400 font-medium">Online</span>
        </div>
      </header>

      {/* ── Messages ── */}
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
            </div>
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
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {lastIsTyping && (
              <div className="flex gap-3 items-end mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold shadow-sm shrink-0">💗</div>
                <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* ── Quick pills (when there are messages) ── */}
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

      {/* ── Input ── */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-t border-pink-100 px-4 py-3">
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
  );
}
