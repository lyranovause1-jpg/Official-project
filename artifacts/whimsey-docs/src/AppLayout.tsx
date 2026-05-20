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
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(124,58,237,0.1)" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "#F4F2FC" }}
          >
            <svg width="18" height="18" fill="none" stroke="#1A0F2E" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #FF66B2, #7C3AED)" }}
          >
            <span className="text-white text-xs font-black">W</span>
          </div>
          <span className="text-sm font-bold" style={{ color: "#1A0F2E" }}>WHIMSEY</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
