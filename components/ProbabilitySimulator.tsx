"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type {
  ConvergencePoint,
  DistributionPoint,
  ProbabilityScenario,
  ProbabilityScenarioId,
  SuitId
} from "@/lib/probabilitySimulatorLogic";
import {
  buildOutcomeLabel,
  buildOutcomeRange,
  clampInt,
  simulateTrialOutcome,
  theoreticalDistribution,
  trackedOutcomeValue
} from "@/lib/probabilitySimulatorLogic";

type SimulationState =
  | { status: "idle" }
  | { status: "running"; completed: number; total: number }
  | { status: "done"; completed: number; total: number };

type StoredState = {
  scenarioId: ProbabilityScenarioId;
  trials: number;
  flipsPerTrial: number;
  trackHeads: number;
  dieSides: number;
  dieRollsPerTrial: number;
  trackSum: number;
  cardDrawsPerTrial: number;
  suit: SuitId;
  withReplacement: boolean;
  trackCount: number;
};

const STORAGE_KEY = "lht_probability_simulator_state_v1";

const TRIAL_PRESETS = [100, 1000, 10000, 100000, 1000000] as const;

const formatPercent = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(2)}%`;
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
};

const getSuitLabel = (suit: SuitId): string =>
  suit === "hearts"
    ? "Hearts"
    : suit === "diamonds"
    ? "Diamonds"
    : suit === "clubs"
    ? "Clubs"
    : "Spades";

const drawHistogram = (
  canvas: HTMLCanvasElement,
  simulated: DistributionPoint[],
  theoretical: DistributionPoint[],
  label: string
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

  const padding = { left: 44, right: 16, top: 16, bottom: 34 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const values = simulated.map((p) => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const maxProb = Math.max(
    0.000001,
    ...simulated.map((p) => p.probability),
    ...theoretical.map((p) => p.probability)
  );

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (i / 4) * plotH;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + plotW, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
  ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
  ctx.fillText(label, padding.left, 14);

  const count = simulated.length;
  const barW = count > 0 ? plotW / count : plotW;

  const yForProb = (p: number) =>
    padding.top + plotH - (p / maxProb) * plotH;

  simulated.forEach((p, i) => {
    const x = padding.left + i * barW;
    const y = yForProb(p.probability);
    const bh = padding.top + plotH - y;
    ctx.fillStyle = "rgba(52, 211, 153, 0.8)";
    ctx.fillRect(x + 1, y, Math.max(1, barW - 2), bh);
  });

  ctx.strokeStyle = "rgba(251, 146, 60, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  theoretical.forEach((p) => {
    const i = p.value - minValue;
    if (i < 0 || i >= count) return;
    const x = padding.left + i * barW + barW / 2;
    const y = yForProb(p.probability);
    ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
  ctx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI";
  ctx.fillText("0", 18, padding.top + plotH + 4);
  ctx.fillText(formatPercent(maxProb), 8, padding.top + 4);

  const tickCount = Math.min(6, count);
  for (let t = 0; t < tickCount; t += 1) {
    const i = Math.round((t / (tickCount - 1)) * (count - 1));
    const value = minValue + i;
    const x = padding.left + i * barW + barW / 2;
    ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
    ctx.fillText(String(value), x - 6, padding.top + plotH + 24);
  }
};

const drawConvergence = (
  canvas: HTMLCanvasElement,
  points: ConvergencePoint[],
  theoretical: number | null
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

  const padding = { left: 44, right: 16, top: 16, bottom: 32 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const last = points[points.length - 1];
  const maxX = last ? last.trials : 1;
  const yMax = 1;
  const yMin = 0;

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (i / 4) * plotH;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + plotW, y);
    ctx.stroke();
  }

  if (typeof theoretical === "number") {
    const y =
      padding.top +
      plotH -
      ((theoretical - yMin) / (yMax - yMin)) * plotH;
    ctx.strokeStyle = "rgba(251, 146, 60, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + plotW, y);
    ctx.stroke();
  }

  const xForTrial = (t: number) =>
    padding.left + (t / maxX) * plotW;
  const yForEstimate = (p: number) =>
    padding.top + plotH - ((p - yMin) / (yMax - yMin)) * plotH;

  ctx.strokeStyle = "rgba(52, 211, 153, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, idx) => {
    const x = xForTrial(p.trials);
    const y = yForEstimate(p.estimate);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
  ctx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI";
  ctx.fillText("0%", 12, padding.top + plotH + 4);
  ctx.fillText("100%", 6, padding.top + 4);
  ctx.fillText(String(maxX), padding.left + plotW - 22, padding.top + plotH + 24);
};

const ProbabilitySimulator = () => {
  const [scenarioId, setScenarioId] = useState<ProbabilityScenarioId>(
    "coin_heads_count"
  );
  const [trials, setTrials] = useState<number>(10000);

  const [flipsPerTrial, setFlipsPerTrial] = useState(10);
  const [trackHeads, setTrackHeads] = useState(5);

  const [dieSides, setDieSides] = useState(6);
  const [dieRollsPerTrial, setDieRollsPerTrial] = useState(2);
  const [trackSum, setTrackSum] = useState(7);

  const [cardDrawsPerTrial, setCardDrawsPerTrial] = useState(5);
  const [suit, setSuit] = useState<SuitId>("hearts");
  const [withReplacement, setWithReplacement] = useState(false);
  const [trackCount, setTrackCount] = useState(1);

  const [simulationState, setSimulationState] = useState<SimulationState>({
    status: "idle"
  });
  const [simulatedDistribution, setSimulatedDistribution] = useState<
    DistributionPoint[]
  >([]);
  const [convergence, setConvergence] = useState<ConvergencePoint[]>([]);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const histogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const convergenceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const runTokenRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.scenarioId === "string") {
        setScenarioId(parsed.scenarioId as ProbabilityScenarioId);
      }
      if (typeof parsed.trials === "number") {
        setTrials(clampInt(parsed.trials, 100, 1000000));
      }
      if (typeof parsed.flipsPerTrial === "number") {
        setFlipsPerTrial(clampInt(parsed.flipsPerTrial, 1, 200));
      }
      if (typeof parsed.trackHeads === "number") {
        setTrackHeads(clampInt(parsed.trackHeads, 0, 200));
      }
      if (typeof parsed.dieSides === "number") {
        setDieSides(clampInt(parsed.dieSides, 2, 20));
      }
      if (typeof parsed.dieRollsPerTrial === "number") {
        setDieRollsPerTrial(clampInt(parsed.dieRollsPerTrial, 1, 12));
      }
      if (typeof parsed.trackSum === "number") {
        setTrackSum(clampInt(parsed.trackSum, 2, 240));
      }
      if (typeof parsed.cardDrawsPerTrial === "number") {
        setCardDrawsPerTrial(clampInt(parsed.cardDrawsPerTrial, 1, 52));
      }
      if (parsed.suit === "hearts" || parsed.suit === "diamonds" || parsed.suit === "clubs" || parsed.suit === "spades") {
        setSuit(parsed.suit);
      }
      if (typeof parsed.withReplacement === "boolean") {
        setWithReplacement(parsed.withReplacement);
      }
      if (typeof parsed.trackCount === "number") {
        setTrackCount(clampInt(parsed.trackCount, 0, 52));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: StoredState = {
      scenarioId,
      trials,
      flipsPerTrial,
      trackHeads,
      dieSides,
      dieRollsPerTrial,
      trackSum,
      cardDrawsPerTrial,
      suit,
      withReplacement,
      trackCount
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    scenarioId,
    trials,
    flipsPerTrial,
    trackHeads,
    dieSides,
    dieRollsPerTrial,
    trackSum,
    cardDrawsPerTrial,
    suit,
    withReplacement,
    trackCount
  ]);

  const scenario: ProbabilityScenario = useMemo(() => {
    if (scenarioId === "coin_heads_count") {
      const flips = clampInt(flipsPerTrial, 1, 200);
      const tracked = clampInt(trackHeads, 0, flips);
      return { id: "coin_heads_count", flipsPerTrial: flips, trackHeads: tracked };
    }
    if (scenarioId === "two_dice_sum") {
      return { id: "two_dice_sum", trackSum: clampInt(trackSum, 2, 12) };
    }
    if (scenarioId === "dice_sum") {
      const sides = clampInt(dieSides, 2, 20);
      const rolls = clampInt(dieRollsPerTrial, 1, 12);
      const min = rolls;
      const max = rolls * sides;
      return { id: "dice_sum", sides, rollsPerTrial: rolls, trackSum: clampInt(trackSum, min, max) };
    }
    const draws = clampInt(cardDrawsPerTrial, 1, 52);
    const tracked = clampInt(trackCount, 0, draws);
    return {
      id: "cards_suit_count",
      drawsPerTrial: draws,
      suit,
      withReplacement,
      trackCount: tracked
    };
  }, [scenarioId, flipsPerTrial, trackHeads, trackSum, dieSides, dieRollsPerTrial, cardDrawsPerTrial, suit, withReplacement, trackCount]);

  const theoretical = useMemo(
    () => theoreticalDistribution(scenario),
    [scenario]
  );

  const trackedLabel = useMemo(() => buildOutcomeLabel(scenario), [scenario]);

  const theoreticalTrackedProbability = useMemo(() => {
    const value = trackedOutcomeValue(scenario);
    const point = theoretical.find((p) => p.value === value);
    return point ? point.probability : null;
  }, [theoretical, scenario]);

  useEffect(() => {
    const canvas = histogramCanvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    const range = buildOutcomeRange(scenario);
    const simulated =
      simulatedDistribution.length > 0
        ? simulatedDistribution
        : theoretical.map((p) => ({ ...p, probability: 0 }));
    drawHistogram(canvas, simulated, theoretical, range.label);
  }, [simulatedDistribution, theoretical, scenario]);

  useEffect(() => {
    const canvas = convergenceCanvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    drawConvergence(canvas, convergence, theoreticalTrackedProbability);
  }, [convergence, theoreticalTrackedProbability]);

  const runSimulation = () => {
    if (simulationState.status === "running") {
      return;
    }
    const range = buildOutcomeRange(scenario);
    const min = range.min;
    const max = range.max;
    const bins = max - min + 1;
    const counts = new Array<number>(bins).fill(0);
    const trackedValue = trackedOutcomeValue(scenario);
    let trackedHits = 0;
    let completed = 0;
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;

    setSimulatedDistribution([]);
    setConvergence([]);
    setSimulationState({ status: "running", completed: 0, total: trials });

    const maxPoints = 220;
    const stepForPoint = Math.max(1, Math.floor(trials / maxPoints));
    const convergencePoints: ConvergencePoint[] = [];

    const batchSize =
      trials >= 1000000 ? 50000 : trials >= 100000 ? 10000 : 2000;

    const tick = () => {
      if (runTokenRef.current !== token) {
        return;
      }
      const remaining = trials - completed;
      const currentBatch = Math.min(batchSize, remaining);
      for (let i = 0; i < currentBatch; i += 1) {
        const outcome = simulateTrialOutcome(scenario);
        if (outcome >= min && outcome <= max) {
          counts[outcome - min] += 1;
        }
        if (outcome === trackedValue) {
          trackedHits += 1;
        }
        completed += 1;
        if (completed % stepForPoint === 0 || completed === trials) {
          convergencePoints.push({
            trials: completed,
            estimate: trackedHits / completed
          });
        }
      }

      const partialDistribution: DistributionPoint[] = [];
      for (let v = min; v <= max; v += 1) {
        partialDistribution.push({
          value: v,
          probability: completed > 0 ? counts[v - min] / completed : 0
        });
      }
      setSimulatedDistribution(partialDistribution);
      setConvergence(convergencePoints.slice());
      setSimulationState({ status: "running", completed, total: trials });

      if (completed < trials) {
        window.requestAnimationFrame(tick);
      } else {
        setSimulationState({ status: "done", completed, total: trials });
      }
    };

    window.requestAnimationFrame(tick);
  };

  const cancelSimulation = () => {
    runTokenRef.current += 1;
    setSimulationState((prev) =>
      prev.status === "running"
        ? { status: "idle" }
        : prev
    );
  };

  const handleCopyCsv = () => {
    if (typeof window === "undefined") return;
    const values = theoretical.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const simMap = new Map(simulatedDistribution.map((p) => [p.value, p.probability]));
    const theoMap = new Map(theoretical.map((p) => [p.value, p.probability]));
    const lines: string[] = ["value,simulated_probability,theoretical_probability"];
    for (let v = min; v <= max; v += 1) {
      const s = simMap.get(v) ?? 0;
      const t = theoMap.get(v) ?? 0;
      lines.push(`${v},${s},${t}`);
    }
    const csv = lines.join("\n");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(csv)
        .then(() => setCopiedMessage("Copied CSV."))
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
      setCopiedMessage("Copied CSV.");
    }
    window.setTimeout(() => setCopiedMessage(null), 1200);
  };

  const handleDownloadCsv = () => {
    if (typeof window === "undefined") return;
    const values = theoretical.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const simMap = new Map(simulatedDistribution.map((p) => [p.value, p.probability]));
    const theoMap = new Map(theoretical.map((p) => [p.value, p.probability]));
    const lines: string[] = ["value,simulated_probability,theoretical_probability"];
    for (let v = min; v <= max; v += 1) {
      const s = simMap.get(v) ?? 0;
      const t = theoMap.get(v) ?? 0;
      lines.push(`${v},${s},${t}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `probability-simulation-${scenarioId}-${stamp}.csv`;
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
    a.download = `lifehacktoolbox-probability-simulation-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  const currentEstimate =
    convergence.length > 0 ? convergence[convergence.length - 1].estimate : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Scenario</h2>
            <p className="text-[11px] text-slate-600">
              Choose a probability scenario and run simulations to see convergence.
            </p>
          </header>

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Scenario</span>
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value as ProbabilityScenarioId)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="coin_heads_count">Coin flips: number of heads</option>
              <option value="dice_sum">Dice: sum of rolls</option>
              <option value="two_dice_sum">Two dice: sum distribution</option>
              <option value="cards_suit_count">Cards: suit count in draws</option>
            </select>
          </label>

          {scenarioId === "coin_heads_count" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Flips per trial</span>
                <input
                  type="number"
                  value={flipsPerTrial}
                  onChange={(e) => setFlipsPerTrial(clampInt(Number(e.target.value), 1, 200))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Track: exactly heads</span>
                <input
                  type="number"
                  value={trackHeads}
                  onChange={(e) => setTrackHeads(clampInt(Number(e.target.value), 0, flipsPerTrial))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
          )}

          {scenarioId === "dice_sum" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Die</span>
                <select
                  value={dieSides}
                  onChange={(e) => setDieSides(clampInt(Number(e.target.value), 2, 20))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {[4, 6, 8, 10, 12, 20].map((s) => (
                    <option key={s} value={s}>
                      d{s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Rolls per trial</span>
                <input
                  type="number"
                  value={dieRollsPerTrial}
                  onChange={(e) => setDieRollsPerTrial(clampInt(Number(e.target.value), 1, 12))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="space-y-1 text-xs text-slate-700 sm:col-span-2">
                <span className="font-medium text-slate-700">Track: sum</span>
                <input
                  type="number"
                  value={trackSum}
                  onChange={(e) => setTrackSum(clampInt(Number(e.target.value), 1, 9999))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
          )}

          {scenarioId === "two_dice_sum" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                Fixed: 2× d6
              </div>
              <label className="space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Track: sum</span>
                <input
                  type="number"
                  value={trackSum}
                  onChange={(e) => setTrackSum(clampInt(Number(e.target.value), 2, 12))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
          )}

          {scenarioId === "cards_suit_count" && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-slate-700">
                  <span className="font-medium text-slate-700">Draws per trial</span>
                  <input
                    type="number"
                    value={cardDrawsPerTrial}
                    onChange={(e) => setCardDrawsPerTrial(clampInt(Number(e.target.value), 1, 52))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-700">
                  <span className="font-medium text-slate-700">Suit</span>
                  <select
                    value={suit}
                    onChange={(e) => setSuit(e.target.value as SuitId)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="hearts">Hearts</option>
                    <option value="diamonds">Diamonds</option>
                    <option value="clubs">Clubs</option>
                    <option value="spades">Spades</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={withReplacement}
                    onChange={(e) => setWithReplacement(e.target.checked)}
                    className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                  />
                  With replacement
                </label>
                <label className="inline-flex items-center gap-2">
                  <span className="font-medium text-slate-700">Track: count</span>
                  <input
                    type="number"
                    value={trackCount}
                    onChange={(e) => setTrackCount(clampInt(Number(e.target.value), 0, cardDrawsPerTrial))}
                    className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                The theoretical line uses a hypergeometric model (without replacement) or a
                binomial approximation (with replacement).
              </p>
            </div>
          )}

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Trials</span>
            <select
              value={trials}
              onChange={(e) => setTrials(clampInt(Number(e.target.value), 100, 1000000))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {TRIAL_PRESETS.map((t) => (
                <option key={t} value={t}>
                  {t.toLocaleString()}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={runSimulation}
              disabled={simulationState.status === "running"}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {simulationState.status === "running" ? "Running…" : "Run simulation"}
            </button>
            <button
              type="button"
              onClick={cancelSimulation}
              disabled={simulationState.status !== "running"}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Stop
            </button>
            <span className="ml-auto text-[11px] text-slate-600">
              {simulationState.status === "running"
                ? `${formatNumber(simulationState.completed)} / ${formatNumber(simulationState.total)}`
                : simulationState.status === "done"
                ? `Completed ${simulationState.total.toLocaleString()} trials`
                : "Idle"}
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Privacy: everything runs locally in your browser. No inputs are uploaded.
          </p>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Probability simulation snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    {scenarioId === "coin_heads_count"
                      ? `Coin flips (${scenario.flipsPerTrial} flips)`
                      : scenarioId === "dice_sum"
                      ? `Dice sum (${scenario.rollsPerTrial}× d${scenario.sides})`
                      : scenarioId === "two_dice_sum"
                      ? "Two dice sum (2× d6)"
                      : `Cards: ${getSuitLabel(suit)} in ${scenario.drawsPerTrial} draws`}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Tracked outcome:{" "}
                    <span className="font-mono text-emerald-300">{trackedLabel}</span>
                  </p>
                </div>
                <div className="text-[11px] text-slate-300">
                  Trials:{" "}
                  <span className="font-mono text-slate-100">
                    {simulationState.status === "running"
                      ? simulationState.completed.toLocaleString()
                      : simulationState.status === "done"
                      ? simulationState.total.toLocaleString()
                      : "0"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
                  <canvas ref={histogramCanvasRef} className="h-[260px] w-full" />
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
                  <canvas ref={convergenceCanvasRef} className="h-[260px] w-full" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Theoretical
                  </p>
                  <p className="mt-2 font-mono text-lg text-slate-100">
                    {typeof theoreticalTrackedProbability === "number"
                      ? formatPercent(theoreticalTrackedProbability)
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Simulated
                  </p>
                  <p className="mt-2 font-mono text-lg text-slate-100">
                    {typeof currentEstimate === "number"
                      ? formatPercent(currentEstimate)
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Difference
                  </p>
                  <p className="mt-2 font-mono text-lg text-slate-100">
                    {typeof currentEstimate === "number" &&
                    typeof theoreticalTrackedProbability === "number"
                      ? formatPercent(currentEstimate - theoreticalTrackedProbability)
                      : "—"}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Green bars show simulated frequencies. Orange line shows theoretical
                probabilities when available.
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
              onClick={handleDownloadCsv}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={handleCopyCsv}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Copy CSV
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

export default ProbabilitySimulator;


