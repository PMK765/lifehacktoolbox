"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { ParsedCsv } from "@/lib/statisticsLogic";
import {
  buildHistogram,
  clampInt,
  computeSummary,
  extractNumericColumn,
  formatNumber,
  parseCsv,
  parseNumbersFromText
} from "@/lib/statisticsLogic";

type DataSourceId = "paste" | "csv";

type StoredState = {
  dataSource: DataSourceId;
  pastedText: string;
  csvText: string;
  selectedColumnIndex: number;
  histogramBins: number;
};

const STORAGE_KEY = "lht_statistics_explorer_state_v1";
const MAX_STORED_TEXT_CHARS = 140000;

const trimForStorage = (text: string): string => {
  if (text.length <= MAX_STORED_TEXT_CHARS) {
    return text;
  }
  return text.slice(0, MAX_STORED_TEXT_CHARS);
};

const drawHistogram = (
  canvas: HTMLCanvasElement,
  bins: ReturnType<typeof buildHistogram>
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width <= 0 || height <= 0) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, width, height);

  const padding = { left: 44, right: 16, top: 16, bottom: 36 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  if (bins.length === 0) {
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
    ctx.fillText("No data", padding.left, padding.top + 16);
    return;
  }

  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const barW = plotW / bins.length;

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (i / 4) * plotH;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + plotW, y);
    ctx.stroke();
  }

  bins.forEach((b, i) => {
    const x = padding.left + i * barW;
    const hFrac = b.count / maxCount;
    const barH = hFrac * plotH;
    const y = padding.top + plotH - barH;
    ctx.fillStyle = "rgba(52, 211, 153, 0.85)";
    ctx.fillRect(x + 1, y, Math.max(1, barW - 2), barH);
  });

  const first = bins[0];
  const last = bins[bins.length - 1];
  ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
  ctx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI";
  ctx.fillText(formatNumber(first.start), padding.left, padding.top + plotH + 26);
  ctx.fillText(formatNumber(last.end), padding.left + plotW - 40, padding.top + plotH + 26);
  ctx.fillText(String(maxCount), 10, padding.top + 10);
};

const drawBoxPlot = (
  canvas: HTMLCanvasElement,
  summary: ReturnType<typeof computeSummary>
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width <= 0 || height <= 0) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, width, height);

  const padding = { left: 44, right: 16, top: 16, bottom: 28 };
  const plotW = width - padding.left - padding.right;
  const centerY = padding.top + (height - padding.top - padding.bottom) / 2;

  if (!summary) {
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
    ctx.fillText("No data", padding.left, padding.top + 16);
    return;
  }

  const min = summary.min;
  const max = summary.max;
  const span = max - min || 1;
  const xFor = (v: number) => padding.left + ((v - min) / span) * plotW;

  const xMin = xFor(summary.min);
  const xMax = xFor(summary.max);
  const xQ1 = xFor(summary.q1);
  const xMed = xFor(summary.median);
  const xQ3 = xFor(summary.q3);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xMin, centerY);
  ctx.lineTo(xMax, centerY);
  ctx.stroke();

  ctx.fillStyle = "rgba(52, 211, 153, 0.85)";
  ctx.strokeStyle = "rgba(52, 211, 153, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(xQ1, centerY - 18, xQ3 - xQ1, 36);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(251, 146, 60, 0.95)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(xMed, centerY - 18);
  ctx.lineTo(xMed, centerY + 18);
  ctx.stroke();

  ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
  ctx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI";
  ctx.fillText(formatNumber(min), padding.left, height - 10);
  ctx.fillText(formatNumber(max), padding.left + plotW - 40, height - 10);
};

const StatisticsExplorer = () => {
  const [dataSource, setDataSource] = useState<DataSourceId>("paste");
  const [pastedText, setPastedText] = useState("1, 2, 3, 4, 5, 6, 7, 8, 9, 10");
  const [csvText, setCsvText] = useState("");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const [histogramBins, setHistogramBins] = useState(18);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportRef = useRef<HTMLDivElement | null>(null);
  const histogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed) return;
    if (parsed.dataSource === "paste" || parsed.dataSource === "csv") {
      setDataSource(parsed.dataSource);
    }
    if (typeof parsed.pastedText === "string") {
      setPastedText(parsed.pastedText);
    }
    if (typeof parsed.csvText === "string") {
      setCsvText(parsed.csvText);
    }
    if (typeof parsed.selectedColumnIndex === "number") {
      setSelectedColumnIndex(clampInt(parsed.selectedColumnIndex, 0, 50));
    }
    if (typeof parsed.histogramBins === "number") {
      setHistogramBins(clampInt(parsed.histogramBins, 3, 60));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: StoredState = {
      dataSource,
      pastedText: trimForStorage(pastedText),
      csvText: trimForStorage(csvText),
      selectedColumnIndex,
      histogramBins
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [dataSource, pastedText, csvText, selectedColumnIndex, histogramBins]);

  const parsedCsv: ParsedCsv | null = useMemo(() => {
    if (dataSource !== "csv") return null;
    const parsed = parseCsv(csvText);
    return parsed;
  }, [csvText, dataSource]);

  const values = useMemo(() => {
    setCsvError(null);
    if (dataSource === "paste") {
      return parseNumbersFromText(pastedText);
    }
    if (!parsedCsv) {
      return [];
    }
    const idx = clampInt(selectedColumnIndex, 0, Math.max(0, parsedCsv.headers.length - 1));
    return extractNumericColumn(parsedCsv, idx);
  }, [dataSource, pastedText, parsedCsv, selectedColumnIndex]);

  const summary = useMemo(() => computeSummary(values), [values]);
  const histogram = useMemo(
    () => buildHistogram(values, histogramBins),
    [values, histogramBins]
  );

  useEffect(() => {
    const canvas = histogramCanvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    drawHistogram(canvas, histogram);
  }, [histogram]);

  useEffect(() => {
    const canvas = boxCanvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    drawBoxPlot(canvas, summary);
  }, [summary]);

  const handleUploadCsv = (file: File | null) => {
    setCsvError(null);
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setCsvText(text);
      setDataSource("csv");
    };
    reader.onerror = () => {
      setCsvError("Could not read that file.");
    };
    reader.readAsText(file);
  };

  const handleCopySummaryCsv = () => {
    if (typeof window === "undefined") return;
    if (!summary) return;
    const lines: string[] = [
      "metric,value",
      `count,${summary.count}`,
      `min,${summary.min}`,
      `max,${summary.max}`,
      `range,${summary.range}`,
      `mean,${summary.mean}`,
      `median,${summary.median}`,
      `variance,${summary.variance}`,
      `std_dev,${summary.stdDev}`,
      `q1,${summary.q1}`,
      `q3,${summary.q3}`,
      `iqr,${summary.iqr}`,
      `outliers_count,${summary.outliers.length}`
    ];
    const csv = lines.join("\n");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(csv)
        .then(() => setCopiedMessage("Copied summary CSV."))
        .catch(() => setCopiedMessage("Could not copy CSV."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = csv;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedMessage("Copied summary CSV.");
    }
    window.setTimeout(() => setCopiedMessage(null), 1200);
  };

  const handleDownloadSummaryCsv = () => {
    if (typeof window === "undefined") return;
    if (!summary) return;
    const lines: string[] = [
      "metric,value",
      `count,${summary.count}`,
      `min,${summary.min}`,
      `max,${summary.max}`,
      `range,${summary.range}`,
      `mean,${summary.mean}`,
      `median,${summary.median}`,
      `modes,"${summary.modes.map((m) => String(m)).join(";")}"`,
      `variance,${summary.variance}`,
      `std_dev,${summary.stdDev}`,
      `q1,${summary.q1}`,
      `q3,${summary.q3}`,
      `iqr,${summary.iqr}`,
      `outlier_low_threshold,${summary.outlierLowThreshold}`,
      `outlier_high_threshold,${summary.outlierHighThreshold}`,
      `outliers_count,${summary.outliers.length}`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `statistics-summary-${stamp}.csv`;
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
    a.download = `lifehacktoolbox-statistics-report-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Data input</h2>
            <p className="text-[11px] text-slate-600">
              Paste numbers or upload a CSV and choose a column. Settings are saved in your
              browser. Clearing site data removes your history.
            </p>
          </header>

          <div className="inline-flex rounded-full bg-slate-100 p-1 text-[11px]">
            <button
              type="button"
              onClick={() => setDataSource("paste")}
              className={`rounded-full px-3 py-1 font-semibold ${
                dataSource === "paste"
                  ? "bg-slate-900 text-slate-50"
                  : "text-slate-700"
              }`}
            >
              Paste numbers
            </button>
            <button
              type="button"
              onClick={() => setDataSource("csv")}
              className={`rounded-full px-3 py-1 font-semibold ${
                dataSource === "csv"
                  ? "bg-slate-900 text-slate-50"
                  : "text-slate-700"
              }`}
            >
              Upload CSV
            </button>
          </div>

          {dataSource === "paste" ? (
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">
                Numbers (comma / space / newline separated)
              </span>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                spellCheck={false}
              />
              <p className="text-[11px] text-slate-500">
                Non-numeric tokens are ignored. Thousands separators are supported.
              </p>
            </label>
          ) : (
            <div className="space-y-3">
              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">CSV file</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => handleUploadCsv(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                />
                {csvFileName && (
                  <p className="text-[11px] text-slate-500">Loaded: {csvFileName}</p>
                )}
                {csvError && (
                  <p className="text-[11px] text-rose-700">{csvError}</p>
                )}
              </label>

              {parsedCsv ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs text-slate-700">
                    <span className="font-medium text-slate-700">Column</span>
                    <select
                      value={selectedColumnIndex}
                      onChange={(e) => setSelectedColumnIndex(clampInt(Number(e.target.value), 0, 50))}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      {parsedCsv.headers.map((h, idx) => (
                        <option key={idx} value={idx}>
                          {h || `Column ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <p className="font-semibold">Rows</p>
                    <p className="font-mono text-slate-900">{parsedCsv.rows.length}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Upload a CSV to enable column selection.
                </p>
              )}

              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Raw CSV (optional)</span>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  spellCheck={false}
                />
              </label>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Histogram bins</span>
              <input
                type="range"
                min={3}
                max={60}
                step={1}
                value={histogramBins}
                onChange={(e) => setHistogramBins(clampInt(Number(e.target.value), 3, 60))}
                className="h-1 w-full cursor-pointer rounded-full bg-slate-200 accent-emerald-600"
              />
              <p className="text-[11px] text-slate-500">
                {histogramBins} bins
              </p>
            </label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <p className="font-semibold">Parsed values</p>
              <p className="font-mono text-slate-900">{values.length}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Statistics report snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Statistics Explorer
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {dataSource === "paste" ? "Pasted dataset" : "CSV dataset"}
                    {dataSource === "csv" && parsedCsv
                      ? ` • Column: ${parsedCsv.headers[selectedColumnIndex] || `Column ${selectedColumnIndex + 1}`}`
                      : ""}
                  </p>
                </div>
                <div className="text-[11px] text-slate-300">
                  Count:{" "}
                  <span className="font-mono text-slate-100">
                    {summary ? summary.count : 0}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
                  <canvas ref={histogramCanvasRef} className="h-[240px] w-full" />
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
                  <canvas ref={boxCanvasRef} className="h-[240px] w-full" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                {!summary ? (
                  <p className="text-sm text-slate-400">
                    Add numeric data to see summary statistics.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Center
                      </p>
                      <p className="mt-2 text-sm text-slate-200">
                        <span className="text-slate-300">Mean:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.mean)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">Median:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.median)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">Mode(s):</span>{" "}
                        <span className="font-mono">
                          {summary.modes.length > 0
                            ? summary.modes.map((m) => formatNumber(m)).join(", ")
                            : "—"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Spread
                      </p>
                      <p className="mt-2 text-sm text-slate-200">
                        <span className="text-slate-300">Min:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.min)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">Max:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.max)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">Range:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.range)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">Std dev:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.stdDev)}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Quartiles &amp; outliers
                      </p>
                      <p className="mt-2 text-sm text-slate-200">
                        <span className="text-slate-300">Q1:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.q1)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">Q3:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.q3)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">IQR:</span>{" "}
                        <span className="font-mono">{formatNumber(summary.iqr)}</span>
                      </p>
                      <p className="text-sm text-slate-200">
                        <span className="text-slate-300">Outliers:</span>{" "}
                        <span className="font-mono">{summary.outliers.length}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Histogram and box plot are approximate visual summaries. For sensitive data,
                avoid storing it in your browser.
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
              {isExporting ? "Exporting…" : "Export PNG report"}
            </button>
            <button
              type="button"
              onClick={handleDownloadSummaryCsv}
              disabled={!summary}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Export CSV summary
            </button>
            <button
              type="button"
              onClick={handleCopySummaryCsv}
              disabled={!summary}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Copy CSV summary
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

export default StatisticsExplorer;


