import { Link } from "wouter";
import DynamicBlocks, { useContent } from "./DynamicBlocks";

interface ActionItem {
  text: string;
  public?: boolean;
}

interface Entity {
  name: string;
  icon: string;
  color: string;
  badgeColor: string;
  dotColor: string;
  autonomous: ActionItem[];
  needsOk: ActionItem[];
}

const ENTITIES: Entity[] = [
  {
    name: "WHIMSEY AI",
    icon: "💗",
    color: "pink",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-100",
    dotColor: "bg-pink-400",
    autonomous: [
      { text: "Read messages in any channel — public or private" },
      { text: "Monitor conversations, tone, spam, momentum, and FUD" },
      { text: "Post updates, alerts, and summaries to #staff-chat" },
      { text: "Post to any private or internal channel" },
      { text: "Kick a member — acts immediately, reports to #staff-chat after" },
      { text: "Ban a member — acts immediately, reports to #staff-chat after" },
      { text: "Timeout a member — acts immediately, reports to #staff-chat after" },
      { text: "Unban a member — acts immediately, reports to #staff-chat after" },
      { text: "Delete or edit any bot message via API" },
      { text: "Pin a message in any channel" },
      { text: "Create, update, or delete channels" },
      { text: "Create, update, or delete roles" },
      { text: "Assign or remove roles from members" },
      { text: "Set channel permission overwrites for any role" },
      { text: "Set member nicknames" },
      { text: "Generate invite links" },
      { text: "Check the full ban list" },
      { text: "Update channel slowmode or topic" },
      { text: "Raise or lower server verification level" },
      { text: "Check live server status, member count, bot list" },
      { text: "Read audit log" },
      { text: "Diagnose bot issues (Vulcan, Auth, Carl-bot)" },
      { text: "Read support tickets and respond in them directly" },
      { text: "Trigger Carl-bot commands in #mod-commands" },
      { text: "Draft public post text (shows confirmation gate before sending)" },
    ],
    needsOk: [
      { text: "Post to #📣 announcements", public: true },
      { text: "Post to #💬 general-chat", public: true },
      { text: "Post to #🌌 holders-only", public: true },
      { text: "Post to #🎉 giveaways", public: true },
      { text: "Post to any channel the community can see — this is the only gate, ever", public: true },
    ],
  },
  {
    name: "Carl-bot",
    icon: "🤖",
    color: "violet",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-100",
    dotColor: "bg-violet-400",
    autonomous: [
      { text: "Delete spam, scam links, and banned words instantly" },
      { text: "Timeout members who break AutoMod rules" },
      { text: "Log all server events to audit channels" },
      { text: "Post hourly heartbeat to #audit-mod-actions" },
      { text: "Post daily, weekly, and monthly momentum reports" },
      { text: "Post daily safety tips to #general-chat", public: true },
      { text: "Post daily nudges to #whimsey-of-the-day", public: true },
      { text: "Auto-respond to common questions in chat", public: true },
      { text: "Send welcome message when a member joins", public: true },
      { text: "Show reaction roles panel in #roles", public: true },
      { text: "Raise server verification level during raids" },
      { text: "Alert @Admin in #staff-chat for whale activity, raids, anomalies" },
      { text: "Run and announce giveaway results", public: true },
      { text: "Assign and track member strikes" },
      { text: "Flag accounts under 24h old in audit channels" },
    ],
    needsOk: [
      { text: "Initial dashboard configuration (one-time, done during setup)" },
      { text: "Changing AutoMod rules or scheduled message content" },
      { text: "Starting a new giveaway (you tell WHIMSEY AI → it runs the command)" },
      { text: "Any manual override of Carl-bot's automated behaviour" },
    ],
  },
  {
    name: "Auth",
    icon: "🔐",
    color: "sky",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-100",
    dotColor: "bg-sky-400",
    autonomous: [
      { text: "Show captcha verification prompt in #verify", public: true },
      { text: "Assign Verified 🩵 role after successful captcha" },
      { text: "Kick members who fail verification 3 times" },
      { text: "Block accounts under 24 hours old" },
      { text: "Re-verify members who rejoin the server" },
      { text: "Send welcome DM after verification", public: true },
      { text: "Log all verification events to #audit-mod-actions" },
    ],
    needsOk: [
      { text: "Initial dashboard configuration at auth.gg (one-time)" },
      { text: "Changing verification method or difficulty" },
      { text: "Changing the welcome DM message" },
    ],
  },
  {
    name: "Vulcan",
    icon: "🌌",
    color: "indigo",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
    dotColor: "bg-indigo-400",
    autonomous: [
      { text: "Show wallet verification button in #holder-verify", public: true },
      { text: "Check wallet for $CNDY NFT ownership" },
      { text: "Assign Holder 🌌 role when verified" },
      { text: "Re-verify all holders every 4 hours automatically" },
      { text: "Remove Holder 🌌 role if NFT is transferred or sold" },
      { text: "Log wallet events to #audit-wallet-verifications" },
      { text: "Log role grants/removals to #audit-holder-changes" },
    ],
    needsOk: [
      { text: "Initial dashboard configuration at vulcan.xyz (one-time)" },
      { text: "Updating the $CNDY contract address after deployment" },
      { text: "Changing the re-verify interval or minimum NFT count" },
    ],
  },
  {
    name: "Ticket Tool",
    icon: "🎫",
    color: "amber",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    dotColor: "bg-amber-400",
    autonomous: [
      { text: "Show support panel in #open-tickets", public: true },
      { text: "Create a private support channel when someone clicks a button" },
      { text: "Send the greeting message inside each new ticket" },
      { text: "Ping @Admin and @Moderator when a ticket opens" },
      { text: "Auto-close tickets after 48 hours of inactivity" },
      { text: "Save closed ticket transcripts to #ticket-logs" },
      { text: "Post ticket summaries to #audit-tickets" },
    ],
    needsOk: [
      { text: "Responding to the member inside the ticket (you or your mods)" },
      { text: "Manually closing a ticket after the issue is resolved" },
      { text: "Initial dashboard configuration at tickettool.io (one-time)" },
      { text: "Changing panel buttons, greeting, or support roles" },
    ],
  },
];

function PublicBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5 ml-1.5 shrink-0">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      PUBLIC
    </span>
  );
}

function EntityCard({ entity }: { entity: Entity }) {
  const hasGates = entity.needsOk.length > 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <span className="text-xl">{entity.icon}</span>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{entity.name}</h2>
        </div>
        {!hasGates && (
          <span className="ml-2 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border bg-pink-50 text-pink-600 border-pink-100">
            Full autonomy
          </span>
        )}
        <span className={`ml-auto text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${entity.badgeColor}`}>
          Bot
        </span>
      </div>

      <div className={`grid ${hasGates ? "sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" : ""} divide-gray-100`}>
        {/* Autonomous column */}
        <div className="p-4">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
            Does on its own
          </p>
          <ul className="space-y-2">
            {entity.autonomous.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <span className="flex items-center flex-wrap gap-x-1">
                  {item.text}
                  {item.public && <PublicBadge />}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Needs permission column — only if there are gates */}
        {hasGates && (
          <div className="p-4 bg-amber-50/40">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-amber-600 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Needs your OK
            </p>
            <ul className="space-y-2">
              {entity.needsOk.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                  <span className="w-1 h-1 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                  <span className="flex items-center flex-wrap gap-x-1">
                    {item.text}
                    {item.public && <PublicBadge />}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  const content = useContent(); void content;
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
          <Link href="/">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Home
            </button>
          </Link>
          <Link href="/simulator">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Drills
            </button>
          </Link>
          <Link href="/tickets">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Tickets
            </button>
          </Link>
          <Link href="/ai">
            <button className="px-3 py-1.5 text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors shadow-sm">
              💗 Ask AI
            </button>
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8 space-y-6">

        {/* ── Hero ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">WHIMSEY AI</span>
            <span className="text-gray-200">·</span>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">Permissions & Visibility</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Who does what — and who sees it.</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
            Every action taken by WHIMSEY AI and the bots is listed here — what runs automatically, what needs your confirmation, and what the community can actually see.
          </p>
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-3 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            Runs automatically — no action needed from you
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Needs your approval or configuration
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              PUBLIC
            </span>
            Community members can see this
          </div>
        </div>

        {/* ── Entity cards ── */}
        {ENTITIES.map(entity => (
          <EntityCard key={entity.name} entity={entity} />
        ))}

        {/* ── No human mods callout ── */}
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <p className="text-sm font-bold text-gray-800">You don't need human moderators — ever.</p>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            This entire system is designed to run indefinitely with just you and the bots. Carl-bot handles automated enforcement 24/7. WHIMSEY AI handles intelligent oversight and escalation. You handle strategy and final calls. The Moderator ☁️ role exists in the Discord hierarchy for technical reasons only — it is never assigned to any person. Nothing breaks, nothing degrades, and nothing requires a human mod to keep working.
          </p>
        </div>

        {/* ── Summary callout ── */}
        <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-100 p-5 space-y-3">
          <p className="text-sm font-bold text-gray-800">The one-line summary per bot</p>
          <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <p>
              <span className="font-semibold text-gray-800">WHIMSEY AI</span> — one gate only: posting to public channels. Everything else it does freely and silently. It is your full-time eyes on the server.
            </p>
            <p>
              <span className="font-semibold text-gray-800">Carl-bot</span> — runs your entire server on autopilot once configured. You set it up once, it works forever.
            </p>
            <p>
              <span className="font-semibold text-gray-800">Auth</span> — fully autonomous. Every person who joins gets verified without you touching anything.
            </p>
            <p>
              <span className="font-semibold text-gray-800">Vulcan</span> — fully autonomous. Holder roles assign and revoke automatically as NFTs move between wallets.
            </p>
            <p>
              <span className="font-semibold text-gray-800">Ticket Tool</span> — fully autonomous for creating and managing tickets. You only need to show up inside the ticket to actually help.
            </p>
          </div>
        </div>

        <DynamicBlocks page="permissions" className="mt-4" />
      </main>
    </div>
  );
}
