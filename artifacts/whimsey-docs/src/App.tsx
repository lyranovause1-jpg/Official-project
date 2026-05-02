import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import docRaw from "@docs/WHIMSEY_DISCORD_SETUP.md?raw";

type Heading = { id: string; text: string; level: number };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split("\n");
  const headings: Heading[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, "").trim();
      headings.push({ id: slugify(text), text, level });
    }
  }
  return headings;
}

export default function App() {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const headings = extractHeadings(docRaw);
  const filtered = search
    ? headings.filter((h) =>
        h.text.toLowerCase().includes(search.toLowerCase())
      )
    : headings;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );

    const headingEls = contentRef.current?.querySelectorAll(
      "h1, h2, h3"
    );
    headingEls?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setSidebarOpen(false);
  }

  const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
    h1: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h1 id={id} className="text-2xl font-bold mt-10 mb-3 text-foreground border-b border-border pb-2 scroll-mt-20">
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h2 id={id} className="text-xl font-semibold mt-8 mb-2 text-foreground scroll-mt-20">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h3 id={id} className="text-base font-semibold mt-6 mb-1.5 text-foreground scroll-mt-20">
          {children}
        </h3>
      );
    },
    p: ({ children }) => (
      <p className="text-sm leading-relaxed text-foreground/90 mb-3">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-sm text-foreground/90">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-sm text-foreground/90">{children}</ol>
    ),
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
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">
          {children}
        </code>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground text-sm my-3">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse border border-border rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="bg-muted px-3 py-2 text-left font-semibold text-foreground border border-border text-xs">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 border border-border text-foreground/90 text-xs">
        {children}
      </td>
    ),
    hr: () => <hr className="border-border my-6" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    a: ({ children, href }) => (
      <a href={href} className="text-primary underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle contents"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            💗 WHIMSEY Discord Setup Guide
          </span>
        </div>
        <input
          type="search"
          placeholder="Search sections…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSidebarOpen(true); }}
          className="hidden sm:block w-48 text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
        />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
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
          <nav className="flex-1 overflow-y-auto p-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-2">
              {search ? `${filtered.length} results` : "Contents"}
            </p>
            {filtered.map((h, i) => (
              <button
                key={i}
                onClick={() => scrollTo(h.id)}
                className={`
                  w-full text-left px-2 py-1 rounded-lg text-xs transition-colors block
                  ${h.level === 1 ? "font-semibold pl-2" : h.level === 2 ? "pl-4 text-foreground/80" : "pl-6 text-muted-foreground"}
                  ${activeId === h.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}
                `}
              >
                {h.text}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
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
