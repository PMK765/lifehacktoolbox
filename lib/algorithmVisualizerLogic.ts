export type ArrayPattern = "random" | "nearly_sorted" | "reversed";

export type SortingAlgorithmId =
  | "bubble_sort"
  | "selection_sort"
  | "insertion_sort"
  | "merge_sort"
  | "quick_sort";

export type SearchingAlgorithmId = "binary_search";

export type AlgorithmKind = "sorting" | "searching";

export type AlgorithmId = SortingAlgorithmId | SearchingAlgorithmId;

export type Step =
  | { type: "compare"; i: number; j: number }
  | { type: "swap"; i: number; j: number }
  | { type: "set"; i: number; value: number }
  | { type: "mark"; active: number[]; pivot?: number; low?: number; high?: number; mid?: number; found?: number | null }
  | { type: "done" };

export type StepCounters = {
  comparisons: number;
  swaps: number;
  writes: number;
};

export const clampInt = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  const rounded = Math.round(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
};

export const parseCustomArray = (text: string): number[] => {
  const raw = text.trim();
  if (!raw) return [];
  const parts = raw.split(/[\s,]+/g);
  const out: number[] = [];
  parts.forEach((p) => {
    const v = Number(p.trim());
    if (Number.isFinite(v)) out.push(v);
  });
  return out;
};

export const generateArray = (
  size: number,
  pattern: ArrayPattern
): number[] => {
  const n = clampInt(size, 5, 140);
  const base = new Array<number>(n).fill(0).map((_, i) => i + 1);
  if (pattern === "reversed") {
    return base.reverse();
  }
  if (pattern === "nearly_sorted") {
    const arr = [...base];
    const swaps = Math.max(1, Math.floor(n * 0.08));
    for (let s = 0; s < swaps; s += 1) {
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
  const arr = [...base];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

const pushCompare = (steps: Step[], counters: StepCounters, i: number, j: number) => {
  steps.push({ type: "compare", i, j });
  counters.comparisons += 1;
};

const pushSwap = (steps: Step[], counters: StepCounters, i: number, j: number) => {
  steps.push({ type: "swap", i, j });
  counters.swaps += 1;
  counters.writes += 2;
};

const pushSet = (steps: Step[], counters: StepCounters, i: number, value: number) => {
  steps.push({ type: "set", i, value });
  counters.writes += 1;
};

export const buildBubbleSortSteps = (input: number[]): { steps: Step[]; counters: StepCounters } => {
  const arr = [...input];
  const steps: Step[] = [];
  const counters: StepCounters = { comparisons: 0, swaps: 0, writes: 0 };
  const n = arr.length;
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n - i - 1; j += 1) {
      steps.push({ type: "mark", active: [j, j + 1] });
      pushCompare(steps, counters, j, j + 1);
      if (arr[j] > arr[j + 1]) {
        pushSwap(steps, counters, j, j + 1);
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  steps.push({ type: "done" });
  return { steps, counters };
};

export const buildSelectionSortSteps = (input: number[]): { steps: Step[]; counters: StepCounters } => {
  const arr = [...input];
  const steps: Step[] = [];
  const counters: StepCounters = { comparisons: 0, swaps: 0, writes: 0 };
  const n = arr.length;
  for (let i = 0; i < n; i += 1) {
    let minIdx = i;
    steps.push({ type: "mark", active: [i], pivot: minIdx });
    for (let j = i + 1; j < n; j += 1) {
      steps.push({ type: "mark", active: [minIdx, j], pivot: minIdx });
      pushCompare(steps, counters, minIdx, j);
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      pushSwap(steps, counters, i, minIdx);
      const tmp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = tmp;
    }
  }
  steps.push({ type: "done" });
  return { steps, counters };
};

export const buildInsertionSortSteps = (input: number[]): { steps: Step[]; counters: StepCounters } => {
  const arr = [...input];
  const steps: Step[] = [];
  const counters: StepCounters = { comparisons: 0, swaps: 0, writes: 0 };
  for (let i = 1; i < arr.length; i += 1) {
    const key = arr[i];
    let j = i - 1;
    steps.push({ type: "mark", active: [i] });
    while (j >= 0) {
      steps.push({ type: "mark", active: [j, j + 1] });
      pushCompare(steps, counters, j, i);
      if (arr[j] <= key) break;
      pushSet(steps, counters, j + 1, arr[j]);
      arr[j + 1] = arr[j];
      j -= 1;
    }
    pushSet(steps, counters, j + 1, key);
    arr[j + 1] = key;
  }
  steps.push({ type: "done" });
  return { steps, counters };
};

export const buildMergeSortSteps = (input: number[]): { steps: Step[]; counters: StepCounters } => {
  const arr = [...input];
  const steps: Step[] = [];
  const counters: StepCounters = { comparisons: 0, swaps: 0, writes: 0 };

  const merge = (lo: number, mid: number, hi: number) => {
    const left = arr.slice(lo, mid);
    const right = arr.slice(mid, hi);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      steps.push({ type: "mark", active: [k], low: lo, high: hi - 1, mid });
      counters.comparisons += 1;
      if (left[i] <= right[j]) {
        pushSet(steps, counters, k, left[i]);
        arr[k] = left[i];
        i += 1;
      } else {
        pushSet(steps, counters, k, right[j]);
        arr[k] = right[j];
        j += 1;
      }
      k += 1;
    }
    while (i < left.length) {
      steps.push({ type: "mark", active: [k], low: lo, high: hi - 1, mid });
      pushSet(steps, counters, k, left[i]);
      arr[k] = left[i];
      i += 1;
      k += 1;
    }
    while (j < right.length) {
      steps.push({ type: "mark", active: [k], low: lo, high: hi - 1, mid });
      pushSet(steps, counters, k, right[j]);
      arr[k] = right[j];
      j += 1;
      k += 1;
    }
  };

  const sort = (lo: number, hi: number) => {
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid, hi);
    merge(lo, mid, hi);
  };

  sort(0, arr.length);
  steps.push({ type: "done" });
  return { steps, counters };
};

export const buildQuickSortSteps = (input: number[]): { steps: Step[]; counters: StepCounters } => {
  const arr = [...input];
  const steps: Step[] = [];
  const counters: StepCounters = { comparisons: 0, swaps: 0, writes: 0 };

  const partition = (lo: number, hi: number): number => {
    const pivotIndex = hi;
    const pivotValue = arr[pivotIndex];
    let store = lo;
    for (let i = lo; i < hi; i += 1) {
      steps.push({ type: "mark", active: [i, store], pivot: pivotIndex, low: lo, high: hi });
      pushCompare(steps, counters, i, pivotIndex);
      if (arr[i] < pivotValue) {
        if (i !== store) {
          pushSwap(steps, counters, i, store);
          const tmp = arr[i];
          arr[i] = arr[store];
          arr[store] = tmp;
        }
        store += 1;
      }
    }
    if (store !== pivotIndex) {
      pushSwap(steps, counters, store, pivotIndex);
      const tmp = arr[store];
      arr[store] = arr[pivotIndex];
      arr[pivotIndex] = tmp;
    }
    return store;
  };

  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    if (p > lo) sort(lo, p - 1);
    if (p < hi) sort(p + 1, hi);
  };

  if (arr.length > 0) {
    sort(0, arr.length - 1);
  }
  steps.push({ type: "done" });
  return { steps, counters };
};

export const buildBinarySearchSteps = (
  input: number[],
  target: number
): { steps: Step[]; foundIndex: number | null; counters: StepCounters } => {
  const arr = [...input].sort((a, b) => a - b);
  const steps: Step[] = [];
  const counters: StepCounters = { comparisons: 0, swaps: 0, writes: 0 };
  let low = 0;
  let high = arr.length - 1;
  let found: number | null = null;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ type: "mark", active: [], low, high, mid, found: null });
    counters.comparisons += 1;
    if (arr[mid] === target) {
      found = mid;
      steps.push({ type: "mark", active: [mid], low, high, mid, found: mid });
      break;
    }
    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  steps.push({ type: "done" });
  return { steps, foundIndex: found, counters };
};

export const buildStepsForAlgorithm = (
  algorithm: AlgorithmId,
  array: number[],
  binarySearchTarget: number | null
): { steps: Step[]; counters: StepCounters; finalArray: number[]; foundIndex?: number | null } => {
  if (algorithm === "bubble_sort") {
    const built = buildBubbleSortSteps(array);
    return { ...built, finalArray: [...array].sort((a, b) => a - b) };
  }
  if (algorithm === "selection_sort") {
    const built = buildSelectionSortSteps(array);
    return { ...built, finalArray: [...array].sort((a, b) => a - b) };
  }
  if (algorithm === "insertion_sort") {
    const built = buildInsertionSortSteps(array);
    return { ...built, finalArray: [...array].sort((a, b) => a - b) };
  }
  if (algorithm === "merge_sort") {
    const built = buildMergeSortSteps(array);
    return { ...built, finalArray: [...array].sort((a, b) => a - b) };
  }
  if (algorithm === "quick_sort") {
    const built = buildQuickSortSteps(array);
    return { ...built, finalArray: [...array].sort((a, b) => a - b) };
  }
  const target = typeof binarySearchTarget === "number" && Number.isFinite(binarySearchTarget) ? binarySearchTarget : 0;
  const built = buildBinarySearchSteps(array, target);
  return { steps: built.steps, counters: built.counters, finalArray: [...array].sort((a, b) => a - b), foundIndex: built.foundIndex };
};


