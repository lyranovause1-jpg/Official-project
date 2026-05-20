import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Switch, Route, Link } from "wouter";
import docRaw from "@docs/WHIMSEY_DISCORD_SETUP.md?raw";
import DiscordDashboard from "./DiscordDashboard";
import HomeJourney from "./HomeJourney";
import ScenarioSimulator from "./ScenarioSimulator";
import PermissionsPage from "./PermissionsPage";
import TicketAssistant from "./TicketAssistant";
import AutopilotBanner from "./AutopilotBanner";
import PrivateFeed from "./PrivateFeed";
import StyleSettings from "./StyleSettings";
import AppLayout from "./AppLayout";

type Mode = "read" | "do" | "reference" | "mixed" | null;
type Heading = { id: string; text: string; clean: string; level: number; mode: Mode };

function detectMode(raw: string): Mode {
  const t = raw.toLowerCase();
  const hasRead = t.includes("📖") || t.startsWith("read —") || t.includes(" read —");
  const hasDo   = t.includes("✅") || t.startsWith("do —")   || t.includes(" do —") || t.includes("do (");
  const hasRef  = t.includes("📚") || t.startsWith("reference") || t.includes(" reference");
  if (hasDo && hasRef) return "mixed";
  if (hasRead) return "read";
  if (hasDo)   return "do";
  if (hasRef)  return "reference";
  return null;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^(📖\s*READ|✅\s*DO[^—–]*|📚\s*REFERENCE)\s*[—–]\s*/i, "")
    .replace(/^(✅\s*DO[^/]*\/\s*📚\s*REFERENCE[^—–]*)\s*[—–]\s*/i, "")
    .trim();
}

const BADGE: Record<
  NonNullable<Mode>,
  { label: string; badge: string; border: string; sidebar: string; dot: string }
> = {
  read:      { label: "📖 READ",      badge: "bg-sky-100 text-sky-700 border border-sky-200",       border: "border-l-4 border-sky-300",    sidebar: "text-sky-700",    dot: "bg-sky-400" },
  do:        { label: "✅ DO",         badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", border: "border-l-4 border-emerald-400", sidebar: "text-emerald-700", dot: "bg-emerald-500" },
  reference: { label: "📚 REFERENCE", badge: "bg-purple-100 text-purple-700 border border-purple-200", border: "border-l-4 border-purple-300",  sidebar: "text-purple-700", dot: "bg-purple-400" },
  mixed:     { label: "✅ DO / 📚 REF", badge: "bg-amber-100 text-amber-700 border border-amber-200",  border: "border-l-4 border-amber-300",   sidebar: "text-amber-700",  dot: "bg-amber-400" },
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  for (const line of markdown.split("\n")) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const raw   = match[2].replace(/[*_`]/g, "").trim();
      const mode  = detectMode(raw);
      const clean = mode ? cleanTitle(raw) : raw;
      headings.push({ id: slugify(raw), text: raw, clean, level, mode });
    }
  }
  return headings;
}

function ModeBadge({ mode }: { mode: NonNullable<Mode> }) {
  const cfg = BADGE[mode];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide mr-2 shrink-0 ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
}

function H2({ raw, children }: { raw: string; children: React.ReactNode }) {
  const mode  = detectMode(raw);
  const clean = mode ? cleanTitle(raw) : raw;
  const id    = slugify(raw);
  const cfg   = mode ? BADGE[mode] : null;
  return (
    <div className={`mt-10 mb-1 rounded-r-xl ${cfg ? cfg.border + " pl-4 pr-3 py-3 bg-white" : ""}`}>
      <h2 id={id} className="text-xl font-bold text-foreground scroll-mt-20 flex flex-wrap items-center gap-1">
        {mode && <ModeBadge mode={mode} />}
        <span>{clean || children}</span>
      </h2>
    </div>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  const raw = String(children);
  const id  = slugify(raw);
  return (
    <h3 id={id} className="text-base font-semibold mt-6 mb-1.5 text-foreground scroll-mt-20">
      {children}
    </h3>
  );
}

function DocsPage() {
  const [search, setSearch]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId]       = useState("");
  const contentRef                    = useRef<HTMLDivElement>(null);

  const headings = extractHeadings(docRaw);
  const filtered = search
    ? headings.filter((h) => h.clean.toLowerCase().includes(search.toLowerCase()))
    : headings;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActiveId(entry.target.id); break; }
        }
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    contentRef.current?.querySelectorAll("h1, h2, h3").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  }

  const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
    h1: ({ children }) => {
      const raw = String(children);
      const id  = slugify(raw);
      return (
        <h1 id={id} className="text-2xl font-bold mt-10 mb-3 text-foreground border-b border-border pb-2 scroll-mt-20">
          {children}
        </h1>
      );
    },
    h2: ({ children }) => <H2 raw={String(children)}>{children}</H2>,
    h3: ({ children }) => <H3>{children}</H3>,
    p:  ({ children }) => <p  className="text-sm leading-relaxed text-foreground/90 mb-3">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-sm text-foreground/90">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-sm text-foreground/90">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    code: ({ children, className }) => {
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return (
          <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs mb-4 border border-border">
            <code>{children}</code>
          </pre>
        );
      }
      return <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">{children}</code>;
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground text-sm my-3 bg-muted/40 py-2 pr-3 rounded-r-lg">
        {children}
      </blockquote>
    ),
    table:  ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse border border-border rounded-lg overflow-hidden">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="bg-muted px-3 py-2 text-left font-semibold text-foreground border border-border text-xs">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 border border-border text-foreground/90 text-xs">{children}</td>,
    hr:     () => <hr className="border-border my-6" />,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    a:      ({ children, href }) => (
      <a href={href} className="text-primary underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle contents"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
          💗 WHIMSEY Discord Setup Guide
        </span>
        <div className="hidden lg:flex items-center gap-1.5">
          {(["read", "do", "reference"] as const).map((m) => (
            <span key={m} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${BADGE[m].badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${BADGE[m].dot}`} />
              {BADGE[m].label}
            </span>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search sections…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSidebarOpen(true); }}
          className="hidden sm:block w-44 text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Link href="/discord">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0">
            <span>🌌</span>
            <span className="hidden sm:inline">Live Server</span>
          </button>
        </Link>
        <a href="/whimsey-ai/">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0">
            <span>💗</span>
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </a>
      </header>
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 sm:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside
          className={`
            fixed sm:sticky top-[53px] h-[calc(100vh-53px)] z-40
            w-64 bg-card border-r border-border flex flex-col
            transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
          `}
        >
          <div className="p-3 border-b border-border sm:hidden">
            <input
              type="search"
              placeholder="Search sections…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="mx-2 mt-2 mb-1 rounded-xl bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-100 p-3">
            <p className="text-[11px] font-semibold text-pink-700 mb-1">💗 WHIMSEY AI</p>
            <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">Stuck on a step? Ask your personal Discord setup expert.</p>
            <a href="/whimsey-ai/">
              <button className="w-full text-[11px] bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg py-1.5 font-semibold hover:opacity-90 transition-opacity">
                Open AI Chat →
              </button>
            </a>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-2">
              {search ? `${filtered.length} results` : "Contents"}
            </p>
            {filtered.map((h, i) => {
              const isActive = activeId === h.id;
              const modeCfg  = h.mode ? BADGE[h.mode] : null;
              return (
                <button
                  key={i}
                  onClick={() => scrollTo(h.id)}
                  className={`
                    w-full text-left px-2 py-1 rounded-lg text-xs transition-colors flex items-start gap-1.5
                    ${h.level === 1 ? "font-semibold" : h.level === 2 ? "pl-3" : "pl-5 opacity-80"}
                    ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground/80"}
                  `}
                >
                  {h.level === 2 && modeCfg && (
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${modeCfg.dot}`} />
                  )}
                  <span className="leading-snug">{h.clean}</span>
                </button>
              );
            })}
          </nav>
        </aside>
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12 max-w-4xl mx-auto w-full"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {docRaw}
          </ReactMarkdown>
        </main>
      </div>
    </div>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

export default function App() {
  return (
    <AppLayout>
      <AutopilotBanner />
      <Switch>
        <Route path="/ai">{() => { window.location.replace("/whimsey-ai/" + window.location.search); return <></>; }}</Route>
        <Route path="/discord">{() => <PageWrap><DiscordDashboard /></PageWrap>}</Route>
        <Route path="/guide">{() => <PageWrap><DocsPage /></PageWrap>}</Route>
        <Route path="/simulator">{() => <PageWrap><ScenarioSimulator /></PageWrap>}</Route>
        <Route path="/permissions">{() => <PageWrap><PermissionsPage /></PageWrap>}</Route>
        <Route path="/tickets">{() => <PageWrap><TicketAssistant /></PageWrap>}</Route>
        <Route path="/updates">{() => <PageWrap><PrivateFeed /></PageWrap>}</Route>
        <Route path="/style">{() => <PageWrap><StyleSettings /></PageWrap>}</Route>
        <Route>{() => <PageWrap><HomeJourney /></PageWrap>}</Route>
      </Switch>
    </AppLayout>
  );
}
