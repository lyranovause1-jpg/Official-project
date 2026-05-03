import { useState, useRef, useEffect } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Props {
  onUnlock: (role: string, name: string) => void;
}

export default function LockScreen({ onUnlock }: Props) {
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const r = await fetch(`${BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const d = await r.json();
      if (d.ok) {
        onUnlock(d.role, d.name);
      } else {
        setError("That code isn't right. Try again.");
        setShake(true);
        setCode("");
        setTimeout(() => setShake(false), 600);
        inputRef.current?.focus();
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-2xl font-black">W</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">WHIMSEY AI</h1>
          <p className="text-sm text-gray-400 mt-1">Enter your access code to continue</p>
        </div>

        {/* Card */}
        <div
          className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-7 transition-all ${shake ? "animate-shake" : ""}`}
          style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}
        >
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Access Code
              </label>
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
                placeholder="XXXX-XXXXXX"
                maxLength={12}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-widest text-center text-gray-900 bg-gray-50 outline-none transition-all
                  ${error
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  }`}
              />
              {error && (
                <p className="mt-2 text-[11px] text-red-500 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!code.trim() || loading}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl transition-all shadow-sm disabled:shadow-none"
            >
              {loading ? "Checking…" : "Unlock WHIMSEY AI →"}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-[11px] text-gray-300 mt-5 leading-relaxed">
          You were given a personal access code.<br />
          It doesn't expire and stays unlocked until you close the browser.
        </p>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
