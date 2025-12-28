import { ATOMIC_WEIGHTS, ELEMENT_NAMES } from "@/data/atomicWeights";

export type FormulaParseError = {
  message: string;
  index: number;
};

export type FormulaParseResult =
  | { ok: true; elementCounts: Record<string, number> }
  | { ok: false; error: FormulaParseError };

export type MolarMassBreakdownRow = {
  symbol: string;
  name: string;
  atomicWeight: number;
  count: number;
  massContribution: number;
  percent: number;
};

export type MolarMassResult =
  | {
      ok: true;
      formula: string;
      totalMolarMass: number;
      breakdown: MolarMassBreakdownRow[];
    }
  | { ok: false; formula: string; error: FormulaParseError };

type GroupResult = { counts: Record<string, number>; index: number };

const isUpper = (ch: string): boolean => ch >= "A" && ch <= "Z";
const isLower = (ch: string): boolean => ch >= "a" && ch <= "z";
const isDigit = (ch: string): boolean => ch >= "0" && ch <= "9";

const isOpenBracket = (ch: string): ch is "(" | "[" | "{" =>
  ch === "(" || ch === "[" || ch === "{";

const isCloseBracket = (ch: string): ch is ")" | "]" | "}" =>
  ch === ")" || ch === "]" || ch === "}";

const matchingClose = (open: "(" | "[" | "{"): ")" | "]" | "}" =>
  open === "(" ? ")" : open === "[" ? "]" : "}";

const mergeCounts = (
  target: Record<string, number>,
  add: Record<string, number>,
  multiplier: number
) => {
  Object.entries(add).forEach(([symbol, count]) => {
    const existing = target[symbol] ?? 0;
    target[symbol] = existing + count * multiplier;
  });
};

const parseInteger = (input: string, startIndex: number): { value: number; index: number } => {
  let index = startIndex;
  let hasDigits = false;
  let value = 0;
  while (index < input.length && isDigit(input[index])) {
    hasDigits = true;
    value = value * 10 + Number(input[index]);
    index += 1;
  }
  if (!hasDigits) {
    return { value: 1, index: startIndex };
  }
  return { value: value <= 0 ? 1 : value, index };
};

const parseElementSymbol = (input: string, startIndex: number): { symbol: string; index: number } | null => {
  const first = input[startIndex];
  if (!isUpper(first)) {
    return null;
  }
  let symbol = first;
  let index = startIndex + 1;
  if (index < input.length && isLower(input[index])) {
    symbol += input[index];
    index += 1;
  }
  return { symbol, index };
};

const parseGroup = (
  input: string,
  startIndex: number,
  stopAt: ")" | "]" | "}" | null
): FormulaParseResult | GroupResult => {
  const counts: Record<string, number> = {};
  let index = startIndex;

  while (index < input.length) {
    const ch = input[index];
    if (ch === " " || ch === "\n" || ch === "\t" || ch === "\r") {
      index += 1;
      continue;
    }

    if (stopAt && ch === stopAt) {
      return { counts, index: index + 1 };
    }

    if (isOpenBracket(ch)) {
      const close = matchingClose(ch);
      const inner = parseGroup(input, index + 1, close);
      if ("ok" in inner && inner.ok === false) {
        return inner;
      }
      const group = inner as GroupResult;
      index = group.index;
      const multParsed = parseInteger(input, index);
      index = multParsed.index;
      mergeCounts(counts, group.counts, multParsed.value);
      continue;
    }

    if (isCloseBracket(ch)) {
      return {
        ok: false,
        error: { message: `Unexpected "${ch}".`, index }
      };
    }

    const symbolParsed = parseElementSymbol(input, index);
    if (symbolParsed) {
      index = symbolParsed.index;
      const multParsed = parseInteger(input, index);
      index = multParsed.index;
      counts[symbolParsed.symbol] =
        (counts[symbolParsed.symbol] ?? 0) + multParsed.value;
      continue;
    }

    return {
      ok: false,
      error: { message: `Unexpected character "${ch}".`, index }
    };
  }

  if (stopAt) {
    return {
      ok: false,
      error: { message: `Missing closing "${stopAt}".`, index: input.length }
    };
  }

  return { counts, index };
};

export const parseChemicalFormula = (formula: string): FormulaParseResult => {
  const trimmed = formula.trim();
  if (!trimmed) {
    return { ok: false, error: { message: "Enter a chemical formula.", index: 0 } };
  }
  const grouped = parseGroup(trimmed, 0, null);
  if ("ok" in grouped && grouped.ok === false) {
    return grouped;
  }
  const result = grouped as GroupResult;
  if (result.index < trimmed.length) {
    return {
      ok: false,
      error: { message: "Unexpected trailing characters.", index: result.index }
    };
  }

  const unknown = Object.keys(result.counts).find((s) => !(s in ATOMIC_WEIGHTS));
  if (unknown) {
    return {
      ok: false,
      error: { message: `Unknown element symbol "${unknown}".`, index: 0 }
    };
  }

  return { ok: true, elementCounts: result.counts };
};

export const computeMolarMass = (formula: string): MolarMassResult => {
  const parsed = parseChemicalFormula(formula);
  if (!parsed.ok) {
    return { ok: false, formula, error: parsed.error };
  }
  const counts = parsed.elementCounts;
  let total = 0;
  const rows: Omit<MolarMassBreakdownRow, "percent">[] = [];
  Object.entries(counts).forEach(([symbol, count]) => {
    const atomicWeight = ATOMIC_WEIGHTS[symbol];
    const name = ELEMENT_NAMES[symbol] ?? symbol;
    const massContribution = atomicWeight * count;
    total += massContribution;
    rows.push({ symbol, name, atomicWeight, count, massContribution });
  });
  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, formula, error: { message: "Could not compute molar mass.", index: 0 } };
  }
  const breakdown: MolarMassBreakdownRow[] = rows
    .map((r) => ({ ...r, percent: (r.massContribution / total) * 100 }))
    .sort((a, b) => b.massContribution - a.massContribution);
  return { ok: true, formula, totalMolarMass: total, breakdown };
};

export const breakdownToCsv = (result: MolarMassResult): string => {
  if (!result.ok) return "";
  const lines: string[] = [
    "symbol,name,atomic_weight,count,mass_contribution_g_per_mol,percent"
  ];
  result.breakdown.forEach((row) => {
    lines.push(
      [
        row.symbol,
        `"${row.name.replaceAll('"', '""')}"`,
        row.atomicWeight,
        row.count,
        row.massContribution,
        row.percent
      ].join(",")
    );
  });
  lines.push(`total,,,,${result.totalMolarMass},100`);
  return lines.join("\n");
};


