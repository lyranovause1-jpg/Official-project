import DynamicBlocks, { useContent } from "./DynamicBlocks";

interface Scenario {
  id: string;
  type: "emergency" | "positive";
  title: string;
  trigger: string;
  drillPrompt: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "E-1",
    type: "emergency",
    title: "Server Raid",
    trigger: "10+ bot accounts join in under 60 seconds",
    drillPrompt:
      "Run a live drill for Scenario E-1: SERVER RAID. Act as if it's happening right now — 12 new accounts with no avatars just joined in the last 45 seconds. Walk through it step by step: first tell me what the bots just did automatically, then tell me what you as WHIMSEY AI are doing right now, then ask me what my one action should be. Wait for my response before continuing to the next step.",
  },
  {
    id: "E-2",
    type: "emergency",
    title: "Scam Link in Chat",
    trigger: "Fake mint link posted in #general-chat",
    drillPrompt:
      "Run a live drill for Scenario E-2: SCAM LINK IN GENERAL CHAT. Act as if it's happening right now — someone just posted 'Exclusive WHIMSEY mint: whimsey-official-drop.xyz — limited time!' in #general-chat. Walk through it step by step: what did the bots just do, what are you doing right now as WHIMSEY AI, and what do I need to do? Ask me to respond before moving to the next step.",
  },
  {
    id: "E-3",
    type: "emergency",
    title: "Phishing DMs",
    trigger: "Member reports fake 'WHIMSEY support' DM",
    drillPrompt:
      "Run a live drill for Scenario E-3: PHISHING DMs. Act as if it's happening right now — a member just posted in #support: 'Someone DMed me saying they are WHIMSEY support and my wallet needs reverification, they sent a link.' Walk me through step by step: what can bots do here, what are you doing as WHIMSEY AI, what do I need to do? Ask me to respond at each decision point.",
  },
  {
    id: "E-4",
    type: "emergency",
    title: "Carl-bot Offline",
    trigger: "Heartbeat missing for 90+ minutes",
    drillPrompt:
      "Run a live drill for Scenario E-4: CARL-BOT OFFLINE. Act as if it's happening right now — it's been 2 hours since Carl-bot's last heartbeat in #audit-mod-actions. Walk me through what this means, what you as WHIMSEY AI just noticed and are doing, what is now unprotected, and exactly what I need to do. Ask me to respond at each step.",
  },
  {
    id: "E-5",
    type: "emergency",
    title: "Holder Roles Broken",
    trigger: "Vulcan stops assigning Holder 🌌 after mint",
    drillPrompt:
      "Run a live drill for Scenario E-5: HOLDER ROLES NOT ASSIGNING. Act as if it's happening right now — during mint, three people opened tickets saying they minted 20 minutes ago but have no Holder 🌌 role. Walk me through: what you as WHIMSEY AI are checking right now, what it means, and what I need to do. Ask me to respond at each step.",
  },
  {
    id: "E-6",
    type: "emergency",
    title: "Mint Site Down",
    trigger: "Minting website goes offline during active mint",
    drillPrompt:
      "Run a live drill for Scenario E-6: MINT SITE DOWN. Act as if it's happening right now — the mint just opened 10 minutes ago and #support is flooding with 'the site won't load'. Walk me through: what this is and isn't, what you as WHIMSEY AI can and cannot do, what the community is seeing, and exactly what I need to do right now. Ask me to respond at each decision point.",
  },
  {
    id: "E-7",
    type: "emergency",
    title: "Floor Crash / Whale Dump",
    trigger: "Large holder dumps, floor price drops sharply",
    drillPrompt:
      "Run a live drill for Scenario E-7: WHALE DUMP AND FLOOR CRASH. Act as if it's happening now — 48 hours after sold out, NFT Tracker just posted 18 WHIMSEY sales from the same wallet in the last 20 minutes. Floor is dropping. #general-chat has people saying 'rug? sell?' Walk me through: what Carl-bot just did, what you as WHIMSEY AI are observing, and what I should and should not do publicly. Ask me to respond at each step.",
  },
  {
    id: "E-8",
    type: "emergency",
    title: "Doxx Attempt",
    trigger: "Personal information posted in a public channel",
    drillPrompt:
      "Run a live drill for Scenario E-8: DOXX ATTEMPT. Act as if it's happening right now — while reading #general-chat you spotted a message containing what appears to be a real person's full name and phone number. Walk me through: what you as WHIMSEY AI are doing immediately, what I need to do, and how to handle the person who was doxxed. Ask me to respond at each step.",
  },
  {
    id: "P-1",
    type: "positive",
    title: "Milestone Hit",
    trigger: "Mint counter hits 5k, 10k, 15k, 20k, 25k, or 30k",
    drillPrompt:
      "Run a live drill for Scenario P-1: MILESTONE HIT. We just hit 10,000 mints. My team has the copy ready. Walk me through exactly what happens next — what you as WHIMSEY AI are ready to do, what I need to give you, what the confirmation looks like, and how fast it goes out. Make it feel like we're in the moment.",
  },
  {
    id: "P-2",
    type: "positive",
    title: "Whale Buys In",
    trigger: "One wallet buys 5+ NFTs in under 60 minutes",
    drillPrompt:
      "Run a live drill for Scenario P-2: WHALE BUYS IN. Act as if it's happening right now — NFT Tracker just posted 7 WHIMSEY purchases from the same wallet in the last 40 minutes. Carl-bot pinged #staff-chat. Walk me through what you as WHIMSEY AI are observing, what the right public response looks like, and what I should and shouldn't say or do.",
  },
  {
    id: "P-3",
    type: "positive",
    title: "Sold Out",
    trigger: "The 30,000th WHIMSEY NFT is minted",
    drillPrompt:
      "Run a live drill for Scenario P-3: SOLD OUT. Act as if it just happened — NFT Tracker posted the final mint. The server is erupting. Walk me through the exact sequence: what you're doing right now, what I post and when, what I do in the 2 hours after, and what I absolutely should NOT do in the next 20 minutes. Make it feel real.",
  },
  {
    id: "P-4",
    type: "positive",
    title: "Notable Person Joins",
    trigger: "A recognizable NFT or crypto figure enters the server",
    drillPrompt:
      "Run a live drill for Scenario P-4: NOTABLE PERSON JOINS. A well-known NFT collector just joined the WHIMSEY server. Carl-bot logged it in #audit-joins-leaves. Walk me through what you as WHIMSEY AI noticed, what my options are, what you'd recommend, and what I should NOT do. Ask me what I want to do before acting.",
  },
  {
    id: "P-5",
    type: "positive",
    title: "Something Goes Viral",
    trigger: "Fan art or a community post starts trending on X/Twitter",
    drillPrompt:
      "Run a live drill for Scenario P-5: VIRAL MOMENT. A community member just posted fan art of their WHIMSEY character on X/Twitter and it's getting hundreds of retweets. They also posted it in #fan-art. Walk me through what you as WHIMSEY AI are doing, what the right in-server response looks like, what I should do on X myself, and what makes this moment land versus fall flat.",
  },
  {
    id: "P-6",
    type: "positive",
    title: "High Energy Day",
    trigger: "Organic activity spike — server is buzzing with good energy",
    drillPrompt:
      "Run a live drill for Scenario P-6: HIGH ENERGY DAY. It's a random Tuesday, three weeks after mint. #general-chat has been very active all day — good conversations, people sharing their WHIMSEY characters, positive energy, no issues. Walk me through what you as WHIMSEY AI are observing, whether I need to do anything, and if so, exactly what the right move is.",
  },
  {
    id: "P-7",
    type: "positive",
    title: "First Holder-Only Message",
    trigger: "T+2 hours after sold out — the exclusive founding moment",
    drillPrompt:
      "Run a live drill for Scenario P-7: FIRST HOLDER-ONLY MESSAGE. It's been 2 hours since we sold out. My team has written a short message for the holders-only channel. Walk me through the exact process — what the confirmation looks like, what channel it goes to, why this moment matters, and what tone it should have. Make it feel like we're in the room together.",
  },
  {
    id: "P-8",
    type: "positive",
    title: "First Community Giveaway",
    trigger: "T+24 hours post-mint — Carl-bot runs the first giveaway",
    drillPrompt:
      "Run a live drill for Scenario P-8: FIRST COMMUNITY GIVEAWAY. It's 24 hours after sold out. Time to start the first giveaway. Walk me through: what I need to tell you, how Carl-bot runs it, what goes in #giveaways publicly (and what the confirmation gate looks like), and what makes this giveaway land well with the community versus feeling generic.",
  },
];

export default function ScenarioSimulator() {
  const content = useContent(); void content;

  function runDrill(scenario: Scenario) {
    const encoded = encodeURIComponent(scenario.drillPrompt);
    window.location.href = `/whimsey-ai/?q=${encoded}`;
  }

  const emergency = SCENARIOS.filter(s => s.type === "emergency");
  const positive  = SCENARIOS.filter(s => s.type === "positive");

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>

      {/* ── Page header ── */}
      <header
        className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.55)" }}
        style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
      >
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-0.5" style={{ color: "#E91E8C" }}>
            WHIMSEY AI
          </p>
          <h1 className="text-base font-bold" style={{ color: "#1A0F2E" }}>Scenario Drills</h1>
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

      <main className="max-w-4xl mx-auto px-5 py-8">

        {/* ── Hero ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">WHIMSEY AI</span>
            <span className="text-gray-200">·</span>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">Scenario Simulator</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Run a drill.</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
            Pick any scenario and WHIMSEY AI walks you through it as if it's happening right now — step by step, in real time. Know exactly what to do before the day comes.
          </p>
        </div>

        {/* ── Emergency Scenarios ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-rose-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
              Emergency Scenarios
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergency.map(s => (
              <ScenarioCard key={s.id} scenario={s} onDrill={runDrill} />
            ))}
          </div>
        </section>

        {/* ── Positive Scenarios ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Positive Scenarios
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {positive.map(s => (
              <ScenarioCard key={s.id} scenario={s} onDrill={runDrill} />
            ))}
          </div>
        </section>

        {/* ── Footer tip ── */}
        <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-100 p-5">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">How drills work</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Each drill drops you into a live conversation with WHIMSEY AI. It simulates the scenario in real time — telling you what the bots are handling, what it's doing autonomously, and asking you to make the decisions you'd actually need to make. You respond just like you would on the day.
            </p>
          </div>
        </div>

        <DynamicBlocks page="simulator" className="mt-4" />
      </main>
    </div>
  );
}

function ScenarioCard({
  scenario,
  onDrill,
}: {
  scenario: Scenario;
  onDrill: (s: Scenario) => void;
}) {
  const isEmergency = scenario.type === "emergency";

  return (
    <div
      className={`
        bg-white rounded-2xl border p-4 flex flex-col gap-3 group
        transition-shadow hover:shadow-md
        ${isEmergency ? "border-rose-100" : "border-emerald-100"}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`
              text-[10px] font-bold tracking-[0.1em] px-2 py-0.5 rounded-full
              ${isEmergency
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"}
            `}
          >
            {scenario.id}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${isEmergency ? "text-rose-400" : "text-emerald-500"}`}>
            {isEmergency ? "Emergency" : "Positive"}
          </span>
        </div>
      </div>

      {/* Title + trigger */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-0.5">{scenario.title}</p>
        <p className="text-xs text-gray-400 leading-snug">{scenario.trigger}</p>
      </div>

      {/* CTA */}
      <button
        onClick={() => onDrill(scenario)}
        className={`
          mt-auto w-full rounded-xl py-2 text-xs font-semibold transition-all
          flex items-center justify-center gap-1.5
          ${isEmergency
            ? "bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 hover:border-rose-500"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-100 hover:border-emerald-500"}
        `}
      >
        Run drill
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
