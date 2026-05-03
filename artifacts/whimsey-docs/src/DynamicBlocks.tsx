import { useEffect, useState, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ContentBlock {
  id: string;
  icon: string;
  title: string;
  body: string;
  type: "info" | "warning" | "tip" | "action" | "highlight";
  actionLabel?: string;
  actionPath?: string;
  createdAt: string;
}

interface ContentState {
  pageHeaders: Record<string, Record<string, string>>;
  pageBlocks: Record<string, ContentBlock[]>;
  navLabels: Record<string, string>;
  quickQuestions: string[];
}

const TYPE_STYLES: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  info:      { border: "border-violet-100", bg: "bg-white",         badge: "bg-violet-50 text-violet-600 border-violet-100",   badgeText: "Info" },
  warning:   { border: "border-amber-200",  bg: "bg-amber-50",      badge: "bg-amber-100 text-amber-700 border-amber-200",     badgeText: "⚠️ Heads up" },
  tip:       { border: "border-emerald-100",bg: "bg-emerald-50/40", badge: "bg-emerald-50 text-emerald-700 border-emerald-100",badgeText: "💡 Tip" },
  action:    { border: "border-pink-200",   bg: "bg-pink-50/40",    badge: "bg-pink-50 text-pink-600 border-pink-200",         badgeText: "✅ Action" },
  highlight: { border: "border-indigo-100", bg: "bg-indigo-50/40",  badge: "bg-indigo-50 text-indigo-700 border-indigo-100",   badgeText: "✨ Note" },
};

let cachedContent: ContentState | null = null;
const listeners: Set<() => void> = new Set();

async function fetchContent() {
  try {
    const r = await fetch(`${BASE}/api/content`, { cache: "no-store" });
    const d = await r.json();
    if (d.ok) {
      cachedContent = d.content;
      listeners.forEach(fn => fn());
    }
  } catch { /* silent */ }
}

fetchContent();
setInterval(fetchContent, 4000);

export function useContent(): ContentState | null {
  const [content, setContent] = useState<ContentState | null>(cachedContent);
  const refresh = useCallback(() => setContent(cachedContent ? { ...cachedContent } : null), []);

  useEffect(() => {
    listeners.add(refresh);
    refresh();
    return () => { listeners.delete(refresh); };
  }, [refresh]);

  return content;
}

interface DynamicBlocksProps {
  page: string;
  className?: string;
}

export default function DynamicBlocks({ page, className = "" }: DynamicBlocksProps) {
  const content = useContent();
  const blocks = content?.pageBlocks[page] ?? [];

  if (blocks.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map(block => {
        const s = TYPE_STYLES[block.type] ?? TYPE_STYLES.info;
        return (
          <div
            key={block.id}
            className={`rounded-2xl border ${s.border} ${s.bg} overflow-hidden`}
          >
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                {block.icon && (
                  <span className="text-xl shrink-0 mt-0.5">{block.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-bold text-gray-900">{block.title}</p>
                    <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${s.badge}`}>
                      {s.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{block.body}</p>
                  {block.actionLabel && block.actionPath && (
                    <a
                      href={block.actionPath}
                      className="inline-block mt-2.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      {block.actionLabel} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
