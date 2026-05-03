import { useState, useEffect } from "react";
import { Link } from "wouter";
import DynamicBlocks, { useContent } from "./DynamicBlocks";
import AiChangelog from "./AiChangelog";

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

  const greeting      = content?.pageHeaders?.home?.greeting  ?? "Hey Lyra 🌷";
  const subtitle      = content?.pageHeaders?.home?.subtitle  ?? "Setting up Discord for the first time is genuinely hard. You're not confused because you're doing it wrong — you're confused because it's a lot. That's completely normal. One step at a time.";
  const navLabels     = content?.navLabels ?? {};
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

  const doneCount = STEPS.filter(s => s.done(status)).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);
  const currentStep = STEPS.find(s => s.current(status));
  const currentIdx = currentStep ? STEPS.indexOf(currentStep) : doneCount;

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">WHIMSEY</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/discord">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {navLabels["/discord"] ?? "Server"}
            </button>
          </Link>
          <Link href="/simulator">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {navLabels["/simulator"] ?? "Drills"}
            </button>
          </Link>
          <Link href="/permissions">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {navLabels["/permissions"] ?? "Permissions"}
            </button>
          </Link>
          <Link href="/tickets">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {navLabels["/tickets"] ?? "Tickets"}
            </button>
          </Link>
          <Link href="/style">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {navLabels["/style"] ?? "Style"}
            </button>
          </Link>
          <Link href="/updates">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              {navLabels["/updates"] ?? "Updates"}
            </button>
          </Link>
          <Link href="/ai">
            <button className="px-3 py-1.5 text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors shadow-sm">
              Ask AI 💗
            </button>
          </Link>
        </nav>
      </header>

      <main className="max-w-xl mx-auto px-5 py-10 space-y-8">

        {/* ── Greeting ── */}
        <div className="border-b border-gray-200 pb-8">
          <p className="text-xs font-semibold text-pink-500 uppercase tracking-widest mb-2">Your WHIMSEY Setup</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{greeting}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{subtitle}</p>
        </div>

        {/* ── Progress ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Setup progress</p>
            <span className="text-xs font-semibold text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">{pct}% complete</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900 shrink-0">{doneCount} / {STEPS.length}</span>
          </div>
          {(status.memberCount > 0 || status.channelCount > 0) && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              {status.memberCount > 0 && <span className="text-[11px] text-gray-400">{status.memberCount} members</span>}
              {status.memberCount > 0 && status.channelCount > 0 && <span className="text-gray-200">·</span>}
              {status.channelCount > 0 && <span className="text-[11px] text-gray-400">{status.channelCount} channels</span>}
            </div>
          )}
        </div>

        {/* ── Focus card ── */}
        {currentStep && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest">Focus on this next</p>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-9 h-9 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-lg shrink-0">
                  {currentStep.emoji}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">{currentStep.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{currentStep.simple}</p>
                </div>
              </div>
              {currentStep.action && (
                <Link href={`/ai?q=${encodeURIComponent(currentStep.action)}`}>
                  <button className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold transition-colors">
                    Get help with this →
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Journey steps ── */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Your full journey</p>
          <div className="space-y-2">
            {STEPS.map((step, i) => {
              const isDone = step.done(status);
              const isCurrent = step.current(status);
              const isUpcoming = !isDone && !isCurrent && i > currentIdx;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 rounded-xl p-4 border transition-all ${
                    isDone
                      ? "bg-white border-gray-100"
                      : isCurrent
                      ? "bg-pink-50 border-pink-200"
                      : "bg-white border-gray-100 opacity-50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-pink-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-semibold ${isDone ? "text-gray-700" : isCurrent ? "text-gray-900" : "text-gray-500"}`}>
                        {step.title}
                      </p>
                      {isDone && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">Done</span>}
                      {isCurrent && <span className="text-[10px] font-semibold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-md">Now</span>}
                      {isUpcoming && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">Up next</span>}
                    </div>
                    <p className={`text-xs leading-relaxed ${isDone ? "text-gray-400" : isCurrent ? "text-gray-600" : "text-gray-400"}`}>
                      {step.simple}
                    </p>
                    {isCurrent && step.action && (
                      <Link href={`/ai?q=${encodeURIComponent(step.action)}`}>
                        <button className="mt-2 text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors">
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
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Common questions</p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map(q => (
              <Link key={q} href={`/ai?q=${encodeURIComponent(q)}`}>
                <button className="w-full text-left text-sm text-gray-700 bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 rounded-xl px-4 py-3 transition-colors shadow-sm">
                  {q}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI-added dynamic blocks ── */}
        <DynamicBlocks page="home" />

        {/* ── AI change log ── */}
        <AiChangelog />

        {/* ── Stuck card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-xl mb-2">🌷</p>
          <p className="text-sm font-semibold text-gray-900 mb-1">Confused? Stuck? Just ask.</p>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed max-w-xs mx-auto">
            The AI knows your entire server and can explain anything in plain words — or just do it for you.
          </p>
          <Link href="/ai">
            <button className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              Talk to WHIMSEY AI 💗
            </button>
          </Link>
          <p className="text-[11px] text-gray-400 mt-2">No dumb questions here.</p>
        </div>

        {/* ── Footer guide link ── */}
        <div className="text-center pb-4">
          <button
            onClick={() => setShowGuide(true)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            View the full 4,000-line technical guide →
          </button>
          <p className="text-[10px] text-gray-300 mt-1">Only if you need to look something specific up.</p>
        </div>

      </main>

      {/* ── Guide modal ── */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl border border-gray-100">
            <p className="text-2xl text-center mb-3">📖</p>
            <h2 className="text-base font-bold text-gray-900 text-center mb-1">The Full Technical Guide</h2>
            <p className="text-sm text-gray-500 text-center mt-1 mb-5 leading-relaxed">
              4,000+ lines of detail. Complete — but a lot. Only open it if you need to look something specific up.
            </p>
            <div className="space-y-2">
              <Link href="/guide">
                <button className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold transition-colors">
                  Open the full guide →
                </button>
              </Link>
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
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
