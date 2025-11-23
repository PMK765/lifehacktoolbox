"use client";

import { useEffect, useMemo, useState } from "react";

type FreezerCategory =
  | "Meat & Poultry"
  | "Seafood"
  | "Bread & Baked Goods"
  | "Fruits & Vegetables"
  | "Dairy"
  | "Prepared Meals"
  | "Other";

type FreezerFood = {
  id: string;
  name: string;
  category: FreezerCategory;
  recommendedMonths: number;
  notes?: string;
};

type FreezerType = "standard" | "deep" | "fridgeFreezer";

type FreezeCheckHistoryItem = {
  id: string;
  timestamp: string;
  foodName: string;
  freezerType: FreezerType;
  frozenOn: string;
  bestBy: string;
  daysInFreezer: number;
  daysRemaining: number;
};

type HowLongToFreezeState = {
  category: FreezerCategory;
  foodId: string;
  useCustom: boolean;
  customName: string;
  customMonthsInput: string;
  freezerType: FreezerType;
  frozenOnInput: string;
};

type FreezeResult = {
  foodName: string;
  freezerType: FreezerType;
  frozenOn: string;
  bestBy: string;
  daysInFreezer: number;
  daysRemaining: number;
  adjustedMonths: number;
};

const foods: FreezerFood[] = [
  {
    id: "chicken-breasts",
    name: "Chicken breasts (boneless)",
    category: "Meat & Poultry",
    recommendedMonths: 9
  },
  {
    id: "whole-chicken",
    name: "Whole chicken",
    category: "Meat & Poultry",
    recommendedMonths: 12
  },
  {
    id: "ground-beef",
    name: "Ground beef",
    category: "Meat & Poultry",
    recommendedMonths: 4
  },
  {
    id: "steaks",
    name: "Steaks",
    category: "Meat & Poultry",
    recommendedMonths: 12
  },
  {
    id: "pork-chops",
    name: "Pork chops",
    category: "Meat & Poultry",
    recommendedMonths: 6
  },
  {
    id: "bacon",
    name: "Bacon",
    category: "Meat & Poultry",
    recommendedMonths: 1
  },
  {
    id: "sausage",
    name: "Sausage (fresh or smoked)",
    category: "Meat & Poultry",
    recommendedMonths: 2
  },
  {
    id: "salmon",
    name: "Fatty fish (salmon)",
    category: "Seafood",
    recommendedMonths: 3
  },
  {
    id: "lean-fish",
    name: "Lean fish (cod, tilapia)",
    category: "Seafood",
    recommendedMonths: 6
  },
  {
    id: "shrimp",
    name: "Shrimp",
    category: "Seafood",
    recommendedMonths: 9
  },
  {
    id: "sandwich-bread",
    name: "Sandwich bread",
    category: "Bread & Baked Goods",
    recommendedMonths: 3
  },
  {
    id: "dinner-rolls",
    name: "Dinner rolls",
    category: "Bread & Baked Goods",
    recommendedMonths: 3
  },
  {
    id: "baked-muffins",
    name: "Baked muffins",
    category: "Bread & Baked Goods",
    recommendedMonths: 3
  },
  {
    id: "tortillas",
    name: "Tortillas",
    category: "Bread & Baked Goods",
    recommendedMonths: 4
  },
  {
    id: "frozen-berries",
    name: "Frozen berries",
    category: "Fruits & Vegetables",
    recommendedMonths: 9
  },
  {
    id: "peas-mixed-veg",
    name: "Peas / mixed vegetables",
    category: "Fruits & Vegetables",
    recommendedMonths: 12
  },
  {
    id: "spinach",
    name: "Spinach",
    category: "Fruits & Vegetables",
    recommendedMonths: 10
  },
  {
    id: "shredded-cheese",
    name: "Shredded cheese",
    category: "Dairy",
    recommendedMonths: 3
  },
  {
    id: "butter",
    name: "Butter",
    category: "Dairy",
    recommendedMonths: 9
  },
  {
    id: "ice-cream",
    name: "Ice cream",
    category: "Other",
    recommendedMonths: 3
  },
  {
    id: "stock-broth",
    name: "Stock / broth",
    category: "Other",
    recommendedMonths: 3
  },
  {
    id: "casseroles",
    name: "Cooked casseroles",
    category: "Prepared Meals",
    recommendedMonths: 3
  },
  {
    id: "soups-stews",
    name: "Cooked soups / stews",
    category: "Prepared Meals",
    recommendedMonths: 3
  },
  {
    id: "leftover-chicken",
    name: "Leftover cooked chicken",
    category: "Prepared Meals",
    recommendedMonths: 3
  },
  {
    id: "pizza",
    name: "Pizza (leftover or frozen)",
    category: "Prepared Meals",
    recommendedMonths: 2
  },
  {
    id: "waffles",
    name: "Homemade waffles / pancakes",
    category: "Bread & Baked Goods",
    recommendedMonths: 2
  },
  {
    id: "bananas",
    name: "Frozen bananas",
    category: "Fruits & Vegetables",
    recommendedMonths: 3
  },
  {
    id: "berries-for-smoothies",
    name: "Smoothie fruit mix",
    category: "Fruits & Vegetables",
    recommendedMonths: 9
  }
];

const freezerTypeFactor: Record<FreezerType, number> = {
  standard: 1,
  deep: 1.5,
  fridgeFreezer: 0.75
};

const historyStorageKey = "lht_freezer_history";

const roundToNearestHalf = (value: number) =>
  Math.round(value * 2) / 2;

const addMonths = (date: Date, months: number) => {
  const result = new Date(date.getTime());
  const wholeMonths = Math.floor(months);
  const fraction = months - wholeMonths;

  if (wholeMonths !== 0) {
    result.setMonth(result.getMonth() + wholeMonths);
  }

  if (fraction !== 0) {
    const approximateDays = Math.round(fraction * 30);
    result.setDate(result.getDate() + approximateDays);
  }

  return result;
};

const diffInDays = (from: Date, to: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / msPerDay);
};

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

const loadInitialHistory = (): FreezeCheckHistoryItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(historyStorageKey);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as { id?: unknown }).id === "string" &&
        typeof (item as { timestamp?: unknown }).timestamp === "string" &&
        typeof (item as { foodName?: unknown }).foodName === "string" &&
        typeof (item as { freezerType?: unknown }).freezerType === "string" &&
        typeof (item as { frozenOn?: unknown }).frozenOn === "string" &&
        typeof (item as { bestBy?: unknown }).bestBy === "string" &&
        typeof (item as { daysInFreezer?: unknown }).daysInFreezer ===
          "number" &&
        typeof (item as { daysRemaining?: unknown }).daysRemaining === "number"
      ) {
        const freezerType =
          (item as { freezerType: FreezerType }).freezerType ===
            "deep" ||
          (item as { freezerType: FreezerType }).freezerType ===
            "fridgeFreezer"
            ? (item as { freezerType: FreezerType }).freezerType
            : "standard";
        return {
          id: (item as { id: string }).id,
          timestamp: (item as { timestamp: string }).timestamp,
          foodName: (item as { foodName: string }).foodName,
          freezerType,
          frozenOn: (item as { frozenOn: string }).frozenOn,
          bestBy: (item as { bestBy: string }).bestBy,
          daysInFreezer: (item as { daysInFreezer: number }).daysInFreezer,
          daysRemaining: (item as { daysRemaining: number }).daysRemaining
        } as FreezeCheckHistoryItem;
      }
      return null;
    })
    .filter((entry): entry is FreezeCheckHistoryItem => entry !== null)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
};

export default function HowLongToFreezeCalculator() {
  const firstFood = foods[0];

  const todayString = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [state, setState] = useState<HowLongToFreezeState>({
    category: firstFood.category,
    foodId: firstFood.id,
    useCustom: false,
    customName: "",
    customMonthsInput: "",
    freezerType: "standard",
    frozenOnInput: todayString
  });

  const [result, setResult] = useState<FreezeResult | null>(null);
  const [history, setHistory] = useState<FreezeCheckHistoryItem[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    const initial = loadInitialHistory();
    if (initial.length > 0) {
      setHistory(initial);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const serializable = history.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      foodName: entry.foodName,
      freezerType: entry.freezerType,
      frozenOn: entry.frozenOn,
      bestBy: entry.bestBy,
      daysInFreezer: entry.daysInFreezer,
      daysRemaining: entry.daysRemaining
    }));
    window.localStorage.setItem(
      historyStorageKey,
      JSON.stringify(serializable)
    );
  }, [history]);

  const foodsInCategory = useMemo(
    () =>
      foods.filter((food) => food.category === state.category),
    [state.category]
  );

  const selectedFood = useMemo(
    () =>
      foods.find((food) => food.id === state.foodId) ?? foodsInCategory[0],
    [foodsInCategory, state.foodId]
  );

  const freezerLabel: Record<FreezerType, string> = {
    standard: "Standard freezer (0°F / -18°C)",
    deep: "Deep / chest freezer (very cold, opened rarely)",
    fridgeFreezer: "Fridge-top / bottom freezer (opened often)"
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const handleCategoryChange = (category: FreezerCategory) => {
    const inCategory = foods.filter((food) => food.category === category);
    setState((previous) => ({
      ...previous,
      category,
      foodId: inCategory[0]?.id ?? previous.foodId
    }));
  };

  const parseFrozenOnDate = (): Date | null => {
    if (!state.frozenOnInput || state.frozenOnInput.length !== 10) {
      return null;
    }
    const date = new Date(`${state.frozenOnInput}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  };

  const handleCalculate = () => {
    const frozenDate = parseFrozenOnDate();
    if (!frozenDate) {
      setDateError("Enter a valid date when the food went into the freezer.");
      setResult(null);
      return;
    }
    setDateError(null);

    let baseMonths = 0;
    let foodName = selectedFood?.name ?? "Unknown item";
    let customErrorMessage: string | null = null;

    if (state.useCustom) {
      const trimmedName = state.customName.trim();
      const customMonths = Number.parseFloat(state.customMonthsInput);
      if (!trimmedName || !Number.isFinite(customMonths) || customMonths <= 0) {
        customErrorMessage =
          "Provide a custom item name and a positive number of months.";
      } else {
        foodName = trimmedName;
        baseMonths = customMonths;
      }
    } else if (selectedFood) {
      baseMonths = selectedFood.recommendedMonths;
      foodName = selectedFood.name;
    }

    if (customErrorMessage) {
      setCustomError(customErrorMessage);
      setResult(null);
      return;
    }
    setCustomError(null);

    if (baseMonths <= 0) {
      setResult(null);
      return;
    }

    const factor = freezerTypeFactor[state.freezerType];
    const adjustedRaw = baseMonths * factor;
    const adjustedMonths = Math.max(
      0.5,
      roundToNearestHalf(adjustedRaw)
    );

    const bestByDate = addMonths(frozenDate, adjustedMonths);
    const today = new Date();

    const daysInFreezer = diffInDays(frozenDate, today);
    const daysRemaining = diffInDays(today, bestByDate);

    const resultValue: FreezeResult = {
      foodName,
      freezerType: state.freezerType,
      frozenOn: frozenDate.toISOString(),
      bestBy: bestByDate.toISOString(),
      daysInFreezer,
      daysRemaining,
      adjustedMonths
    };

    setResult(resultValue);

    const historyItem: FreezeCheckHistoryItem = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Math.random()),
      timestamp: new Date().toISOString(),
      foodName: resultValue.foodName,
      freezerType: resultValue.freezerType,
      frozenOn: resultValue.frozenOn,
      bestBy: resultValue.bestBy,
      daysInFreezer: resultValue.daysInFreezer,
      daysRemaining: resultValue.daysRemaining
    };

    setHistory((previous) => [historyItem, ...previous].slice(0, 10));
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(historyStorageKey);
    }
  };

  let statusLabel = "Fill in the food, freezer type, and date to see recommendations.";
  let statusColorClasses = "border-slate-200 bg-slate-50 text-slate-800";

  if (result) {
    if (result.daysRemaining >= 14) {
      statusLabel = "Within recommended freezer time for best quality.";
      statusColorClasses = "border-emerald-200 bg-emerald-50 text-emerald-900";
    } else if (result.daysRemaining >= 0) {
      statusLabel =
        "Nearing the end of the recommended freezer time. Plan to use this soon.";
      statusColorClasses =
        "border-amber-200 bg-amber-50 text-amber-900";
    } else {
      statusLabel =
        "Past the recommended freezer time for best quality. Food may still be safe if kept frozen, but quality is likely reduced.";
      statusColorClasses = "border-red-200 bg-red-50 text-red-900";
    }
  }

  const freezerTypeFriendly: Record<FreezerType, string> = {
    standard: "Standard freezer",
    deep: "Deep / chest freezer",
    fridgeFreezer: "Fridge freezer"
  };

  return (
    <div className="space-y-8">
      <section
        aria-label="Freezer inputs"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Food and freezer details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium text-slate-800"
            >
              Food category
            </label>
            <div className="relative">
              <select
                id="category"
                value={state.category}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value as FreezerCategory
                  )
                }
                className={selectBaseClasses}
              >
                <option value="Meat & Poultry">Meat &amp; Poultry</option>
                <option value="Seafood">Seafood</option>
                <option value="Bread & Baked Goods">
                  Bread &amp; Baked Goods
                </option>
                <option value="Fruits & Vegetables">
                  Fruits &amp; Vegetables
                </option>
                <option value="Dairy">Dairy</option>
                <option value="Prepared Meals">Prepared Meals</option>
                <option value="Other">Other</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            {!state.useCustom && (
              <div className="space-y-1">
                <label
                  htmlFor="food"
                  className="text-sm font-medium text-slate-800"
                >
                  Food item
                </label>
                <div className="relative">
                  <select
                    id="food"
                    value={state.foodId}
                    onChange={(event) =>
                      setState((previous) => ({
                        ...previous,
                        foodId: event.target.value
                      }))
                    }
                    className={selectBaseClasses}
                  >
                    {foodsInCategory.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.name} (about {food.recommendedMonths} months)
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 8l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                {selectedFood?.notes && (
                  <p className="text-xs text-slate-600">
                    {selectedFood.notes}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800">
                Item type
              </label>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      useCustom: false
                    }))
                  }
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    !state.useCustom
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  Use preset item
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      useCustom: true
                    }))
                  }
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    state.useCustom
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  Custom item
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {state.useCustom && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label
                    htmlFor="customName"
                    className="text-sm font-medium text-slate-800"
                  >
                    Custom item name
                  </label>
                  <input
                    id="customName"
                    type="text"
                    value={state.customName}
                    onChange={(event) =>
                      setState((previous) => ({
                        ...previous,
                        customName: event.target.value
                      }))
                    }
                    className={inputBaseClasses}
                    placeholder="e.g. Homemade lasagna"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="customMonths"
                    className="text-sm font-medium text-slate-800"
                  >
                    Recommended months (standard freezer)
                  </label>
                  <input
                    id="customMonths"
                    type="number"
                    min={0.5}
                    step="0.5"
                    value={state.customMonthsInput}
                    onChange={(event) =>
                      setState((previous) => ({
                        ...previous,
                        customMonthsInput: event.target.value
                      }))
                    }
                    className={inputBaseClasses}
                    placeholder="e.g. 3"
                  />
                </div>
                {customError && (
                  <p className="text-xs text-red-600">{customError}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">
                Freezer type
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      freezerType: "standard"
                    }))
                  }
                  className={`rounded-md border px-3 py-2 text-left text-xs shadow-sm transition ${
                    state.freezerType === "standard"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  <span className="block font-semibold">Standard freezer</span>
                  <span className="block text-[11px] text-slate-600">
                    Typical 0°F / -18°C home freezer.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      freezerType: "deep"
                    }))
                  }
                  className={`rounded-md border px-3 py-2 text-left text-xs shadow-sm transition ${
                    state.freezerType === "deep"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  <span className="block font-semibold">
                    Deep / chest freezer
                  </span>
                  <span className="block text-[11px] text-slate-600">
                    Colder, opened less, usually better quality retention.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      freezerType: "fridgeFreezer"
                    }))
                  }
                  className={`rounded-md border px-3 py-2 text-left text-xs shadow-sm transition ${
                    state.freezerType === "fridgeFreezer"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  <span className="block font-semibold">
                    Fridge freezer
                  </span>
                  <span className="block text-[11px] text-slate-600">
                    Warmer and opened more often; quality drops faster.
                  </span>
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="frozenOn"
                className="text-sm font-medium text-slate-800"
              >
                Frozen on
              </label>
              <input
                id="frozenOn"
                type="date"
                value={state.frozenOnInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    frozenOnInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
              />
              <p className="text-xs text-slate-600">
                Use the date when the food first went into the freezer, not when it
                moved between freezers.
              </p>
              {dateError && (
                <p className="text-xs text-red-600">{dateError}</p>
              )}
            </div>
          </div>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCalculate}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Calculate
          </button>
        </div>
      </section>
      <section
        aria-label="Freezer result"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Result
        </h2>
        {!result ? (
          <p className="text-sm text-slate-700">
            Fill in the food, freezer type, and frozen-on date to see recommended
            freezer time and a best-by estimate.
          </p>
        ) : (
          <div className="space-y-3">
            <div
              className={`space-y-1 rounded-md border px-3 py-2 text-sm ${statusColorClasses}`}
            >
              <p className="font-semibold">Status</p>
              <p>{statusLabel}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Food
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {result.foodName}
                </p>
                <p className="text-xs text-slate-600">
                  Freezer type: {freezerLabel[result.freezerType]}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recommended storage time
                </p>
                <p className="text-sm font-medium text-slate-900">
                  About {result.adjustedMonths.toFixed(1)} months in a{" "}
                  {freezerTypeFriendly[result.freezerType].toLowerCase()}.
                </p>
                <p className="text-xs text-slate-600">
                  Adjusted from general guidance for your freezer type.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Frozen on
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(new Date(result.frozenOn))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recommended best-by date
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(new Date(result.bestBy))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Days in freezer so far
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {result.daysInFreezer} days
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Days remaining in recommended window
              </p>
              <p className="text-sm font-medium text-slate-900">
                {result.daysRemaining >= 0
                  ? `${result.daysRemaining} days remaining`
                  : `${Math.abs(
                      result.daysRemaining
                    )} days past the recommended window`}
              </p>
              <p className="text-xs text-slate-600">
                These times are general quality guidelines only. Frozen food kept at 0°F
                (-18°C) is generally safe indefinitely, but quality drops over time. When
                in doubt, throw it out.
              </p>
            </div>
          </div>
        )}
      </section>
      <section
        aria-label="Recent freezer checks"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Recent checks
          </h2>
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Clear history
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-600">
            No recent checks saved yet. Run a calculation to see it appear here.
          </p>
        ) : (
          <ul className="space-y-2 text-xs text-slate-800">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {entry.foodName}
                  </span>
                  <span className="text-slate-600">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="grid gap-1 sm:grid-cols-3">
                  <span>
                    Frozen: {formatDate(new Date(entry.frozenOn))}
                  </span>
                  <span>
                    Best by: {formatDate(new Date(entry.bestBy))}
                  </span>
                  <span>
                    In freezer: {entry.daysInFreezer} days, remaining:{" "}
                    {entry.daysRemaining}
                  </span>
                </div>
                <span className="text-slate-600">
                  Freezer: {freezerTypeFriendly[entry.freezerType]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}


