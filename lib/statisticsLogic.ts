export type NumericSummary = {
  count: number;
  min: number;
  max: number;
  range: number;
  mean: number;
  median: number;
  modes: number[];
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  outlierLowThreshold: number;
  outlierHighThreshold: number;
  outliers: number[];
};

export type HistogramBin = {
  start: number;
  end: number;
  count: number;
};

export const clampInt = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  const rounded = Math.round(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
};

export const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000000 || (abs > 0 && abs < 0.0001)) {
    return value.toExponential(4);
  }
  return value.toFixed(6).replace(/\.?0+$/, "");
};

export const parseNumbersFromText = (text: string): number[] => {
  const raw = text.trim();
  if (!raw) return [];
  const normalized = raw.replace(/\r\n/g, "\n");
  const pieces = normalized.split(/[\s,]+/g);
  const out: number[] = [];
  pieces.forEach((p) => {
    const trimmed = p.trim();
    if (!trimmed) return;
    const value = Number(trimmed.replace(/,/g, ""));
    if (Number.isFinite(value)) {
      out.push(value);
    }
  });
  return out;
};

const quantile = (sorted: number[], q: number): number => {
  if (sorted.length === 0) return Number.NaN;
  const qq = Math.max(0, Math.min(1, q));
  const idx = (sorted.length - 1) * qq;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const t = idx - lo;
  return sorted[lo] * (1 - t) + sorted[hi] * t;
};

export const computeSummary = (values: number[]): NumericSummary | null => {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (filtered.length === 0) return null;
  const sorted = [...filtered].sort((a, b) => a - b);
  const count = sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;
  const mean = sorted.reduce((s, v) => s + v, 0) / count;
  const median = quantile(sorted, 0.5);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const outlierLowThreshold = q1 - 1.5 * iqr;
  const outlierHighThreshold = q3 + 1.5 * iqr;
  const outliers = sorted.filter(
    (v) => v < outlierLowThreshold || v > outlierHighThreshold
  );

  const variance =
    sorted.reduce((s, v) => s + (v - mean) * (v - mean), 0) / count;
  const stdDev = Math.sqrt(variance);

  const freq = new Map<string, { value: number; count: number }>();
  sorted.forEach((v) => {
    const key = v.toFixed(12);
    const item = freq.get(key);
    if (item) {
      item.count += 1;
    } else {
      freq.set(key, { value: v, count: 1 });
    }
  });
  const maxCount = Math.max(...Array.from(freq.values()).map((f) => f.count));
  const modes =
    maxCount <= 1
      ? []
      : Array.from(freq.values())
          .filter((f) => f.count === maxCount)
          .slice(0, 5)
          .map((f) => f.value);

  return {
    count,
    min,
    max,
    range,
    mean,
    median,
    modes,
    variance,
    stdDev,
    q1,
    q3,
    iqr,
    outlierLowThreshold,
    outlierHighThreshold,
    outliers
  };
};

export const buildHistogram = (
  values: number[],
  binCount: number
): HistogramBin[] => {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (filtered.length === 0) return [];
  const bins = clampInt(binCount, 3, 60);
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  if (min === max) {
    return [
      {
        start: min,
        end: max,
        count: filtered.length
      }
    ];
  }
  const width = (max - min) / bins;
  const out: HistogramBin[] = [];
  for (let i = 0; i < bins; i += 1) {
    out.push({ start: min + i * width, end: min + (i + 1) * width, count: 0 });
  }
  filtered.forEach((v) => {
    const idx =
      v === max ? bins - 1 : Math.max(0, Math.min(bins - 1, Math.floor((v - min) / width)));
    out[idx].count += 1;
  });
  return out;
};

export type ParsedCsv = {
  headers: string[];
  rows: string[][];
};

const detectDelimiter = (line: string): string => {
  const candidates = [",", "\t", ";"];
  let best = ",";
  let bestCount = -1;
  candidates.forEach((d) => {
    const count = line.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  });
  return best;
};

const parseCsvLine = (line: string, delimiter: string): string[] => {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((s) => s.trim());
};

export const parseCsv = (text: string): ParsedCsv | null => {
  const raw = text.trim();
  if (!raw) return null;
  const lines = raw.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return null;
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i], delimiter);
    rows.push(row);
  }
  return { headers, rows };
};

export const extractNumericColumn = (
  csv: ParsedCsv,
  columnIndex: number
): number[] => {
  const idx = clampInt(columnIndex, 0, Math.max(0, csv.headers.length - 1));
  const out: number[] = [];
  csv.rows.forEach((row) => {
    const raw = row[idx] ?? "";
    const value = Number(String(raw).trim().replace(/,/g, ""));
    if (Number.isFinite(value)) {
      out.push(value);
    }
  });
  return out;
};


