"use client";

import { useMemo, useState } from "react";
import {
  diffLines,
  diffWords
} from "diff";

type ViewMode = "side-by-side" | "unified";

type DiffMode = "lines" | "words";

type DiffPart = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

const DiffChecker = () => {
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [viewMode, setViewMode] =
    useState<ViewMode>("side-by-side");
  const [diffMode, setDiffMode] = useState<DiffMode>("lines");
  const [summary, setSummary] = useState<string | null>(null);

  const diffResult: DiffPart[] = useMemo(() => {
    if (!originalText && !modifiedText) {
      setSummary(null);
      return [];
    }
    const parts =
      diffMode === "lines"
        ? diffLines(originalText, modifiedText)
        : diffWords(originalText, modifiedText);
    let addedCount = 0;
    let removedCount = 0;
    parts.forEach((part) => {
      if (part.added) {
        addedCount += part.value.length;
      } else if (part.removed) {
        removedCount += part.value.length;
      }
    });
    setSummary(
      `Approximate changes: +${addedCount} characters, -${removedCount} characters.`
    );
    return parts;
  }, [originalText, modifiedText, diffMode]);

  const handleSwap = () => {
    setOriginalText(modifiedText);
    setModifiedText(originalText);
  };

  const handleClear = () => {
    setOriginalText("");
    setModifiedText("");
    setSummary(null);
  };

  const handleCopyModified = async () => {
    if (!modifiedText) {
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(modifiedText);
  };

  const unifiedDiffText = useMemo(() => {
    if (diffResult.length === 0) {
      return "";
    }
    const lines: string[] = [];
    diffResult.forEach((part) => {
      const prefix = part.added
        ? "+"
        : part.removed
        ? "-"
        : " ";
      const valueLines = part.value.split("\n");
      valueLines.forEach((line, index) => {
        if (index === valueLines.length - 1 && line === "") {
          return;
        }
        lines.push(`${prefix}${line}`);
      });
    });
    return lines.join("\n");
  }, [diffResult]);

  const handleDownloadDiff = () => {
    if (!unifiedDiffText) {
      return;
    }
    const blob = new Blob([unifiedDiffText], {
      type: "text/plain;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    link.href = url;
    link.download = `lifehacktoolbox-diff-${year}-${month}-${day}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Text you paste here never leaves your browser.
        </p>
        <p>
          The diff is computed entirely on your device. You can safely compare
          drafts, emails, or snippets of code without sending them to a server.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1 ${
              viewMode === "side-by-side"
                ? "rounded-l-md bg-white font-semibold text-slate-900"
                : "text-slate-700"
            }`}
          >
            Side by side
          </button>
          <button
            type="button"
            onClick={() => setViewMode("unified")}
            className={`px-3 py-1 ${
              viewMode === "unified"
                ? "rounded-r-md bg-white font-semibold text-slate-900"
                : "text-slate-700"
            }`}
          >
            Unified
          </button>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
          <button
            type="button"
            onClick={() => setDiffMode("lines")}
            className={`px-3 py-1 ${
              diffMode === "lines"
                ? "rounded-l-md bg-white font-semibold text-slate-900"
                : "text-slate-700"
            }`}
          >
            By lines
          </button>
          <button
            type="button"
            onClick={() => setDiffMode("words")}
            className={`px-3 py-1 ${
              diffMode === "words"
                ? "rounded-r-md bg-white font-semibold text-slate-900"
                : "text-slate-700"
            }`}
          >
            By words
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Original
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSwap}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Swap
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Clear both
              </button>
            </div>
          </div>
          <textarea
            value={originalText}
            onChange={(event) =>
              setOriginalText(event.target.value)
            }
            className={`${inputBaseClasses} h-64 resize-y`}
            placeholder="Paste the original text or code here"
          />
        </section>
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Modified
            </h2>
            <button
              type="button"
              onClick={handleCopyModified}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Copy modified
            </button>
          </div>
          <textarea
            value={modifiedText}
            onChange={(event) =>
              setModifiedText(event.target.value)
            }
            className={`${inputBaseClasses} h-64 resize-y`}
            placeholder="Paste the modified text or code here"
          />
        </section>
      </div>
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Diff results
            </h2>
            <p className="text-[11px] text-slate-600">
              Green highlights show additions, red highlights show removals, and
              plain text is unchanged.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDiff}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Download diff as .txt
            </button>
          </div>
        </div>
        {summary && (
          <p className="text-[11px] text-slate-600">{summary}</p>
        )}
        {viewMode === "side-by-side" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Original with removals
              </p>
              <div className="h-72 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-900">
                {diffResult.length === 0 && (
                  <p className="text-slate-500">
                    Paste text above and start editing to see differences.
                  </p>
                )}
                {diffResult.map((part, index) => {
                  if (part.added) {
                    return null;
                  }
                  const className = part.removed
                    ? "bg-red-50 text-red-800 line-through"
                    : "";
                  return (
                    <span key={index} className={className}>
                      {part.value}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Modified with additions
              </p>
              <div className="h-72 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-900">
                {diffResult.length === 0 && (
                  <p className="text-slate-500">
                    Paste text above and start editing to see differences.
                  </p>
                )}
                {diffResult.map((part, index) => {
                  if (part.removed) {
                    return null;
                  }
                  const className = part.added
                    ? "bg-emerald-50 text-emerald-800"
                    : "";
                  return (
                    <span key={index} className={className}>
                      {part.value}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Unified diff
            </p>
            <div className="h-72 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-900">
              {diffResult.length === 0 && (
                <p className="text-slate-500">
                  Paste text above and start editing to see differences.
                </p>
              )}
              {diffResult.map((part, index) => {
                const lines = part.value.split("\n");
                return lines.map((line, lineIndex) => {
                  if (
                    lineIndex === lines.length - 1 &&
                    line === ""
                  ) {
                    return null;
                  }
                  const key = `${index}-${lineIndex}`;
                  if (part.added) {
                    return (
                      <div
                        key={key}
                        className="bg-emerald-50 text-emerald-800"
                      >
                        +{line}
                      </div>
                    );
                  }
                  if (part.removed) {
                    return (
                      <div
                        key={key}
                        className="bg-red-50 text-red-800 line-through"
                      >
                        -{line}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="text-slate-900">
                      {" "}
                      {line}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        )}
        <div className="mt-2 text-[11px] text-slate-600">
          <p className="font-semibold">Legend</p>
          <ul className="flex flex-wrap gap-4">
            <li>
              <span className="rounded-sm bg-emerald-100 px-1">
                Green
              </span>{" "}
              – added text
            </li>
            <li>
              <span className="rounded-sm bg-red-100 px-1">
                Red
              </span>{" "}
              – removed text
            </li>
            <li>Plain – unchanged text</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DiffChecker;


