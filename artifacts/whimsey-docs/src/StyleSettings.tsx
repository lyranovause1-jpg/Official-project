import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface StyleState {
  publicChannel: string;
  ticketChannel: string;
}

const PLACEHOLDERS = {
  publicChannel: "Describe how WHIMSEY AI should write for public channels — tone, length, emoji use, how to open and close messages, anything that matters to you.",
  ticketChannel: "Describe how WHIMSEY AI should write ticket replies — how formal, how short, whether to number steps, how to close the message.",
};

const EXAMPLES = {
  publicChannel: [
    { label: "Dreamy founder", value: `Warm, dreamy, and confident — like a founder who genuinely cares.\n\nRules:\n- Open with a hook that earns attention\n- Short paragraphs (1-3 lines), never one block of text\n- Emojis: 1-3 max, placed purposefully\n- End with energy — a CTA, a question, or a feeling\n- Always feel like Lyra personally wrote it` },
    { label: "Hype & energy", value: `High energy, bold, and exciting — like launch day every day.\n\nRules:\n- Lead with the most exciting detail first\n- Short punchy sentences\n- Caps for emphasis sparingly\n- 2-4 relevant emojis\n- End with a clear call to action` },
    { label: "Soft & minimal", value: `Quiet, aesthetic, and intentional — never loud.\n\nRules:\n- One idea per message\n- No more than 3 lines total\n- Zero or one emoji — only if it adds something\n- Never exclamation marks\n- Let the work speak` },
  ],
  ticketChannel: [
    { label: "Friendly helper", value: `Friendly, patient, and direct — like a team member who actually read the question.\n\nRules:\n- Address the exact issue first line\n- 3-5 lines max\n- Number steps if needed (1. 2. 3.)\n- End with a next step or offer to help further\n- One emoji max` },
    { label: "Formal support", value: `Professional and precise — clear without being cold.\n\nRules:\n- Open by acknowledging their issue\n- Numbered steps for any process\n- No slang or casual language\n- Close with "Let me know if you need anything else"\n- No emojis` },
    { label: "Warm & quick", value: `Warm and to the point — like a friend who knows what they're doing.\n\nRules:\n- One or two sentences max\n- Super casual tone\n- Always end on a helpful note\n- Emoji if it lightens the mood` },
  ],
};

type StyleKey = "publicChannel" | "ticketChannel";

export default function StyleSettings() {
  const [style, setStyle]         = useState<StyleState>({ publicChannel: "", ticketChannel: "" });
  const [saving, setSaving]       = useState<StyleKey | null>(null);
  const [saved, setSaved]         = useState<StyleKey | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StyleKey>("publicChannel");

  // Preview state
  const [previewPrompt, setPreviewPrompt] = useState("");
  const [previewOutput, setPreviewOutput] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const runPreview = async () => {
    if (!previewPrompt.trim()) return;
    setPreviewLoading(true);
    setPreviewOutput("");
    try {
      const context = activeTab === "publicChannel"
        ? `You are about to draft a message for a PUBLIC channel. Follow the public channel style guide above exactly.`
        : `You are about to draft a TICKET reply. Follow the ticket channel style guide above exactly.`;
      const r = await fetch(`${BASE}/api/whimsey/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `${context}\n\nDraft this for me now: ${previewPrompt.trim()}` }],
        }),
      });
      if (!r.body) { setPreviewLoading(false); return; }
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const d = JSON.parse(line.slice(5).trim());
            if (d.token) setPreviewOutput(p => p + d.token);
          } catch { /* ignore */ }
        }
      }
    } catch { /* silent */ }
    setPreviewLoading(false);
    setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  };

  const fetchStyle = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/style`);
      const d = await r.json();
      if (d.ok) setStyle(d.style);
    } catch {
      setError("Couldn't load current style settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStyle(); }, [fetchStyle]);

  const save = async (key: StyleKey) => {
    setSaving(key);
    setSaved(null);
    setError(null);
    try {
      const r = await fetch(`${BASE}/api/style`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: style[key] }),
      });
      const d = await r.json();
      if (d.ok) {
        setSaved(key);
        setTimeout(() => setSaved(null), 2500);
      } else {
        setError("Save failed — try again.");
      }
    } catch {
      setError("Network error — couldn't save.");
    } finally {
      setSaving(null);
    }
  };

  const applyExample = (key: StyleKey, value: string) => {
    setStyle(s => ({ ...s, [key]: value }));
  };

  const TABS: { key: StyleKey; label: string; icon: string; desc: string }[] = [
    {
      key: "publicChannel",
      label: "Public channels",
      icon: "📢",
      desc: "How WHIMSEY AI writes announcements, updates, and messages visible to your whole community.",
    },
    {
      key: "ticketChannel",
      label: "Ticket replies",
      icon: "🎫",
      desc: "How WHIMSEY AI responds inside ticket threads — to members asking for help, support, or verification.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-gray-900">✍️ Text Style Settings</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Define how WHIMSEY AI drafts messages — saved as permanent defaults
            </p>
          </div>
          <Link href="/ai">
            <button className="text-xs font-semibold bg-gradient-to-r from-pink-500 to-violet-500 text-white px-3 py-1.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity">
              Ask AI 💗
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Intro callout */}
        <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-100 p-4">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💗</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                WHIMSEY AI drafts every message in your voice
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Set your style once here, and every message WHIMSEY AI writes — whether it's a public announcement
                or a ticket reply — will follow these rules automatically. You can update them any time.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Tab switcher */}
            <div className="flex gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active tab panel */}
            {TABS.map(tab => activeTab === tab.key && (
              <div key={tab.key} className="space-y-4">
                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed">{tab.desc}</p>

                {/* Quick-apply examples */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">
                    Quick-apply a preset
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {EXAMPLES[tab.key].map(ex => (
                      <button
                        key={ex.label}
                        onClick={() => applyExample(tab.key, ex.value)}
                        className="text-[11px] font-semibold px-3 py-1.5 bg-white border border-gray-200 hover:border-violet-300 hover:text-violet-700 rounded-xl transition-colors"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main text box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">
                      Your style guide
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {style[tab.key].length} chars
                    </p>
                  </div>
                  <textarea
                    value={style[tab.key]}
                    onChange={e => setStyle(s => ({ ...s, [tab.key]: e.target.value }))}
                    placeholder={PLACEHOLDERS[tab.key]}
                    rows={14}
                    className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 outline-none resize-none focus:ring-2 focus:ring-violet-300 focus:border-transparent placeholder:text-gray-300 leading-relaxed font-mono"
                  />
                </div>

                {/* Preview hint */}
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex gap-3 items-start">
                  <span className="text-sm shrink-0">💡</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {tab.key === "publicChannel"
                      ? "When you ask WHIMSEY AI to post to a channel, it will follow this style guide for every draft. Be as specific as you like — the more detail, the better it matches your voice."
                      : "When WHIMSEY AI writes a ticket reply (from the Ticket Assistant or directly), it will follow this guide. Include any phrases you always use, or things you never want it to say."}
                  </p>
                </div>

                {/* Save button */}
                <div className="flex items-center gap-3 justify-end">
                  {saved === tab.key && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Saved — WHIMSEY AI will use this from now on
                    </span>
                  )}
                  <button
                    onClick={() => save(tab.key)}
                    disabled={saving === tab.key}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    {saving === tab.key ? "Saving…" : "Save style"}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Live Preview ── */}
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <span className="text-base">🔭</span>
            <div>
              <p className="text-xs font-bold text-gray-800">Test your style</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Type a prompt and see WHIMSEY AI draft it using your current {activeTab === "publicChannel" ? "public channel" : "ticket"} style guide
              </p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={previewPrompt}
                onChange={e => setPreviewPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !previewLoading) runPreview(); }}
                placeholder={
                  activeTab === "publicChannel"
                    ? "e.g. write a mint announcement, welcome post for new members…"
                    : "e.g. member asking why their wallet isn't verifying, refund question…"
                }
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent placeholder:text-gray-300"
              />
              <button
                onClick={runPreview}
                disabled={!previewPrompt.trim() || previewLoading}
                className="shrink-0 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-200 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                {previewLoading ? (
                  <>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="animate-spin">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                    </svg>
                    Drafting…
                  </>
                ) : "Preview draft"}
              </button>
            </div>

            {/* Output box */}
            {(previewOutput || previewLoading) && (
              <div ref={previewRef} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                    WHIMSEY AI draft
                  </span>
                  {previewLoading && (
                    <span className="text-[10px] text-violet-500 font-medium animate-pulse">writing…</span>
                  )}
                  {!previewLoading && previewOutput && (
                    <button
                      onClick={() => { setPreviewOutput(""); setPreviewPrompt(""); }}
                      className="ml-auto text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {previewOutput}
                  {previewLoading && <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-text-bottom" />}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
          <p className="text-xs font-bold text-gray-700">How this works</p>
          <div className="space-y-2.5">
            {[
              ["📢 Public channels", "WHIMSEY AI uses your public style guide whenever it drafts or posts to any public channel — announcements, welcome messages, update posts, everything."],
              ["🎫 Ticket replies", "When WHIMSEY AI responds inside a ticket thread — either from the Ticket Assistant tool or directly through AI chat — it follows your ticket style guide."],
              ["🔄 Always updatable", "Change your style any time. The new guide takes effect immediately on the next message WHIMSEY AI drafts. Nothing needs to be reset."],
              ["🧠 WHIMSEY AI reads this first", "Every time WHIMSEY AI drafts a message, your style guide is injected at the top of its instructions — above everything else."],
            ].map(([title, desc]) => (
              <div key={title as string} className="flex gap-3">
                <span className="text-sm shrink-0">{(title as string).split(" ")[0]}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{(title as string).slice(3)}</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{desc as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
