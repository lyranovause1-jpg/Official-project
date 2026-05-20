import { useState, useEffect } from "react";
import { Link } from "wouter";
import DynamicBlocks, { useContent } from "./DynamicBlocks";
import AiChangelog from "./AiChangelog";
import DiscordActivityFeed from "./DiscordActivityFeed";

interface ServerStatus {
  botsPresent: string[];
  missingBots: string[];
  roleCount: number;
  channelCount: number;
  memberCount: number;
  loaded: boolean;
}

const STEPS = [
  {
    id: "server",
    emoji: "🌱",
    title: "Create your server",
    simple: "You already made the Discord server. That's done.",
    done: () => true,
    current: () => false,
  },
  {
    id: "bots",
    emoji: "🤖",
    title: "Invite your helper bots",
    simple: "Bots do the hard work — verifying wallets, managing roles, handling support. You don't lift a finger.",
    done: (s: ServerStatus) => s.loaded && s.missingBots.filter(b => b !== "WHIMSEY AI").length === 0,
    current: (s: ServerStatus) => s.loaded && s.missingBots.filter(b => b !== "WHIMSEY AI").length > 0,
    action: "Which bots do I still need to invite?",
  },
  {
    id: "roles",
    emoji: "🏷️",
    title: "Create your roles",
    simple: "Roles are labels that control who can see what. Admin, Moderator, Holder, Verified — four in total.",
    done: (s: ServerStatus) => s.loaded && s.roleCount >= 6,
    current: (s: ServerStatus) => s.loaded && s.roleCount < 6 && s.missingBots.filter(b => b !== "WHIMSEY AI").length === 0,
    action: "Create my Admin, Moderator, Holder, and Verified roles for me",
  },
  {
    id: "permissions",
    emoji: "🔒",
    title: "Set channel access",
    simple: "Decide who sees what. Holders get the exclusive channels. Everyone else sees the welcome area.",
    done: () => false,
    current: (s: ServerStatus) => s.loaded && s.roleCount >= 6,
    action: "Walk me through setting channel permissions step by step",
  },
  {
    id: "test",
    emoji: "🧪",
    title: "Do a test run",
    simple: "Before you open the doors, you check that everything works. Like a dress rehearsal.",
    done: () => false,
    current: () => false,
    action: "How do I test my server before going live?",
  },
  {
    id: "launch",
    emoji: "🚀",
    title: "Open to the world",
    simple: "Share your invite link. Your community arrives. WHIMSEY goes live.",
    done: () => false,
    current: () => false,
    action: "What's my launch checklist?",
  },
];

const QUICK_QUESTIONS = [
  "What is a Discord bot and why do I need one?",
  "What's the difference between a role and a channel?",
  "What does 'permission' mean in Discord?",
  "What should I do today?",
  "Am I doing this right?",
  "How long will all of this take?",
];

export default function HomeJourney() {
  const content = useContent();
  const [status, setStatus] = useState<ServerStatus>({
    botsPresent: [], missingBots: [], roleCount: 0, channelCount: 0, memberCount: 0, loaded: false,
  });
  const [showGuide, setShowGuide] = useState(false);

  const greeting       = content?.pageHeaders?.home?.greeting  ?? "Hey Lyra 🌷";
  const subtitle       = content?.pageHeaders?.home?.subtitle  ?? "Setting up Discord for the first time is genuinely hard. You're not confused because you're doing it wrong — you're confused because it's a lot. That's completely normal. One step at a time.";
  const quickQuestions = content?.quickQuestions ?? QUICK_QUESTIONS;

  useEffect(() => {
    Promise.all([
      fetch("/api/discord/bots").then(r => r.json()).catch(() => ({})),
      fetch("/api/discord/roles").then(r => r.json()).catch(() => ({})),
      fetch("/api/discord/status").then(r => r.json()).catch(() => ({})),
    ]).then(([bots, roles, srv]) => {
      setStatus({
        botsPresent: bots.bots?.map((b: { name: string }) => b.name) || [],
        missingBots: bots.missingBots || [],
        roleCount: roles.count || 0,
        channelCount: srv.channels?.length || 0,
        memberCount: srv.server?.memberCount || 0,
        loaded: true,
      });
    });
  }, []);

  const doneCount   = STEPS.filter(s => s.done(status)).length;
  const pct         = Math.round((doneCount / STEPS.length) * 100);
  const currentStep = STEPS.find(s => s.current(status));
  const currentIdx  = currentStep ? STEPS.indexOf(currentStep) : doneCount;

  return (
    <div className="min-h-screen" style={{ background: "#F4F2FC" }}>

      {/* ── Hero banner ── */}
      <div
        className="px-6 pt-8 pb-6"
        style={{ background: "linear-gradient(135deg, #1A0F2E 0%, #2D1B5A 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
            style={{ color: "rgba(255,102,178,0.8)" }}
          >
            Your WHIMSEY Setup
          </p>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: "-0.03em" }}>
            {greeting}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(214,200,255,0.7)" }}>
            {subtitle}
          </p>

          {/* Stat pills */}
          {(status.memberCount > 0 || status.channelCount > 0) && (
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {status.memberCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <span className="text-sm">👥</span>
                  <span className="text-xs font-semibold text-white">{status.memberCount} members</span>
                </div>
              )}
              {status.channelCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <span className="text-sm">📢</span>
                  <span className="text-xs font-semibold text-white">{status.channelCount} channels</span>
                </div>
              )}
              {status.roleCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <span className="text-sm">🏷️</span>
                  <span className="text-xs font-semibold text-white">{status.roleCount} roles</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-5 py-7 space-y-6">

        {/* ── Progress card ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid rgba(124,58,237,0.1)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-0.5" style={{ color: "#9F7AEA" }}>
                Setup Progress
              </p>
              <p className="text-xs" style={{ color: "#6E6183" }}>
                {doneCount} of {STEPS.length} steps complete
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: pct >= 80 ? "rgba(16,185,129,0.1)" : "rgba(232,30,140,0.08)",
                color: pct >= 80 ? "#059669" : "#E91E8C",
              }}
            >
              {pct}% done
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "#F0EDF8" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #FF66B2 0%, #7C3AED 100%)",
              }}
            />
          </div>
        </div>

        {/* ── Focus card ── */}
        {currentStep && (
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ border: "1px solid rgba(232,30,140,0.2)" }}
          >
            <div
              className="flex items-center gap-2.5 px-5 py-3"
              style={{ background: "linear-gradient(90deg, rgba(232,30,140,0.08), rgba(124,58,237,0.06))", borderBottom: "1px solid rgba(232,30,140,0.1)" }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: "#E91E8C" }} />
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#E91E8C" }}>
                Focus on this next
              </p>
            </div>
            <div className="bg-white p-5">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
                  style={{ background: "rgba(232,30,140,0.08)", border: "1px solid rgba(232,30,140,0.15)" }}
                >
                  {currentStep.emoji}
                </div>
                <div>
                  <h2 className="text-base font-bold mb-1" style={{ color: "#1A0F2E" }}>{currentStep.title}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#6E6183" }}>{currentStep.simple}</p>
                </div>
              </div>
              {currentStep.action && (
                <Link href={`/ai?q=${encodeURIComponent(currentStep.action)}`}>
                  <button
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-95 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #E91E8C 0%, #7C3AED 100%)" }}
                  >
                    Get help with this →
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Journey steps ── */}
        <div>
          <p
            className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3"
            style={{ color: "#9F7AEA" }}
          >
            Your Full Journey
          </p>
          <div className="space-y-2">
            {STEPS.map((step, i) => {
              const isDone    = step.done(status);
              const isCurrent = step.current(status);
              const isUpcoming = !isDone && !isCurrent && i > currentIdx;

              return (
                <div
                  key={step.id}
                  className="flex items-start gap-4 rounded-2xl p-4 transition-all"
                  style={{
                    background: isCurrent ? "rgba(232,30,140,0.04)" : "#FFFFFF",
                    border: isCurrent
                      ? "1px solid rgba(232,30,140,0.15)"
                      : "1px solid rgba(124,58,237,0.08)",
                    opacity: isUpcoming ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{
                      background: isDone
                        ? "#10B981"
                        : isCurrent
                        ? "#E91E8C"
                        : "#F0EDF8",
                      color: isDone || isCurrent ? "#FFFFFF" : "#9F7AEA",
                    }}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: isDone ? "#6E6183" : isCurrent ? "#1A0F2E" : "#6E6183" }}
                      >
                        {step.title}
                      </p>
                      {isDone && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                          Done
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(232,30,140,0.1)", color: "#E91E8C" }}>
                          Now
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "#F0EDF8", color: "#9F7AEA" }}>
                          Up next
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isDone ? "#9F7AEA" : "#6E6183" }}>
                      {step.simple}
                    </p>
                    {isCurrent && step.action && (
                      <Link href={`/ai?q=${encodeURIComponent(step.action)}`}>
                        <button className="mt-2 text-xs font-semibold transition-colors" style={{ color: "#E91E8C" }}>
                          Ask AI to help →
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Common questions ── */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#9F7AEA" }}>
            Common Questions
          </p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map(q => (
              <Link key={q} href={`/ai?q=${encodeURIComponent(q)}`}>
                <button
                  className="w-full text-left text-sm bg-white rounded-xl px-4 py-3 transition-all hover:shadow-sm"
                  style={{
                    color: "#1A0F2E",
                    border: "1px solid rgba(124,58,237,0.1)",
                  }}
                >
                  <span className="mr-2">→</span>{q}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI-added dynamic blocks ── */}
        <DynamicBlocks page="home" />

        {/* ── Discord activity feed ── */}
        <DiscordActivityFeed />

        {/* ── AI change log ── */}
        <AiChangelog />

        {/* ── Stuck card ── */}
        <div
          className="rounded-2xl p-6 text-center shadow-sm"
          style={{ background: "#FFFFFF", border: "1px solid rgba(124,58,237,0.1)" }}
        >
          <p className="text-2xl mb-2">🌷</p>
          <p className="text-sm font-bold mb-1" style={{ color: "#1A0F2E" }}>Confused? Stuck? Just ask.</p>
          <p className="text-xs leading-relaxed mb-4 max-w-xs mx-auto" style={{ color: "#6E6183" }}>
            The AI knows your entire server and can explain anything in plain words — or just do it for you.
          </p>
          <Link href="/ai">
            <button
              className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:opacity-95"
              style={{ background: "linear-gradient(135deg, #E91E8C 0%, #7C3AED 100%)" }}
            >
              Talk to WHIMSEY AI 💗
            </button>
          </Link>
          <p className="text-[11px] mt-2" style={{ color: "#9F7AEA" }}>No dumb questions here.</p>
        </div>

        {/* ── Footer guide link ── */}
        <div className="text-center pb-4">
          <button
            onClick={() => setShowGuide(true)}
            className="text-xs underline underline-offset-2 transition-colors"
            style={{ color: "#9F7AEA" }}
          >
            View the full 4,000-line technical guide →
          </button>
          <p className="text-[10px] mt-1" style={{ color: "#C4BAE0" }}>Only if you need to look something specific up.</p>
        </div>

      </main>

      {/* ── Guide modal ── */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl" style={{ border: "1px solid rgba(124,58,237,0.1)" }}>
            <p className="text-2xl text-center mb-3">📖</p>
            <h2 className="text-base font-bold text-center mb-1" style={{ color: "#1A0F2E" }}>The Full Technical Guide</h2>
            <p className="text-sm text-center mt-1 mb-5 leading-relaxed" style={{ color: "#6E6183" }}>
              4,000+ lines of detail. Complete — but a lot. Only open it if you need to look something specific up.
            </p>
            <div className="space-y-2">
              <Link href="/guide">
                <button
                  className="w-full py-2.5 text-white rounded-xl text-sm font-bold transition-colors"
                  style={{ background: "linear-gradient(135deg, #E91E8C, #7C3AED)" }}
                >
                  Open the full guide →
                </button>
              </Link>
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: "1px solid rgba(124,58,237,0.15)", color: "#6E6183" }}
              >
                Stay here (recommended)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
