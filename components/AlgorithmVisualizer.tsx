"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type {
  AlgorithmId,
  AlgorithmKind,
  ArrayPattern,
  Step,
  StepCounters
} from "@/lib/algorithmVisualizerLogic";
import {
  buildStepsForAlgorithm,
  clampInt,
  generateArray,
  parseCustomArray
} from "@/lib/algorithmVisualizerLogic";

type StoredState = {
  kind: AlgorithmKind;
  algorithm: AlgorithmId;
  size: number;
  pattern: ArrayPattern;
  speedMs: number;
  customInput: string;
  binaryTarget: number;
};

const STORAGE_KEY = "lht_algorithm_visualizer_state_v1";

const ALGORITHMS_SORT: { id: AlgorithmId; name: string }[] = [
  { id: "bubble_sort", name: "Bubble sort" },
  { id: "selection_sort", name: "Selection sort" },
  { id: "insertion_sort", name: "Insertion sort" },
  { id: "merge_sort", name: "Merge sort" },
  { id: "quick_sort", name: "Quicksort" }
];

const AlgorithmVisualizer = () => {
  const [kind, setKind] = useState<AlgorithmKind>("sorting");
  const [algorithm, setAlgorithm] = useState<AlgorithmId>("bubble_sort");
  const [size, setSize] = useState(40);
  const [pattern, setPattern] = useState<ArrayPattern>("random");
  const [speedMs, setSpeedMs] = useState(28);
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [binaryTarget, setBinaryTarget] = useState(20);

  const [array, setArray] = useState<number[]>(() => generateArray(40, "random"));
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [counters, setCounters] = useState<StepCounters>({
    comparisons: 0,
    swaps: 0,
    writes: 0
  });

  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const runTokenRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (parsed.kind === "sorting" || parsed.kind === "searching") setKind(parsed.kind);
    if (typeof parsed.algorithm === "string") setAlgorithm(parsed.algorithm as AlgorithmId);
    if (typeof parsed.size === "number") setSize(clampInt(parsed.size, 5, 120));
    if (parsed.pattern === "random" || parsed.pattern === "nearly_sorted" || parsed.pattern === "reversed") setPattern(parsed.pattern);
    if (typeof parsed.speedMs === "number") setSpeedMs(clampInt(parsed.speedMs, 5, 250));
    if (typeof parsed.customInput === "string") setCustomInput(parsed.customInput);
    if (typeof parsed.binaryTarget === "number") setBinaryTarget(clampInt(parsed.binaryTarget, 1, 9999));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: StoredState = {
      kind,
      algorithm,
      size,
      pattern,
      speedMs,
      customInput,
      binaryTarget
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [kind, algorithm, size, pattern, speedMs, customInput, binaryTarget]);

  useEffect(() => {
    if (kind === "searching") {
      setAlgorithm("binary_search");
      setUseCustomInput(true);
      return;
    }
    if (algorithm === "binary_search") {
      setAlgorithm("bubble_sort");
    }
  }, [kind]);

  const buildArrayFromInputs = () => {
    const next = useCustomInput ? parseCustomArray(customInput) : [];
    if (next.length >= 5) {
      return next.slice(0, 140);
    }
    return generateArray(size, pattern);
  };

  const resetRunState = () => {
    runTokenRef.current += 1;
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
    setSteps([]);
    setStepIndex(0);
    setCounters({ comparisons: 0, swaps: 0, writes: 0 });
  };

  const regenerate = () => {
    resetRunState();
    const next = buildArrayFromInputs();
    setArray(next);
    if (kind === "searching") {
      const sorted = [...next].sort((a, b) => a - b);
      setArray(sorted);
    }
  };

  const buildSteps = () => {
    resetRunState();
    const built = buildStepsForAlgorithm(
      algorithm,
      array,
      kind === "searching" ? binaryTarget : null
    );
    setSteps(built.steps);
    setCounters(built.counters);
    setStepIndex(0);
  };

  const applyStep = (step: Step, current: number[]): number[] => {
    if (step.type === "swap") {
      const next = [...current];
      const tmp = next[step.i];
      next[step.i] = next[step.j];
      next[step.j] = tmp;
      return next;
    }
    if (step.type === "set") {
      const next = [...current];
      next[step.i] = step.value;
      return next;
    }
    return current;
  };

  const currentMark = useMemo(() => {
    const s = steps[stepIndex];
    return s && s.type === "mark" ? s : null;
  }, [steps, stepIndex]);

  const currentCompare = useMemo(() => {
    const s = steps[stepIndex];
    return s && s.type === "compare" ? s : null;
  }, [steps, stepIndex]);

  const currentSwap = useMemo(() => {
    const s = steps[stepIndex];
    return s && s.type === "swap" ? s : null;
  }, [steps, stepIndex]);

  const currentSet = useMemo(() => {
    const s = steps[stepIndex];
    return s && s.type === "set" ? s : null;
  }, [steps, stepIndex]);

  const highlighted = useMemo(() => {
    const indices = new Set<number>();
    if (currentMark) currentMark.active.forEach((i) => indices.add(i));
    if (currentCompare) {
      indices.add(currentCompare.i);
      indices.add(currentCompare.j);
    }
    if (currentSwap) {
      indices.add(currentSwap.i);
      indices.add(currentSwap.j);
    }
    if (currentSet) {
      indices.add(currentSet.i);
    }
    return indices;
  }, [currentMark, currentCompare, currentSwap, currentSet]);

  const tick = () => {
    const token = runTokenRef.current;
    if (!isPlaying) return;
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }
    const step = steps[stepIndex];
    if (step) {
      setArray((prev) => applyStep(step, prev));
    }
    setStepIndex((prev) => prev + 1);
    timeoutRef.current = window.setTimeout(() => {
      if (runTokenRef.current !== token) return;
      tick();
    }, speedMs);
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (typeof window === "undefined") return;
    tick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const stepOnce = () => {
    if (stepIndex >= steps.length) return;
    const step = steps[stepIndex];
    if (step) {
      setArray((prev) => applyStep(step, prev));
    }
    setStepIndex((prev) => prev + 1);
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
    a.download = `lifehacktoolbox-algorithm-visualizer-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  const algorithmLabel =
    algorithm === "binary_search"
      ? "Binary search"
      : ALGORITHMS_SORT.find((a) => a.id === algorithm)?.name ?? "Algorithm";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Controls</h2>
            <p className="text-[11px] text-slate-600">
              Generate an array, build steps, then play/pause or step through.
            </p>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Mode</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as AlgorithmKind)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="sorting">Sorting</option>
                <option value="searching">Searching</option>
              </select>
            </label>

            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Algorithm</span>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as AlgorithmId)}
                disabled={kind === "searching"}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {kind === "sorting" ? (
                  ALGORITHMS_SORT.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))
                ) : (
                  <option value="binary_search">Binary search</option>
                )}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Array size</span>
              <input
                type="range"
                min={5}
                max={120}
                step={1}
                value={size}
                onChange={(e) => setSize(clampInt(Number(e.target.value), 5, 120))}
                disabled={useCustomInput}
                className="h-1 w-full cursor-pointer rounded-full bg-slate-200 accent-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <p className="text-[11px] text-slate-500">{size} items</p>
            </label>

            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Speed</span>
              <input
                type="range"
                min={5}
                max={250}
                step={1}
                value={speedMs}
                onChange={(e) => setSpeedMs(clampInt(Number(e.target.value), 5, 250))}
                className="h-1 w-full cursor-pointer rounded-full bg-slate-200 accent-emerald-600"
              />
              <p className="text-[11px] text-slate-500">{speedMs} ms/step</p>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Pattern</span>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value as ArrayPattern)}
                disabled={useCustomInput}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="random">Random</option>
                <option value="nearly_sorted">Nearly sorted</option>
                <option value="reversed">Reversed</option>
              </select>
            </label>

            {kind === "searching" ? (
              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Binary search target</span>
                <input
                  value={String(binaryTarget)}
                  onChange={(e) => setBinaryTarget(clampInt(Number(e.target.value), 1, 9999))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  inputMode="numeric"
                />
              </label>
            ) : (
              <label className="flex items-end gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={useCustomInput}
                  onChange={(e) => setUseCustomInput(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                <span className="pb-2 text-sm text-slate-700">Use custom input</span>
              </label>
            )}
          </div>

          {(useCustomInput || kind === "searching") && (
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Custom array (comma/space separated)</span>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono"
                spellCheck={false}
                placeholder="Example: 5, 1, 9, 2, 8, 3"
              />
              {kind === "searching" && (
                <p className="text-[11px] text-slate-500">
                  Binary search runs on a sorted array. The tool will sort your input before stepping.
                </p>
              )}
            </label>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={regenerate}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Generate
            </button>
            <button
              type="button"
              onClick={buildSteps}
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Build steps
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              disabled={steps.length === 0}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={stepOnce}
              disabled={steps.length === 0 || isPlaying}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Step
            </button>
            <button
              type="button"
              onClick={resetRunState}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Algorithm report snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Algorithm Visualizer
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {algorithmLabel} • step{" "}
                    <span className="font-mono text-slate-100">
                      {Math.min(stepIndex, steps.length)} / {steps.length}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? "Exporting…" : "Export PNG"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-3">
                <div className="flex h-[280px] items-end gap-1">
                  {array.map((v, idx) => {
                    const max = Math.max(...array, 1);
                    const h = (v / max) * 260;
                    const isActive = highlighted.has(idx);
                    const isPivot = currentMark?.pivot === idx;
                    const isFound = typeof currentMark?.found === "number" && currentMark.found === idx;
                    const inRange =
                      typeof currentMark?.low === "number" &&
                      typeof currentMark?.high === "number" &&
                      idx >= currentMark.low &&
                      idx <= currentMark.high;

                    const color = isFound
                      ? "bg-emerald-400"
                      : isPivot
                      ? "bg-fuchsia-400"
                      : isActive
                      ? "bg-amber-300"
                      : inRange && kind === "searching"
                      ? "bg-sky-400/60"
                      : "bg-emerald-300/70";

                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-sm ${color}`}
                        style={{ height: `${Math.max(6, h)}px` }}
                        title={`${idx}: ${v}`}
                      />
                    );
                  })}
                </div>
                {kind === "searching" && (
                  <p className="mt-2 text-[11px] text-slate-300">
                    Target: <span className="font-mono text-slate-100">{binaryTarget}</span>{" "}
                    {typeof currentMark?.mid === "number" ? (
                      <>
                        • mid:{" "}
                        <span className="font-mono text-slate-100">{currentMark.mid}</span>
                      </>
                    ) : null}
                  </p>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Comparisons
                  </p>
                  <p className="mt-2 font-mono text-lg text-slate-100">
                    {counters.comparisons.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Swaps
                  </p>
                  <p className="mt-2 font-mono text-lg text-slate-100">
                    {counters.swaps.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Writes
                  </p>
                  <p className="mt-2 font-mono text-lg text-slate-100">
                    {counters.writes.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                This is an educational visualization. Runtime depends on array size and algorithm.
              </p>
            </div>
          </ExportableImageFrame>
        </section>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;


