import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AutopilotState {
  enabled: boolean;
  until: string | null;
}

const PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "4 hours", minutes: 240 },
  { label: "Until midnight", minutes: -1 },
];

function minutesUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 60000);
}

function formatCountdown(until: string): string {
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return "expiring…";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTime(until: string): string {
  return new Date(until).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AutopilotBanner() {
  const [state, setState] = useState<AutopilotState>({ enabled: false, until: null });
  const [showModal, setShowModal] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/autopilot`);
      const data = await r.json();
      setState(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchState();
    const poll = setInterval(fetchState, 15000);
    return () => clearInterval(poll);
  }, [fetchState]);

  useEffect(() => {
    if (!state.enabled || !state.until) return;
    const tick = () => setCountdown(formatCountdown(state.until!));
    tick();
    const id = setInterval(() => {
      const ms = new Date(state.until!).getTime() - Date.now();
      if (ms <= 0) { fetchState(); clearInterval(id); return; }
      setCountdown(formatCountdown(state.until!));
    }, 1000);
    return () => clearInterval(id);
  }, [state.enabled, state.until, fetchState]);

  const enable = async (minutes: number) => {
    setLoading(true);
    const until = new Date(Date.now() + (minutes === -1 ? minutesUntilMidnight() : minutes) * 60000);
    try {
      const r = await fetch(`${BASE}/api/autopilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, until: until.toISOString() }),
      });
      const data = await r.json();
      if (data.ok) { setState({ enabled: true, until: data.until }); setShowModal(false); }
    } catch { /* silent */ }
    setLoading(false);
  };

  const enableCustom = async () => {
    if (!customTime) return;
    const [h, m] = customTime.split(":").map(Number);
    const until = new Date();
    until.setHours(h, m, 0, 0);
    if (until <= new Date()) until.setDate(until.getDate() + 1);
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/api/autopilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, until: until.toISOString() }),
      });
      const data = await r.json();
      if (data.ok) { setState({ enabled: true, until: data.until }); setShowModal(false); }
    } catch { /* silent */ }
    setLoading(false);
  };

  const disable = async () => {
    try {
      await fetch(`${BASE}/api/autopilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
      setState({ enabled: false, until: null });
    } catch { /* silent */ }
  };

  return (
    <>
      {/* ── Active banner ── */}
      {state.enabled && state.until && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-violet-600 to-pink-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-xs font-bold tracking-wide">AUTOPILOT ACTIVE</span>
              <span className="text-xs text-white/80 ml-2">WHIMSEY AI posts freely to all channels until {formatTime(state.until)}</span>
            </div>
            <span className="ml-2 text-xs font-mono bg-white/20 rounded-full px-2.5 py-0.5 tabular-nums">
              {countdown}
            </span>
          </div>
          <button
            onClick={disable}
            className="text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            End autopilot
          </button>
        </div>
      )}

      {/* ── Floating button when inactive ── */}
      {!state.enabled && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md text-gray-700 hover:text-violet-700 text-xs font-semibold rounded-full shadow-sm transition-all group"
        >
          <span className="text-sm group-hover:scale-110 transition-transform">⚡</span>
          Autopilot
        </button>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⚡</span>
                <p className="text-sm font-bold">Enable Autopilot Mode</p>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                WHIMSEY AI will post to public channels freely — no confirmation gate — until the time you set.
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Presets */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">Quick set</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => enable(p.minutes)}
                      disabled={loading}
                      className="py-2 text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 font-medium">or set exact end time</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Custom time */}
              <div className="flex gap-2">
                <input
                  type="time"
                  value={customTime}
                  onChange={e => setCustomTime(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent bg-white"
                />
                <button
                  onClick={enableCustom}
                  disabled={!customTime || loading}
                  className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-200 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Set
                </button>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                After the window closes, the confirmation gate automatically comes back. You can end autopilot early at any time.
              </p>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
