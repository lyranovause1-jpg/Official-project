import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import DynamicBlocks, { useContent } from "./DynamicBlocks";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = [
  {
    id: "general",
    emoji: "💬",
    label: "General Question",
    hint: "e.g. 'When does mint start?' / 'How do I get the Holder role?'",
  },
  {
    id: "wallet",
    emoji: "🌌",
    label: "Wallet / Holder Issue",
    hint: "e.g. 'I verified my wallet but didn't get the Holder role' / 'I transferred my NFT'",
  },
  {
    id: "scam",
    emoji: "🚨",
    label: "Scam Report",
    hint: "e.g. 'Someone DMed me a fake mint link' / 'This person is pretending to be WHIMSEY support'",
  },
  {
    id: "bug",
    emoji: "🔧",
    label: "Bug / Server Issue",
    hint: "e.g. 'I can't see the holder channels even after verifying' / 'The verify button isn't working'",
  },
];

type Step = "pick" | "describe" | "draft";

interface DraftState {
  reply: string;
  note: string;
  loading: boolean;
  error: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        copied
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy reply
        </>
      )}
    </button>
  );
}

export default function TicketAssistant() {
  const content = useContent(); void content;
  const [step, setStep] = useState<Step>("pick");
  const [category, setCategory] = useState<(typeof CATEGORIES)[0] | null>(null);
  const [memberName, setMemberName] = useState("");
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState<DraftState>({ reply: "", note: "", loading: false, error: null });
  const replyRef = useRef<HTMLDivElement>(null);

  const cat = CATEGORIES.find(c => c.id === category?.id) ?? null;

  const handleDraft = async () => {
    if (!description.trim() || !category) return;
    setDraft({ reply: "", note: "", loading: true, error: null });
    setStep("draft");

    const memberLabel = memberName.trim() ? `Member name: ${memberName.trim()}` : "Member name: unknown";
    const prompt = `TICKET ASSISTANT MODE.

You are drafting the exact Discord reply that Lyra will paste into a private support ticket. Output format:

REPLY:
[The exact message to paste — written in Lyra's voice, warm but clear, uses emoji naturally, formatted for Discord plain text. Address the member by name if given. Use the saved reply templates from your training where relevant (I-need-wallet, Scam-confirmed, Closing-no-response). Do not use markdown headers or bullet lists — write it as a natural Discord message.]

NOTE FOR LYRA:
[One or two sentences explaining your reasoning and any action she should take before or after sending — e.g. "Vulcan should auto-fix this in the next re-verify cycle" or "Check audit-wallet-verifications first to confirm the wallet connected correctly".]

---

Ticket category: ${category.label}
${memberLabel}
Member's message: "${description.trim()}"`;

    try {
      const res = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const raw: string = data.reply ?? data.content ?? "";

      const replyMatch = raw.match(/REPLY:\s*([\s\S]*?)(?=NOTE FOR LYRA:|$)/i);
      const noteMatch = raw.match(/NOTE FOR LYRA:\s*([\s\S]*)/i);

      setDraft({
        reply: (replyMatch?.[1] ?? raw).trim(),
        note: (noteMatch?.[1] ?? "").trim(),
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      setDraft({ reply: "", note: "", loading: false, error: e instanceof Error ? e.message : "Something went wrong." });
    }
  };

  useEffect(() => {
    if (!draft.loading && draft.reply && replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [draft.loading, draft.reply]);

  const reset = () => {
    setStep("pick");
    setCategory(null);
    setMemberName("");
    setDescription("");
    setDraft({ reply: "", note: "", loading: false, error: null });
  };

  return (
    <div className="min-h-screen" style={{ background: "#F4F2FC" }}>

      {/* ── Page header ── */}
      <header
        className="sticky top-0 z-20 bg-white px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
      >
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-0.5" style={{ color: "#E91E8C" }}>
            WHIMSEY AI
          </p>
          <h1 className="text-base font-bold" style={{ color: "#1A0F2E" }}>Ticket Assistant</h1>
        </div>
        <a href="/whimsey-ai/">
          <button
            className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-95"
            style={{ background: "linear-gradient(135deg, #E91E8C, #7C3AED)" }}
          >
            Ask AI
          </button>
        </a>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">WHIMSEY AI</span>
            <span className="text-gray-200">·</span>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">Ticket Assistant</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Draft a ticket reply.</h1>
          <p className="text-sm text-gray-500">Tell WHIMSEY AI what the member said — get the exact message to paste into the ticket.</p>
        </div>

        {/* ── Progress pills ── */}
        <div className="flex items-center gap-2">
          {[
            { key: "pick", label: "1. Category" },
            { key: "describe", label: "2. Their message" },
            { key: "draft", label: "3. Your reply" },
          ].map((s, i, arr) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                step === s.key
                  ? "bg-pink-500 text-white"
                  : (step === "describe" && s.key === "pick") || (step === "draft")
                    ? "bg-pink-100 text-pink-600"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {s.label}
              </span>
              {i < arr.length - 1 && <span className="text-gray-200 text-xs">›</span>}
            </div>
          ))}
        </div>

        {/* ── Step 1: Pick category ── */}
        {step === "pick" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What kind of ticket is this?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c); setStep("describe"); }}
                  className="text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-pink-300 hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">{c.label}</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{c.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Describe ── */}
        {step === "describe" && cat && (
          <div className="space-y-4">
            {/* Selected category chip */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep("pick")}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Change
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100 rounded-full px-2.5 py-1">
                {cat.label}
              </span>
            </div>

            {/* Member name (optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Member's name <span className="font-normal normal-case text-gray-400">(optional — helps personalise the reply)</span>
              </label>
              <input
                type="text"
                value={memberName}
                onChange={e => setMemberName(e.target.value)}
                placeholder="e.g. stardust_eth"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white"
              />
            </div>

            {/* Their message */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                What did they say?
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={cat.hint}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 mt-1">Paste or summarise what they wrote. Exact words work best.</p>
            </div>

            <button
              onClick={handleDraft}
              disabled={!description.trim()}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-200 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Draft my reply →
            </button>
          </div>
        )}

        {/* ── Step 3: Draft ── */}
        {step === "draft" && (
          <div className="space-y-4" ref={replyRef}>
            {/* Context chip */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100 rounded-full px-2.5 py-1">
                {cat?.label}
                {memberName && <span className="text-pink-400 font-normal">· {memberName}</span>}
              </span>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Start over
              </button>
            </div>

            {draft.loading && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-pink-300 border-t-pink-600 animate-spin" />
                <p className="text-sm text-gray-400">Drafting your reply…</p>
              </div>
            )}

            {draft.error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
                {draft.error}
              </div>
            )}

            {!draft.loading && draft.reply && (
              <div className="space-y-3">
                {/* The reply box */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">Your reply — paste this into the ticket</span>
                    <CopyButton text={draft.reply} />
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-[inherit]">{draft.reply}</p>
                  </div>
                </div>

                {/* Note for Lyra */}
                {draft.note && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2.5">
                    <span className="text-sm">💡</span>
                    <p className="text-xs text-amber-800 leading-relaxed">{draft.note}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setStep("describe"); setDraft({ reply: "", note: "", loading: false, error: null }); }}
                    className="flex-1 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    ← Edit the message
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    New ticket →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <DynamicBlocks page="tickets" className="mt-2" />
      </main>
    </div>
  );
}
