import type { UniverseObject } from "@/data/scaleOfUniverse";
import { UNIVERSE_OBJECTS_SORTED } from "@/data/scaleOfUniverse";

export const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
};

export const log10 = (value: number): number => Math.log(value) / Math.log(10);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const smoothstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export type ScaleRange = { minLog: number; maxLog: number };

export const universeScaleRange = (): ScaleRange => {
  const min = UNIVERSE_OBJECTS_SORTED[0]?.diameterMeters ?? 1e-15;
  const max = UNIVERSE_OBJECTS_SORTED[UNIVERSE_OBJECTS_SORTED.length - 1]?.diameterMeters ?? 1e26;
  return { minLog: log10(min), maxLog: log10(max) };
};

export const zoomToDiameterMeters = (zoom01: number): number => {
  const { minLog, maxLog } = universeScaleRange();
  const t = clamp01(zoom01);
  const l = lerp(minLog, maxLog, t);
  return 10 ** l;
};

export const diameterMetersToZoom = (diameter: number): number => {
  const { minLog, maxLog } = universeScaleRange();
  const l = log10(Math.max(1e-30, diameter));
  return clamp01((l - minLog) / (maxLog - minLog));
};

export const findClosestObject = (diameterMeters: number): UniverseObject => {
  const d = Math.max(1e-30, diameterMeters);
  let best = UNIVERSE_OBJECTS_SORTED[0];
  let bestDist = Math.abs(log10(best.diameterMeters) - log10(d));
  for (const o of UNIVERSE_OBJECTS_SORTED) {
    const dist = Math.abs(log10(o.diameterMeters) - log10(d));
    if (dist < bestDist) {
      best = o;
      bestDist = dist;
    }
  }
  return best;
};

export const formatMetricLength = (meters: number): string => {
  const m = Math.abs(meters);
  if (!Number.isFinite(meters)) return "—";
  if (m >= 1e9) return `${(meters / 1e9).toFixed(3).replace(/\.?0+$/, "")} Gm`;
  if (m >= 1e6) return `${(meters / 1e6).toFixed(3).replace(/\.?0+$/, "")} Mm`;
  if (m >= 1e3) return `${(meters / 1e3).toFixed(3).replace(/\.?0+$/, "")} km`;
  if (m >= 1) return `${meters.toFixed(3).replace(/\.?0+$/, "")} m`;
  if (m >= 1e-3) return `${(meters * 1e3).toFixed(3).replace(/\.?0+$/, "")} mm`;
  if (m >= 1e-6) return `${(meters * 1e6).toFixed(3).replace(/\.?0+$/, "")} µm`;
  if (m >= 1e-9) return `${(meters * 1e9).toFixed(3).replace(/\.?0+$/, "")} nm`;
  if (m >= 1e-12) return `${(meters * 1e12).toFixed(3).replace(/\.?0+$/, "")} pm`;
  return `${(meters * 1e15).toFixed(3).replace(/\.?0+$/, "")} fm`;
};

export const formatAstronomyLength = (meters: number): string => {
  const AU = 1.495978707e11;
  const LY = 9.460730472e15;
  const m = Math.abs(meters);
  if (!Number.isFinite(meters)) return "—";
  if (m >= 1e9 * LY) return `${(meters / (1e9 * LY)).toFixed(3).replace(/\.?0+$/, "")} Gly`;
  if (m >= 1e6 * LY) return `${(meters / (1e6 * LY)).toFixed(3).replace(/\.?0+$/, "")} Mly`;
  if (m >= 1e3 * LY) return `${(meters / (1e3 * LY)).toFixed(3).replace(/\.?0+$/, "")} kly`;
  if (m >= LY) return `${(meters / LY).toFixed(3).replace(/\.?0+$/, "")} ly`;
  if (m >= AU) return `${(meters / AU).toFixed(3).replace(/\.?0+$/, "")} AU`;
  return formatMetricLength(meters);
};

export const buildComparisonText = (
  selected: UniverseObject,
  reference: UniverseObject
): string => {
  const ratio = selected.diameterMeters / reference.diameterMeters;
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return "—";
  }
  const abs = Math.abs(ratio);
  const fmt =
    abs >= 1000 || abs < 0.01
      ? ratio.toExponential(2)
      : ratio.toFixed(2).replace(/\.?0+$/, "");
  if (ratio >= 1) {
    return `${fmt}× bigger than ${reference.name}`;
  }
  const inv = 1 / ratio;
  const invFmt =
    inv >= 1000 || inv < 0.01
      ? inv.toExponential(2)
      : inv.toFixed(2).replace(/\.?0+$/, "");
  return `${invFmt}× smaller than ${reference.name}`;
};


