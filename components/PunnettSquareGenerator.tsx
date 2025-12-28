"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { PunnettMode, TraitPreset } from "@/lib/punnettSquareLogic";
import {
  buildPunnettSquare,
  punnettResultToCsv,
  TRAIT_PRESETS
} from "@/lib/punnettSquareLogic";

type StoredState = {
  presetId: TraitPreset["id"];
  mode: PunnettMode;
  parent1: string;
  parent2: string;
  showSteps: boolean;
};

const STORAGE_KEY = "lht_punnett_square_state_v1";

const formatPercent = (value: number): string =>
  Number.isFinite(value) ? `${value.toFixed(2)}%` : "—";

const canonicalizeLetter = (s: string): string => {
  const trimmed = s.trim();
  if (!trimmed) return "A";
  const ch = trimmed[0];
  if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {
    return ch.toUpperCase();
  }
  return "A";
};

const PunnettSquareGenerator = () => {
  const [presetId, setPresetId] = useState<TraitPreset["id"]>("pea_seed_shape");
  const [mode, setMode] = useState<PunnettMode>("single");
  const [parent1, setParent1] = useState("Rr");
  const [parent2, setParent2] = useState("Rr");
  const [customLetter1, setCustomLetter1] = useState("A");
  const [customDom1, setCustomDom1] = useState("Dominant");
  const [customRec1, setCustomRec1] = useState("Recessive");
  const [customLetter2, setCustomLetter2] = useState("B");
  const [customDom2, setCustomDom2] = useState("Dominant");
  const [customRec2, setCustomRec2] = useState("Recessive");
  const [showSteps, setShowSteps] = useState(true);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportRef = useRef<HTMLDivElement | null>(null);

  const preset = useMemo(() => {
    return TRAIT_PRESETS.find((p) => p.id === presetId) ?? TRAIT_PRESETS[0];
  }, [presetId]);

  useEffect(() => {
    if (preset.id === "custom") {
      return;
    }
    setMode(preset.mode);
    if (preset.mode === "single") {
      setParent1(`${preset.locus1.letter}${preset.locus1.letter.toLowerCase()}`);
      setParent2(`${preset.locus1.letter}${preset.locus1.letter.toLowerCase()}`);
    } else {
      const l1 = preset.locus1.letter;
      const l2 = preset.locus2?.letter ?? "B";
      setParent1(`${l1}${l1.toLowerCase()}${l2}${l2.toLowerCase()}`);
      setParent2(`${l1}${l1.toLowerCase()}${l2}${l2.toLowerCase()}`);
    }
  }, [preset]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (parsed.presetId) {
      setPresetId(parsed.presetId);
    }
    if (parsed.mode === "single" || parsed.mode === "dihybrid") {
      setMode(parsed.mode);
    }
    if (typeof parsed.parent1 === "string") {
      setParent1(parsed.parent1);
    }
    if (typeof parsed.parent2 === "string") {
      setParent2(parsed.parent2);
    }
    if (typeof parsed.showSteps === "boolean") {
      setShowSteps(parsed.showSteps);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: StoredState = { presetId, mode, parent1, parent2, showSteps };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [presetId, mode, parent1, parent2, showSteps]);

  const locusLabels = useMemo(() => {
    if (preset.id !== "custom") {
      const labels = [
        { dominantLabel: preset.locus1.dominantLabel, recessiveLabel: preset.locus1.recessiveLabel }
      ];
      if (preset.mode === "dihybrid" && preset.locus2) {
        labels.push({
          dominantLabel: preset.locus2.dominantLabel,
          recessiveLabel: preset.locus2.recessiveLabel
        });
      }
      return labels;
    }
    const l1 = {
      dominantLabel: customDom1.trim() || "Dominant",
      recessiveLabel: customRec1.trim() || "Recessive"
    };
    if (mode === "single") {
      return [l1];
    }
    return [
      l1,
      {
        dominantLabel: customDom2.trim() || "Dominant",
        recessiveLabel: customRec2.trim() || "Recessive"
      }
    ];
  }, [preset, customDom1, customRec1, customDom2, customRec2, mode]);

  const effectiveParents = useMemo(() => {
    if (preset.id !== "custom") {
      return { p1: parent1, p2: parent2 };
    }
    const l1 = canonicalizeLetter(customLetter1);
    const l2 = canonicalizeLetter(customLetter2);
    const normalizeSingle = (g: string) => g.replaceAll(/A/gi, l1);
    const normalizeDihybrid = (g: string) =>
      g
        .replaceAll(/A/gi, l1)
        .replaceAll(/B/gi, l2);
    const mapper = mode === "single" ? normalizeSingle : normalizeDihybrid;
    return { p1: mapper(parent1), p2: mapper(parent2) };
  }, [preset.id, parent1, parent2, customLetter1, customLetter2, mode]);

  const punnett = useMemo(() => {
    return buildPunnettSquare(mode, effectiveParents.p1, effectiveParents.p2, locusLabels, showSteps);
  }, [mode, effectiveParents, locusLabels, showSteps]);

  const handleCopyJson = () => {
    if (typeof window === "undefined") return;
    const payload = punnett.ok
      ? {
          toolName: "Punnett Square Generator",
          generatedAt: new Date().toISOString(),
          mode: punnett.mode,
          parents: { parent1: punnett.parent1, parent2: punnett.parent2 },
          genotypes: punnett.genotypePercents,
          phenotypes: punnett.phenotypePercents,
          grid: punnett.grid.map((row) => row.map((cell) => cell.genotype))
        }
      : {
          toolName: "Punnett Square Generator",
          generatedAt: new Date().toISOString(),
          mode,
          parents: { parent1: effectiveParents.p1, parent2: effectiveParents.p2 },
          error: punnett.message
        };

    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => setCopiedMessage("Copied JSON."))
        .catch(() => setCopiedMessage("Could not copy JSON."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
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

  const handleDownloadCsv = () => {
    if (typeof window === "undefined") return;
    const csv = punnettResultToCsv(punnett);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `punnett-square-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    a.download = `lifehacktoolbox-punnett-square-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  const genotypeExamples = mode === "single"
    ? ["AA", "Aa", "aa"]
    : ["AABB", "AaBb", "Aabb", "aaBb"];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Parents and mode
            </h2>
            <p className="text-[11px] text-slate-600">
              This is a simplified Mendelian model for learning. Real traits are often more complex.
            </p>
          </header>

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Trait preset</span>
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value as TraitPreset["id"])}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {TRAIT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Mode</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as PunnettMode)}
                disabled={preset.id !== "custom" && preset.id !== "pea_two_traits" && preset.mode !== mode}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="single">Single gene</option>
                <option value="dihybrid">Dihybrid (two genes)</option>
              </select>
            </label>
            <label className="flex items-end gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="pb-2 text-sm text-slate-700">Show steps</span>
            </label>
          </div>

          {preset.id === "custom" && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold text-slate-700">
                Custom allele letters and phenotype labels
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-xs text-slate-700">
                  <span className="font-medium text-slate-700">Gene 1 letter</span>
                  <input
                    value={customLetter1}
                    onChange={(e) => setCustomLetter1(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-700">
                  <span className="font-medium text-slate-700">Dominant label</span>
                  <input
                    value={customDom1}
                    onChange={(e) => setCustomDom1(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-700">
                  <span className="font-medium text-slate-700">Recessive label</span>
                  <input
                    value={customRec1}
                    onChange={(e) => setCustomRec1(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              {mode === "dihybrid" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-xs text-slate-700">
                    <span className="font-medium text-slate-700">Gene 2 letter</span>
                    <input
                      value={customLetter2}
                      onChange={(e) => setCustomLetter2(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs text-slate-700">
                    <span className="font-medium text-slate-700">Dominant label</span>
                    <input
                      value={customDom2}
                      onChange={(e) => setCustomDom2(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs text-slate-700">
                    <span className="font-medium text-slate-700">Recessive label</span>
                    <input
                      value={customRec2}
                      onChange={(e) => setCustomRec2(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </label>
                </div>
              )}
              <p className="text-[11px] text-slate-600">
                Tip: in custom mode, use A/a for gene 1 and B/b for gene 2 in your inputs; the tool remaps them to your chosen letters.
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Parent 1 genotype</span>
              <input
                value={parent1}
                onChange={(e) => setParent1(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono"
                spellCheck={false}
                placeholder={mode === "single" ? "Aa" : "AaBb"}
              />
            </label>
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Parent 2 genotype</span>
              <input
                value={parent2}
                onChange={(e) => setParent2(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono"
                spellCheck={false}
                placeholder={mode === "single" ? "Aa" : "AaBb"}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="font-semibold">Examples:</span>
            {genotypeExamples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setParent1(ex);
                  setParent2(ex);
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-slate-800 hover:border-slate-300"
              >
                {ex}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                if (mode === "single") {
                  setParent1(`${parent1[0]?.toUpperCase() ?? "A"}${parent1[0]?.toLowerCase() ?? "a"}`);
                  setParent2(`${parent2[0]?.toLowerCase() ?? "a"}${parent2[0]?.toLowerCase() ?? "a"}`);
                } else {
                  setParent1("AaBb");
                  setParent2("AaBb");
                }
              }}
              className="ml-auto rounded-md border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Common cross
            </button>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {preset.disclaimer}
          </div>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Punnett square snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Punnett Square Generator
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Mode: <span className="font-mono text-slate-100">{mode}</span> • Parents:{" "}
                    <span className="font-mono text-emerald-300">
                      {effectiveParents.p1 || "—"} × {effectiveParents.p2 || "—"}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting || !punnett.ok}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? "Exporting…" : "Export PNG"}
                </button>
              </div>

              {!punnett.ok ? (
                <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-100">
                  {punnett.message}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-auto rounded-xl border border-slate-800 bg-[#0b1220] p-3">
                    <table className="border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="w-24 p-2 text-left text-[11px] font-semibold text-slate-300">
                            Gametes
                          </th>
                          {punnett.gametes2.map((g) => (
                            <th
                              key={g.label}
                              className="min-w-[76px] p-2 text-center font-mono text-slate-100"
                            >
                              {g.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {punnett.grid.map((row, r) => (
                          <tr key={r}>
                            <th className="p-2 text-left font-mono text-slate-100">
                              {punnett.gametes1[r]?.label}
                            </th>
                            {row.map((cell, c) => (
                              <td
                                key={c}
                                className="border border-slate-800 bg-slate-950/40 p-2 text-center font-mono text-slate-50"
                              >
                                {cell.genotype}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Genotype outcomes
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        {Object.entries(punnett.genotypeCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([g, count]) => (
                            <div key={g} className="flex items-center justify-between gap-3">
                              <span className="font-mono text-slate-100">{g}</span>
                              <span className="font-mono text-slate-300">
                                {count} • {formatPercent(punnett.genotypePercents[g])}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Phenotype outcomes (simplified)
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        {Object.entries(punnett.phenotypeCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([p, count]) => (
                            <div key={p} className="flex items-center justify-between gap-3">
                              <span className="text-slate-100">{p}</span>
                              <span className="font-mono text-slate-300">
                                {count} • {formatPercent(punnett.phenotypePercents[p])}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {showSteps && punnett.steps.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Steps
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-100">
                        {punnett.steps.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                Educational tool only. Phenotype mapping uses a simple dominance rule and does not model real-world genetic complexity.
              </p>
            </div>
          </ExportableImageFrame>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Copy JSON
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={!punnett.ok}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download CSV
            </button>
            {copiedMessage && (
              <span className="text-[11px] text-slate-600">{copiedMessage}</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PunnettSquareGenerator;


