"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import {
  breakdownToCsv,
  computeMolarMass
} from "@/lib/molarMassLogic";

const STORAGE_KEY = "lht_molar_mass_formula_v1";

const formatNumber = (value: number, digits = 6): string => {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits).replace(/\.?0+$/, "");
};

const percentBarColor = (percent: number): string => {
  if (percent >= 60) return "#34d399";
  if (percent >= 30) return "#60a5fa";
  if (percent >= 15) return "#fbbf24";
  return "#fb7185";
};

const MolecularWeightCalculator = () => {
  const [formula, setFormula] = useState("Ca(OH)2");
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && saved.length > 0) {
      setFormula(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, formula);
  }, [formula]);

  const result = useMemo(() => computeMolarMass(formula), [formula]);

  const handleCopyJson = () => {
    if (typeof window === "undefined") return;
    const payload = result.ok
      ? {
          toolName: "Molecular Weight (Molar Mass) Calculator",
          generatedAt: new Date().toISOString(),
          formula: result.formula,
          totalMolarMass_g_per_mol: result.totalMolarMass,
          breakdown: result.breakdown.map((row) => ({
            symbol: row.symbol,
            name: row.name,
            atomicWeight: row.atomicWeight,
            count: row.count,
            massContribution: row.massContribution,
            percent: row.percent
          }))
        }
      : {
          toolName: "Molecular Weight (Molar Mass) Calculator",
          generatedAt: new Date().toISOString(),
          formula,
          error: result.error
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
    const csv = breakdownToCsv(result);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `molar-mass-${stamp}.csv`;
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
    a.download = `lifehacktoolbox-molar-mass-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Formula</h2>
            <p className="text-[11px] text-slate-600">
              Supports parentheses and multipliers like Ca(OH)2 and Al2(SO4)3.
            </p>
          </header>

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Chemical formula</span>
            <input
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              spellCheck={false}
              autoComplete="off"
              placeholder="Example: C6H12O6"
            />
          </label>

          {!result.ok && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {result.error.message}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFormula("")}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Clear
            </button>
            <p className="ml-auto text-[11px] text-slate-500">
              Saved locally in your browser.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Molar mass snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Molecular Weight (Molar Mass)
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Formula: <span className="font-mono text-emerald-300">{formula || "—"}</span>
                  </p>
                </div>
                <div className="text-[11px] text-slate-300">
                  Total:{" "}
                  <span className="font-mono text-slate-100">
                    {result.ok ? `${formatNumber(result.totalMolarMass, 5)} g/mol` : "—"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                {!result.ok ? (
                  <p className="text-sm text-slate-400">
                    Enter a valid chemical formula to see the molar mass and per-element breakdown.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="overflow-auto rounded-md border border-slate-800 bg-white/5">
                      <table className="min-w-full border-collapse text-[11px]">
                        <thead className="bg-slate-900 text-slate-300">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">Element</th>
                            <th className="px-3 py-2 text-right font-semibold">Count</th>
                            <th className="px-3 py-2 text-right font-semibold">Atomic mass</th>
                            <th className="px-3 py-2 text-right font-semibold">Contribution</th>
                            <th className="px-3 py-2 text-right font-semibold">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.breakdown.map((row) => (
                            <tr key={row.symbol} className="border-t border-slate-800 text-slate-100">
                              <td className="px-3 py-2">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-mono font-semibold text-emerald-200">
                                    {row.symbol}
                                  </span>
                                  <span className="text-slate-300">{row.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {row.count}
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {formatNumber(row.atomicWeight, 4)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {formatNumber(row.massContribution, 4)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {formatNumber(row.percent, 2)}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-slate-700 text-slate-100">
                            <td className="px-3 py-2 font-semibold">Total</td>
                            <td className="px-3 py-2" />
                            <td className="px-3 py-2" />
                            <td className="px-3 py-2 text-right font-mono font-semibold">
                              {formatNumber(result.totalMolarMass, 4)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-semibold">
                              100.00
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-md border border-slate-800 bg-[#0b1220] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Mass contribution (percent)
                      </p>
                      <div className="mt-2 space-y-2">
                        {result.breakdown.map((row) => (
                          <div key={row.symbol} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-300">
                              <span>
                                <span className="font-mono text-slate-100">{row.symbol}</span>{" "}
                                <span className="text-slate-400">({formatNumber(row.percent, 2)}%)</span>
                              </span>
                              <span className="font-mono text-slate-400">
                                {formatNumber(row.massContribution, 3)} g/mol
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${Math.max(0.5, Math.min(100, row.percent))}%`,
                                  backgroundColor: percentBarColor(row.percent)
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Atomic masses are standard average atomic weights. This calculator is educational and may differ slightly from specific lab references.
              </p>
            </div>
          </ExportableImageFrame>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? "Exporting…" : "Export PNG"}
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
              onClick={handleDownloadCsv}
              disabled={!result.ok}
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

export default MolecularWeightCalculator;


