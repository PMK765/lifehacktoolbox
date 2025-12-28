"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { RegexMatchRow, RegexPreset, TokenExplanation } from "@/lib/regexPlaygroundLogic";
import {
  buildShareUrl,
  explainRegexTokens,
  REGEX_PRESETS,
  validateRegexSubset
} from "@/lib/regexPlaygroundLogic";

type StoredState = {
  pattern: string;
  flags: string;
  text: string;
  presetId: RegexPreset["id"] | "custom";
};

const STORAGE_KEY = "lht_regex_playground_state_v1";

const buildFlags = (opts: { g: boolean; i: boolean; m: boolean; s: boolean; u: boolean }): string => {
  return `${opts.g ? "g" : ""}${opts.i ? "i" : ""}${opts.m ? "m" : ""}${opts.s ? "s" : ""}${opts.u ? "u" : ""}`;
};

const defaultText = `Paste test text here.

Example emails: hello@example.com, test.user+tag@domain.co
Example URLs: https://lifehacktoolbox.com/function-grapher, http://example.org/path?q=1
Example phone: (555) 123-4567
Example date: 2025-12-28
`;

const escapeHtml = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

type HighlightSegment =
  | { type: "text"; value: string }
  | { type: "match"; value: string; matchIndex: number };

const RegexPlayground = () => {
  const searchParams = useSearchParams();

  const [presetId, setPresetId] = useState<RegexPreset["id"] | "custom">("email");
  const [pattern, setPattern] = useState(REGEX_PRESETS[0].pattern);
  const [flagState, setFlagState] = useState({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false
  });
  const [text, setText] = useState(defaultText);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const p = searchParams.get("pattern");
    const f = searchParams.get("flags");
    const t = searchParams.get("text");
    if (typeof p === "string" && p.length > 0) {
      setPattern(p);
      setPresetId("custom");
    }
    if (typeof f === "string") {
      setFlagState({
        g: f.includes("g"),
        i: f.includes("i"),
        m: f.includes("m"),
        s: f.includes("s"),
        u: f.includes("u")
      });
    }
    if (typeof t === "string" && t.length > 0) {
      setText(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (typeof parsed.pattern === "string" && parsed.pattern.length > 0) {
      setPattern(parsed.pattern);
    }
    if (typeof parsed.flags === "string") {
      setFlagState({
        g: parsed.flags.includes("g"),
        i: parsed.flags.includes("i"),
        m: parsed.flags.includes("m"),
        s: parsed.flags.includes("s"),
        u: parsed.flags.includes("u")
      });
    }
    if (typeof parsed.text === "string") {
      setText(parsed.text);
    }
    if (parsed.presetId) {
      setPresetId(parsed.presetId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flags = buildFlags(flagState);
    const state: StoredState = {
      pattern,
      flags,
      text,
      presetId
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [pattern, flagState, text, presetId]);

  const flags = useMemo(() => buildFlags(flagState), [flagState]);

  const preset = useMemo(() => {
    return REGEX_PRESETS.find((p) => p.id === presetId) ?? null;
  }, [presetId]);

  useEffect(() => {
    if (!preset) return;
    setPattern(preset.pattern);
    setFlagState({
      g: preset.flags.includes("g"),
      i: preset.flags.includes("i"),
      m: preset.flags.includes("m"),
      s: preset.flags.includes("s"),
      u: preset.flags.includes("u")
    });
  }, [preset]);

  const validation = useMemo(() => validateRegexSubset(pattern, flags), [pattern, flags]);

  const matches: RegexMatchRow[] = useMemo(() => {
    if (!validation.ok) return [];
    if (typeof window === "undefined") return [];

    const r = new RegExp(pattern, flags);
    const rows: RegexMatchRow[] = [];
    const useGlobal = flags.includes("g");

    if (!useGlobal) {
      const m = r.exec(text);
      if (m && typeof m.index === "number") {
        rows.push({
          index: m.index,
          match: m[0] ?? "",
          groups: (m.slice(1) as string[]).map((g) => (typeof g === "string" ? g : ""))
        });
      }
      return rows;
    }

    let guard = 0;
    while (guard < 5000) {
      guard += 1;
      const m = r.exec(text);
      if (!m || typeof m.index !== "number") break;
      rows.push({
        index: m.index,
        match: m[0] ?? "",
        groups: (m.slice(1) as string[]).map((g) => (typeof g === "string" ? g : ""))
      });
      if (m[0] === "") {
        r.lastIndex += 1;
      }
      if (rows.length >= 500) break;
    }
    return rows;
  }, [validation.ok, pattern, flags, text]);

  const highlightedSegments: HighlightSegment[] = useMemo(() => {
    if (!validation.ok || matches.length === 0) {
      return [{ type: "text", value: text }];
    }
    const sorted = [...matches].sort((a, b) => a.index - b.index);
    const segments: HighlightSegment[] = [];
    let cursor = 0;
    sorted.forEach((m, idx) => {
      const start = Math.max(0, Math.min(text.length, m.index));
      const end = Math.max(start, Math.min(text.length, m.index + m.match.length));
      if (start > cursor) {
        segments.push({ type: "text", value: text.slice(cursor, start) });
      }
      if (end > start) {
        segments.push({ type: "match", value: text.slice(start, end), matchIndex: idx });
      }
      cursor = Math.max(cursor, end);
    });
    if (cursor < text.length) {
      segments.push({ type: "text", value: text.slice(cursor) });
    }
    if (segments.length === 0) {
      return [{ type: "text", value: text }];
    }
    return segments;
  }, [validation.ok, matches, text]);

  const tokenExplanations: TokenExplanation[] = useMemo(
    () => explainRegexTokens(pattern),
    [pattern]
  );

  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const url = buildShareUrl(`${window.location.origin}${window.location.pathname}`, pattern, flags, text);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(url)
        .then(() => setCopiedMessage("Copied link."))
        .catch(() => setCopiedMessage("Could not copy link."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedMessage("Copied link.");
    }
    window.setTimeout(() => setCopiedMessage(null), 1200);
  };

  const handleCopyJson = () => {
    if (typeof window === "undefined") return;
    const payload = {
      toolName: "Regex Playground",
      generatedAt: new Date().toISOString(),
      pattern,
      flags,
      matchCount: matches.length,
      matches
    };
    const textOut = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(textOut)
        .then(() => setCopiedMessage("Copied JSON."))
        .catch(() => setCopiedMessage("Could not copy JSON."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = textOut;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedMessage("Copied JSON.");
    }
    window.setTimeout(() => setCopiedMessage(null), 1200);
  };

  const handleExportPng = async () => {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: "#0b1220",
      scale: 2
    });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `lifehacktoolbox-regex-playground-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  const previewHtml = useMemo(() => {
    const parts = highlightedSegments.map((seg) => {
      if (seg.type === "text") {
        return escapeHtml(seg.value);
      }
      const inner = escapeHtml(seg.value);
      return `<mark data-match="${seg.matchIndex}" class="bg-amber-200 text-slate-900 rounded px-0.5">${inner}</mark>`;
    });
    return parts.join("");
  }, [highlightedSegments]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Inputs</h2>
            <p className="text-[11px] text-slate-600">
              Beginner-friendly regex tester with highlighting and a match table.
            </p>
          </header>

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Preset</span>
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value as StoredState["presetId"])}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="custom">Custom</option>
              {REGEX_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {preset && (
              <p className="text-[11px] text-slate-500">{preset.description}</p>
            )}
          </label>

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Pattern</span>
            <input
              value={pattern}
              onChange={(e) => {
                setPresetId("custom");
                setPattern(e.target.value);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono"
              spellCheck={false}
              autoComplete="off"
              placeholder="Example: \\b\\d{4}-\\d{2}-\\d{2}\\b"
            />
          </label>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-900">Flags</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-700">
              {(["g", "i", "m", "s", "u"] as const).map((flag) => (
                <label
                  key={flag}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
                >
                  <input
                    type="checkbox"
                    checked={flagState[flag]}
                    onChange={(e) =>
                      setFlagState((prev) => ({ ...prev, [flag]: e.target.checked }))
                    }
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
                  />
                  <span className="font-mono font-semibold">{flag}</span>
                </label>
              ))}
              <span className="ml-auto text-[11px] text-slate-600">
                Active: <span className="font-mono">{flags || "(none)"}</span>
              </span>
            </div>
          </div>

          {!validation.ok && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {validation.message}
              <div className="mt-2 text-[11px] text-rose-700">
                This tool validates a safe subset of JavaScript regex to avoid crashes without
                try/catch. If you need advanced constructs (like lookbehind), simplify the pattern.
              </div>
            </div>
          )}

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Test text</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono"
              spellCheck={false}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Copy share link
            </button>
            <button
              type="button"
              onClick={handleCopyJson}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Copy JSON
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? "Exporting…" : "Export PNG"}
            </button>
            {copiedMessage && (
              <span className="text-[11px] text-slate-600">{copiedMessage}</span>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Regex results snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">Regex Playground</p>
                  <p className="text-[11px] text-slate-300">
                    <span className="text-slate-400">/</span>
                    <span className="font-mono text-emerald-300">{pattern || "…"}</span>
                    <span className="text-slate-400">/</span>
                    <span className="font-mono text-slate-100">{flags}</span>
                  </p>
                </div>
                <div className="text-[11px] text-slate-300">
                  Matches:{" "}
                  <span className="font-mono text-slate-100">{matches.length}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Highlighted preview
                </p>
                <div
                  className="mt-2 whitespace-pre-wrap break-words rounded-md border border-slate-800 bg-slate-950 p-3 font-mono text-sm text-slate-100"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Match table
                  </p>
                  {matches.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-400">
                      No matches found.
                    </p>
                  ) : (
                    <div className="mt-2 max-h-72 overflow-auto rounded-md border border-slate-800">
                      <table className="min-w-full border-collapse text-[11px]">
                        <thead className="bg-slate-900 text-slate-300">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">#</th>
                            <th className="px-3 py-2 text-left font-semibold">Index</th>
                            <th className="px-3 py-2 text-left font-semibold">Match</th>
                            <th className="px-3 py-2 text-left font-semibold">Groups</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matches.map((m, idx) => (
                            <tr key={`${m.index}-${idx}`} className="border-t border-slate-800">
                              <td className="px-3 py-2 font-mono text-slate-300">{idx + 1}</td>
                              <td className="px-3 py-2 font-mono text-slate-300">{m.index}</td>
                              <td className="px-3 py-2 font-mono text-slate-100">{m.match}</td>
                              <td className="px-3 py-2 font-mono text-slate-300">
                                {m.groups.length > 0 ? m.groups.join(" | ") : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Explain tokens
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Quick reference for common regex tokens used in the pattern.
                  </p>
                  <div className="mt-2 max-h-72 overflow-auto rounded-md border border-slate-800 bg-[#0b1220]">
                    <ul className="divide-y divide-slate-800">
                      {tokenExplanations.length === 0 ? (
                        <li className="p-3 text-sm text-slate-400">No tokens detected.</li>
                      ) : (
                        tokenExplanations.map((t) => (
                          <li key={`${t.token}-${t.meaning}`} className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-mono text-sm text-emerald-300">
                                {t.token}
                              </span>
                              <span className="text-sm text-slate-200">
                                {t.meaning}
                              </span>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Privacy: everything runs locally in your browser. This tool does not upload your text.
              </p>
            </div>
          </ExportableImageFrame>
        </section>
      </div>
    </div>
  );
};

export default RegexPlayground;


