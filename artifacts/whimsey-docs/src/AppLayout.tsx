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

  const AURORA = `
    radial-gradient(ellipse 75% 60% at 8% 8%,  rgba(255,182,200,0.88) 0%, transparent 55%),
    radial-gradient(ellipse 55% 42% at 90% 4%,  rgba(255,232,160,0.68) 0%, transparent 46%),
    radial-gradient(ellipse 88% 68% at 2% 54%,  rgba(68,202,255,0.76) 0%, transparent 56%),
    radial-gradient(ellipse 68% 58% at 56% 33%, rgba(118,138,255,0.84) 0%, transparent 56%),
    radial-gradient(ellipse 58% 46% at 88% 66%, rgba(255,128,218,0.68) 0%, transparent 48%),
    radial-gradient(ellipse 46% 38% at 22% 84%, rgba(178,108,255,0.58) 0%, transparent 46%),
    radial-gradient(ellipse 66% 46% at 50% 98%, rgba(152,98,255,0.54) 0%, transparent 52%),
    linear-gradient(158deg, #e2cafc 0%, #9ed8f8 22%, #b8d0ff 42%, #ddb8ff 62%, #f7badb 80%, #c8aafc 100%)
  `;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: AURORA, position: "relative" }}>

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
        style={{ background: "linear-gradient(180deg, #0C0818 0%, #1A0F2E 100%)", boxShadow: "4px 0 40px rgba(0,0,0,0.35)" }}
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
              Ask WHIMSEY AI
            </button>
          </a>
          <p className="text-center text-[10px]" style={{ color: "rgba(167,139,250,0.25)" }}>
            Your personal Discord expert
          </p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ position: "relative" }}>

        {/* CSS Planet — naturally part of the aurora */}
        <div style={{
          position: "absolute", right: "-6%", bottom: "-14%",
          width: "58%", maxWidth: "480px", aspectRatio: "1 / 1",
          borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          background: `
            radial-gradient(ellipse at 36% 30%, rgba(255,255,255,0.9) 0%, rgba(255,224,240,0.72) 18%, transparent 44%),
            radial-gradient(ellipse at 72% 22%, rgba(255,200,228,0.5) 0%, transparent 32%),
            radial-gradient(ellipse at 24% 72%, rgba(160,118,255,0.55) 0%, transparent 40%),
            radial-gradient(ellipse at 68% 74%, rgba(76,190,255,0.38) 0%, transparent 34%),
            radial-gradient(circle at 50% 50%, rgba(198,148,255,0.78) 0%, rgba(128,88,255,0.62) 32%, rgba(78,48,200,0.34) 58%, rgba(28,8,100,0.08) 80%, transparent 100%)
          `,
          boxShadow: "0 0 80px rgba(168,85,247,0.22), 0 0 160px rgba(139,92,246,0.10)",
          filter: "blur(0.5px)",
        }}>
          <div style={{
            position: "absolute", top: "8%", left: "11%",
            width: "42%", height: "28%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.68) 0%, transparent 75%)",
            filter: "blur(6px)", transform: "rotate(-22deg)",
          }} />
          <div style={{
            position: "absolute", top: "46%", left: "28%",
            width: "58%", height: "30%", borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,158,80,0.32) 0%, rgba(255,78,160,0.28) 35%, rgba(98,78,255,0.22) 70%, rgba(78,200,255,0.18) 100%)",
            filter: "blur(14px)", transform: "rotate(-8deg)",
          }} />
        </div>

        {/* Mobile topbar */}
        <div className="lg:hidden shrink-0" style={{
          position: "relative", zIndex: 10,
          background: "rgba(255,255,255,0.28)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        }}>
          {/* Logo row */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #FF66B2, #7C3AED)" }}
            >
              <span className="text-white text-xs font-black">W</span>
            </div>
            <span className="text-sm font-bold flex-1" style={{ color: "#2d1b6b" }}>WHIMSEY</span>
            <a
              href="/whimsey-ai/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm"
              style={{ background: "linear-gradient(135deg, #FF66B2, #7C3AED)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
            >
              Ask AI
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
                      background: isActive ? "rgba(255,102,178,0.18)" : "rgba(255,255,255,0.35)",
                      color: isActive ? "#be185d" : "#4c1d95",
                      border: isActive ? "1px solid rgba(233,30,140,0.3)" : "1px solid rgba(255,255,255,0.5)",
                      backdropFilter: "blur(8px)",
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
        <main className="flex-1 overflow-y-auto scroll-smooth" style={{ position: "relative", zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
