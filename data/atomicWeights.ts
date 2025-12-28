import { periodicElements } from "@/data/periodicElements";

export const ATOMIC_WEIGHTS: Record<string, number> = Object.fromEntries(
  periodicElements.map((el) => [el.symbol, el.atomicMass])
);

export const ELEMENT_NAMES: Record<string, string> = Object.fromEntries(
  periodicElements.map((el) => [el.symbol, el.name])
);


