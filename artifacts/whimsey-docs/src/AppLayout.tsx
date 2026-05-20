import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useContent } from "./DynamicBlocks";

const NAV_ITEMS = [
  { href: "/",            label: "Home",        emoji: "🏠" },
  { href: "/discord",     label: "Live Server", emoji: "🌌" },
  { href: "/simulator",   label: "Drills",      emoji: "🧪" },
  { href: "/permissions", label: "Permissions", emoji: "🔒" },
  { href: "/tickets",     label: "Tickets",     emoji: "🎫" },
  { href: "/style",       label: "Style",       emoji: "✍️" },
  { href: "/updates",     label: "Updates",     emoji: "📡", live: true },
  { href: "/guide",       label: "Guide",       emoji: "📖" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const content = useContent();
  const navLabels = content?.navLabels ?? {};

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F4F2FC" }}>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-[220px] shrink-0 flex flex-col h-full
          transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ background: "linear-gradient(180deg, #0C0818 0%, #1A0F2E 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF66B2 0%, #7C3AED 100%)" }}
          >
            <span className="text-white text-sm font-black">W</span>
          </div>
          <div>
            <p className="text-white text-sm font-bold tracking-tight leading-none">WHIMSEY</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(167,139,250,0.5)" }}>$CNDY · Lyra Nova</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-1 pb-2 text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(167,139,250,0.35)" }}>
            Navigation
          </p>
          {NAV_ITEMS.map(item => {
            const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
            const label = navLabels[item.href] ?? item.label;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group"
                  style={{
                    background: isActive ? "rgba(255,102,178,0.12)" : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(167,139,250,0.6)",
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: "linear-gradient(180deg, #FF66B2, #7C3AED)" }}
                    />
                  )}
                  <span className="text-base leading-none" style={{ opacity: isActive ? 1 : 0.7 }}>
                    {item.emoji}
                  </span>
                  <span className="flex-1 text-left">{label}</span>
                  {item.live && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Ask AI CTA + Footer */}
        <div className="px-3 pb-5 shrink-0 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
          <a href="/whimsey-ai/">
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-pink-500/25 hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg, #FF66B2 0%, #7C3AED 100%)" }}
            >
              💗 Ask WHIMSEY AI
            </button>
          </a>
          <p className="text-center text-[10px]" style={{ color: "rgba(167,139,250,0.25)" }}>
            Your personal Discord expert
          </p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <div className="lg:hidden shrink-0" style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
          {/* Logo row */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #FF66B2, #7C3AED)" }}
            >
              <span className="text-white text-xs font-black">W</span>
            </div>
            <span className="text-sm font-bold flex-1" style={{ color: "#1A0F2E" }}>WHIMSEY</span>
            <a
              href="/whimsey-ai/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm"
              style={{ background: "linear-gradient(135deg, #FF66B2, #7C3AED)" }}
            >
              💗 Ask AI
            </a>
          </div>
          {/* Scrollable nav strip */}
          <div className="flex gap-1 overflow-x-auto px-3 pb-2.5 scrollbar-hide">
            {NAV_ITEMS.map(item => {
              const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                    style={{
                      background: isActive ? "rgba(255,102,178,0.12)" : "rgba(244,242,252,0.8)",
                      color: isActive ? "#E91E8C" : "#6E6183",
                      border: isActive ? "1px solid rgba(233,30,140,0.2)" : "1px solid transparent",
                    }}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                    {item.live && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
