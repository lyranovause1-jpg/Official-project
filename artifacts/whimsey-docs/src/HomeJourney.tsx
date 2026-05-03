import { useState, useEffect } from "react";
import { Link } from "wouter";

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
    title: "Your server exists",
    simple: "You already made the Discord server. That's done.",
    done: () => true,
    current: () => false,
  },
  {
    id: "bots",
    emoji: "🤖",
    title: "Invite your helper bots",
    simple: "Bots do the hard work automatically — verifying wallets, managing roles, handling support. You don't have to do any of that yourself.",
    done: (s: ServerStatus) => s.loaded && s.missingBots.filter(b => b !== "WHIMSEY AI").length === 0,
    current: (s: ServerStatus) => s.loaded && s.missingBots.filter(b => b !== "WHIMSEY AI").length > 0,
    action: "Which bots do I still need to invite?",
  },
  {
    id: "roles",
    emoji: "🎭",
    title: "Create your roles",
    simple: "Roles are like labels that give people different access. Admin (you), Moderator (your team), Holder (NFT owners), Verified (wallet linked). That's all there is to it.",
    done: (s: ServerStatus) => s.loaded && s.roleCount >= 6,
    current: (s: ServerStatus) => s.loaded && s.roleCount < 6 && s.missingBots.filter(b => b !== "WHIMSEY AI").length === 0,
    action: "Create my Admin, Moderator, Holder, and Verified roles for me",
  },
  {
    id: "permissions",
    emoji: "🔒",
    title: "Set up channel access",
    simple: "Decide who can see what. Holders see special channels. Verified members see community channels. Unverified people only see the welcome area.",
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

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>Your progress</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-violet-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function HomeJourney() {
  const [status, setStatus] = useState<ServerStatus>({
    botsPresent: [], missingBots: [], roleCount: 0, channelCount: 0, memberCount: 0, loaded: false,
  });
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/discord/bots").then(r => r.json()).catch(() => ({})),
      fetch("/api/discord/roles").then(r => r.json()).catch(() => ({})),
      fetch("/api/discord/status").then(r => r.json()).catch(() => ({})),
    ]).then(([bots, roles, srv]) => {
      setStatus({
        botsPresent: bots.bots?.map((b: any) => b.name) || [],
        missingBots: bots.missingBots || [],
        roleCount: roles.count || 0,
        channelCount: srv.channels?.length || 0,
        memberCount: srv.server?.memberCount || 0,
        loaded: true,
      });
    });
  }, []);

  const doneCount = STEPS.filter(s => s.done(status)).length;
  const currentStep = STEPS.find(s => s.current(status));
  const currentIdx = currentStep ? STEPS.indexOf(currentStep) : doneCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-violet-50">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-100 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-base shadow">
          💗
        </div>
        <span className="text-sm font-bold text-gray-900 flex-1">WHIMSEY</span>
        <Link href="/ai">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-semibold shadow-sm">
            💗 Ask AI anything
          </button>
        </Link>
        <Link href="/discord">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-100">
            🌌 Server
          </button>
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Warm greeting */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hey Lyra 🌷</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            Setting up Discord for the first time is genuinely hard. You're not confused because you're doing it wrong — you're confused because it's a lot. That's completely normal.
          </p>
          <p className="text-pink-600 text-sm font-medium mt-2">
            Let's do this one step at a time. Just focus on what's in front of you.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-4">
          <ProgressBar current={doneCount} total={STEPS.length} />
          <p className="text-xs text-gray-400 text-center mt-2">
            {doneCount} of {STEPS.length} steps done · You're getting there 💗
          </p>
        </div>

        {/* Current focus */}
        {currentStep && (
          <div className="bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-200 mb-1">Focus on this next</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{currentStep.emoji}</span>
              <h2 className="text-lg font-bold">{currentStep.title}</h2>
            </div>
            <p className="text-sm text-pink-100 leading-relaxed mb-4">{currentStep.simple}</p>
            {currentStep.action && (
              <Link href={`/ai?q=${encodeURIComponent(currentStep.action)}`}>
                <button className="w-full py-2.5 bg-white text-pink-600 rounded-xl text-sm font-bold hover:bg-pink-50 transition-colors shadow">
                  💗 Get help with this →
                </button>
              </Link>
            )}
          </div>
        )}

        {/* All steps */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Your full journey</p>
          {STEPS.map((step, i) => {
            const isDone = step.done(status);
            const isCurrent = step.current(status);
            const isWaiting = !isDone && !isCurrent && i > currentIdx;

            return (
              <div
                key={step.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isCurrent
                    ? "border-pink-300 bg-pink-50 shadow-sm"
                    : isDone
                    ? "border-emerald-100 bg-emerald-50/50"
                    : "border-gray-100 bg-white opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    isDone ? "bg-emerald-100 text-emerald-600" : isCurrent ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isDone ? "✓" : isCurrent ? step.emoji : step.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-semibold ${isDone ? "text-emerald-700" : isCurrent ? "text-pink-700" : "text-gray-500"}`}>
                        {step.title}
                      </p>
                      {isDone && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Done ✓</span>}
                      {isCurrent && <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-full">Now</span>}
                      {isWaiting && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Coming up</span>}
                    </div>
                    <p className={`text-xs leading-relaxed ${isDone ? "text-emerald-600" : isCurrent ? "text-pink-600/80" : "text-gray-400"}`}>
                      {step.simple}
                    </p>
                    {isCurrent && step.action && (
                      <Link href={`/ai?q=${encodeURIComponent(step.action)}`}>
                        <button className="mt-2 text-xs font-semibold text-pink-600 hover:text-pink-700 underline underline-offset-2">
                          Ask AI to help with this →
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feeling stuck card */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 text-center">
          <p className="text-2xl mb-2">🌷</p>
          <p className="text-sm font-semibold text-gray-900 mb-1">Confused about something?</p>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            You don't need to figure it out alone. The AI knows your entire server and can explain anything in simple words, or just do it for you.
          </p>
          <Link href="/ai">
            <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl text-sm font-bold shadow hover:opacity-90 transition-opacity">
              💗 Talk to WHIMSEY AI
            </button>
          </Link>
          <p className="text-[11px] text-gray-400 mt-2">Ask anything. There are no dumb questions here.</p>
        </div>

        {/* Quick questions */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Common questions</p>
          {[
            "What is a Discord bot and why do I need one?",
            "What's the difference between a role and a channel?",
            "What does 'permission' mean in Discord?",
            "What should I do today?",
            "Am I doing this right?",
            "How long will all of this take?",
          ].map(q => (
            <Link key={q} href={`/ai?q=${encodeURIComponent(q)}`}>
              <button className="w-full text-left text-xs bg-white border border-pink-100 hover:border-pink-300 hover:bg-pink-50 rounded-xl px-4 py-3 text-gray-700 transition-colors shadow-sm">
                {q}
              </button>
            </Link>
          ))}
        </div>

        {/* Full guide link */}
        <div className="text-center pb-8">
          <button
            onClick={() => setShowGuide(true)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            View the full technical guide →
          </button>
          <p className="text-[10px] text-gray-300 mt-1">Only if you want to go deep. Not required.</p>
        </div>

      </main>

      {/* Full guide modal/overlay */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <p className="text-2xl mb-2">📖</p>
              <h2 className="text-base font-bold text-gray-900">The Full Technical Guide</h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                This is the 4,000+ line reference document. It's detailed and complete — but it's a lot. Only open it if you need to look something specific up.
              </p>
            </div>
            <div className="space-y-2">
              <Link href="/guide">
                <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl text-sm font-bold shadow">
                  Open the full guide →
                </button>
              </Link>
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
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
