export type ProbabilityScenarioId =
  | "coin_heads_count"
  | "dice_sum"
  | "two_dice_sum"
  | "cards_suit_count";

export type SuitId = "hearts" | "diamonds" | "clubs" | "spades";

export type DistributionPoint = {
  value: number;
  probability: number;
};

export type ConvergencePoint = {
  trials: number;
  estimate: number;
};

export type CoinHeadsScenario = {
  id: "coin_heads_count";
  flipsPerTrial: number;
  trackHeads: number;
};

export type DiceSumScenario = {
  id: "dice_sum";
  sides: number;
  rollsPerTrial: number;
  trackSum: number;
};

export type TwoDiceSumScenario = {
  id: "two_dice_sum";
  trackSum: number;
};

export type CardsSuitCountScenario = {
  id: "cards_suit_count";
  drawsPerTrial: number;
  suit: SuitId;
  withReplacement: boolean;
  trackCount: number;
};

export type ProbabilityScenario =
  | CoinHeadsScenario
  | DiceSumScenario
  | TwoDiceSumScenario
  | CardsSuitCountScenario;

export const clampInt = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  const rounded = Math.round(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
};

export const clamp01 = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const factorialRatio = (n: number, k: number): number => {
  let out = 1;
  for (let i = k + 1; i <= n; i += 1) {
    out *= i;
  }
  return out;
};

export const binomialPmf = (n: number, k: number, p: number): number => {
  const nn = clampInt(n, 0, 1000);
  const kk = clampInt(k, 0, nn);
  const pp = clamp01(p);
  if (kk < 0 || kk > nn) return 0;
  if (pp === 0) return kk === 0 ? 1 : 0;
  if (pp === 1) return kk === nn ? 1 : 0;
  const choose =
    factorialRatio(nn, Math.max(kk, nn - kk)) /
    factorialRatio(Math.min(kk, nn - kk), 0);
  return choose * pp ** kk * (1 - pp) ** (nn - kk);
};

const logFactorial = (n: number): number => {
  let sum = 0;
  for (let i = 2; i <= n; i += 1) {
    sum += Math.log(i);
  }
  return sum;
};

const logChoose = (n: number, k: number): number => {
  if (k < 0 || k > n) return Number.NEGATIVE_INFINITY;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
};

export const hypergeometricPmf = (
  populationSize: number,
  successInPopulation: number,
  draws: number,
  successes: number
): number => {
  const N = clampInt(populationSize, 1, 1000000);
  const K = clampInt(successInPopulation, 0, N);
  const n = clampInt(draws, 0, N);
  const k = clampInt(successes, 0, n);
  const minK = Math.max(0, n - (N - K));
  const maxK = Math.min(n, K);
  if (k < minK || k > maxK) return 0;
  const logP =
    logChoose(K, k) + logChoose(N - K, n - k) - logChoose(N, n);
  return Math.exp(logP);
};

const convolve = (a: number[], b: number[]): number[] => {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      out[i + j] += a[i] * b[j];
    }
  }
  return out;
};

export const theoreticalDistribution = (
  scenario: ProbabilityScenario
): DistributionPoint[] => {
  if (scenario.id === "coin_heads_count") {
    const n = clampInt(scenario.flipsPerTrial, 1, 200);
    const points: DistributionPoint[] = [];
    for (let k = 0; k <= n; k += 1) {
      points.push({ value: k, probability: binomialPmf(n, k, 0.5) });
    }
    return points;
  }

  if (scenario.id === "two_dice_sum") {
    const die = new Array(6).fill(1 / 6);
    const sum = convolve(die, die);
    const points: DistributionPoint[] = [];
    for (let i = 0; i < sum.length; i += 1) {
      points.push({ value: i + 2, probability: sum[i] });
    }
    return points;
  }

  if (scenario.id === "dice_sum") {
    const sides = clampInt(scenario.sides, 2, 100);
    const rolls = clampInt(scenario.rollsPerTrial, 1, 12);
    const die = new Array(sides).fill(1 / sides);
    let dist = die;
    for (let i = 2; i <= rolls; i += 1) {
      dist = convolve(dist, die);
    }
    const min = rolls;
    const points: DistributionPoint[] = [];
    for (let i = 0; i < dist.length; i += 1) {
      points.push({ value: min + i, probability: dist[i] });
    }
    return points;
  }

  const draws = clampInt(scenario.drawsPerTrial, 1, 52);
  const points: DistributionPoint[] = [];
  for (let k = 0; k <= draws; k += 1) {
    const probability = scenario.withReplacement
      ? binomialPmf(draws, k, 0.25)
      : hypergeometricPmf(52, 13, draws, k);
    points.push({ value: k, probability });
  }
  return points;
};

export const simulateTrialOutcome = (scenario: ProbabilityScenario): number => {
  if (scenario.id === "coin_heads_count") {
    const n = clampInt(scenario.flipsPerTrial, 1, 2000);
    let heads = 0;
    for (let i = 0; i < n; i += 1) {
      if (Math.random() < 0.5) {
        heads += 1;
      }
    }
    return heads;
  }

  if (scenario.id === "two_dice_sum") {
    const roll = () => 1 + Math.floor(Math.random() * 6);
    return roll() + roll();
  }

  if (scenario.id === "dice_sum") {
    const sides = clampInt(scenario.sides, 2, 100);
    const rolls = clampInt(scenario.rollsPerTrial, 1, 1000);
    let sum = 0;
    for (let i = 0; i < rolls; i += 1) {
      sum += 1 + Math.floor(Math.random() * sides);
    }
    return sum;
  }

  const draws = clampInt(scenario.drawsPerTrial, 1, 52);
  if (scenario.withReplacement) {
    let count = 0;
    for (let i = 0; i < draws; i += 1) {
      if (Math.random() < 0.25) {
        count += 1;
      }
    }
    return count;
  }

  const deck: number[] = new Array(52).fill(0);
  for (let i = 0; i < 13; i += 1) {
    deck[i] = 1;
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  let count = 0;
  for (let i = 0; i < draws; i += 1) {
    count += deck[i];
  }
  return count;
};

export const buildOutcomeRange = (
  scenario: ProbabilityScenario
): { min: number; max: number; label: string } => {
  if (scenario.id === "coin_heads_count") {
    const n = clampInt(scenario.flipsPerTrial, 1, 200);
    return { min: 0, max: n, label: "Number of heads" };
  }
  if (scenario.id === "two_dice_sum") {
    return { min: 2, max: 12, label: "Sum" };
  }
  if (scenario.id === "dice_sum") {
    const sides = clampInt(scenario.sides, 2, 100);
    const rolls = clampInt(scenario.rollsPerTrial, 1, 12);
    return { min: rolls, max: rolls * sides, label: "Sum" };
  }
  const draws = clampInt(scenario.drawsPerTrial, 1, 52);
  return { min: 0, max: draws, label: "Count in hand" };
};

export const buildOutcomeLabel = (scenario: ProbabilityScenario): string => {
  if (scenario.id === "coin_heads_count") {
    return `Exactly ${scenario.trackHeads} heads`;
  }
  if (scenario.id === "two_dice_sum") {
    return `Sum = ${scenario.trackSum}`;
  }
  if (scenario.id === "dice_sum") {
    return `Sum = ${scenario.trackSum}`;
  }
  const suitLabel =
    scenario.suit === "hearts"
      ? "Hearts"
      : scenario.suit === "diamonds"
      ? "Diamonds"
      : scenario.suit === "clubs"
      ? "Clubs"
      : "Spades";
  return `Exactly ${scenario.trackCount} ${suitLabel}`;
};

export const trackedOutcomeValue = (scenario: ProbabilityScenario): number => {
  if (scenario.id === "coin_heads_count") return scenario.trackHeads;
  if (scenario.id === "cards_suit_count") return scenario.trackCount;
  return scenario.trackSum;
};


