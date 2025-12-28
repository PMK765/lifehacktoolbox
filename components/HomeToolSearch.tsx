"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { HOME_TOOL_INDEX } from "@/lib/homeToolIndex";

const normalize = (value: string): string =>
  value.trim().toLowerCase();

const scoreMatch = (
  query: string,
  title: string,
  description: string,
  category: string
): number => {
  const q = normalize(query);
  const t = normalize(title);
  const d = normalize(description);
  const c = normalize(category);
  if (!q) {
    return 0;
  }
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 70;
  if (c.includes(q)) return 50;
  if (d.includes(q)) return 40;
  return 0;
};

const HomeToolSearch = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(
    null
  );

  const matches = useMemo(() => {
    const q = normalize(query);
    if (!q) {
      return [];
    }
    const scored = HOME_TOOL_INDEX.map((tool) => ({
      tool,
      score: scoreMatch(
        q,
        tool.title,
        tool.description,
        tool.category
      )
    })).filter((row) => row.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map((row) => row.tool);
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const node = containerRef.current;
      if (!node) {
        return;
      }
      if (node.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, []);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const first = matches[0];
    if (!first) {
      return;
    }
    window.location.href = first.href;
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      aria-label="Search tools"
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div className="flex flex-1 items-center gap-2">
          <span
            aria-hidden="true"
            className="select-none text-slate-400"
          >
            ⌕
          </span>
          <input
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              setIsOpen(Boolean(value.trim()));
            }}
            onFocus={() => setIsOpen(Boolean(query.trim()))}
            placeholder="Search tools (e.g. “mortgage”, “unit”, “QR”, “pixel”)"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            type="search"
            inputMode="search"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setIsOpen(false);
          }}
          className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          aria-label="Clear search"
          disabled={!query}
        >
          Clear
        </button>
      </form>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {matches.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-600">
              No tools match “{query}”.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {matches.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="block px-4 py-3 hover:bg-slate-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        {tool.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-500">
                        {tool.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {tool.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
            Tip: press Enter to open the top result.
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeToolSearch;


