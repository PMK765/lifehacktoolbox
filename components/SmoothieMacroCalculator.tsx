"use client";

import { useEffect, useMemo, useState } from "react";

type IngredientCategory =
  | "Fruit"
  | "Liquid"
  | "Protein powder"
  | "Nut butter"
  | "Greens"
  | "Other";

type SmoothieIngredient = {
  id: string;
  name: string;
  category: IngredientCategory;
  brand?: string;
  defaultServingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type SmoothieRow = {
  id: string;
  source: "preset" | "custom";
  ingredientId?: string;
  name: string;
  category: IngredientCategory | "Custom";
  servingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
};

type SmoothiePreset = {
  id: string;
  name: string;
  rows: SmoothieRow[];
};

type CustomIngredientState = {
  name: string;
  servingLabel: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

type SmoothieMacroState = {
  selectedIngredientId: string;
  rows: SmoothieRow[];
};

const smoothiePresetsStorageKey = "lht_smoothie_presets";

const ingredients: SmoothieIngredient[] = [
  {
    id: "banana-medium",
    name: "Banana (medium)",
    category: "Fruit",
    defaultServingLabel: "1 medium",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3
  },
  {
    id: "strawberries-frozen",
    name: "Frozen strawberries",
    category: "Fruit",
    defaultServingLabel: "1 cup",
    calories: 50,
    protein: 1,
    carbs: 12,
    fat: 0.5
  },
  {
    id: "blueberries-frozen",
    name: "Frozen blueberries",
    category: "Fruit",
    defaultServingLabel: "1 cup",
    calories: 80,
    protein: 1,
    carbs: 21,
    fat: 0.5
  },
  {
    id: "mango-chunks",
    name: "Mango chunks",
    category: "Fruit",
    defaultServingLabel: "1 cup",
    calories: 100,
    protein: 1,
    carbs: 25,
    fat: 0.5
  },
  {
    id: "mixed-berries",
    name: "Mixed berries",
    category: "Fruit",
    defaultServingLabel: "1 cup",
    calories: 70,
    protein: 1,
    carbs: 17,
    fat: 0.5
  },
  {
    id: "orange-juice",
    name: "Orange juice",
    category: "Liquid",
    defaultServingLabel: "1 cup",
    calories: 110,
    protein: 2,
    carbs: 26,
    fat: 0
  },
  {
    id: "whole-milk",
    name: "Whole milk",
    category: "Liquid",
    defaultServingLabel: "1 cup",
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 8
  },
  {
    id: "two-percent-milk",
    name: "2% milk",
    category: "Liquid",
    defaultServingLabel: "1 cup",
    calories: 120,
    protein: 8,
    carbs: 12,
    fat: 5
  },
  {
    id: "almond-milk-unsweetened",
    name: "Almond milk (unsweetened)",
    category: "Liquid",
    defaultServingLabel: "1 cup",
    calories: 30,
    protein: 1,
    carbs: 1,
    fat: 2.5
  },
  {
    id: "oat-milk",
    name: "Oat milk",
    category: "Liquid",
    defaultServingLabel: "1 cup",
    calories: 120,
    protein: 3,
    carbs: 16,
    fat: 5
  },
  {
    id: "coconut-water",
    name: "Coconut water",
    category: "Liquid",
    defaultServingLabel: "1 cup",
    calories: 45,
    protein: 0,
    carbs: 11,
    fat: 0
  },
  {
    id: "coconut-milk-carton",
    name: "Coconut milk (carton)",
    category: "Liquid",
    defaultServingLabel: "1 cup",
    calories: 80,
    protein: 1,
    carbs: 8,
    fat: 5
  },
  {
    id: "whey-protein",
    name: "Whey protein powder",
    category: "Protein powder",
    defaultServingLabel: "1 scoop",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 2
  },
  {
    id: "plant-protein",
    name: "Plant protein powder",
    category: "Protein powder",
    defaultServingLabel: "1 scoop",
    calories: 110,
    protein: 20,
    carbs: 5,
    fat: 2
  },
  {
    id: "collagen-peptides",
    name: "Collagen peptides",
    category: "Protein powder",
    defaultServingLabel: "2 scoops",
    calories: 70,
    protein: 18,
    carbs: 0,
    fat: 0
  },
  {
    id: "peanut-butter",
    name: "Peanut butter",
    category: "Nut butter",
    defaultServingLabel: "2 tbsp",
    calories: 190,
    protein: 8,
    carbs: 7,
    fat: 16
  },
  {
    id: "almond-butter",
    name: "Almond butter",
    category: "Nut butter",
    defaultServingLabel: "2 tbsp",
    calories: 200,
    protein: 7,
    carbs: 6,
    fat: 18
  },
  {
    id: "cashew-butter",
    name: "Cashew butter",
    category: "Nut butter",
    defaultServingLabel: "2 tbsp",
    calories: 190,
    protein: 6,
    carbs: 9,
    fat: 16
  },
  {
    id: "spinach",
    name: "Spinach",
    category: "Greens",
    defaultServingLabel: "1 cup",
    calories: 10,
    protein: 1,
    carbs: 1,
    fat: 0
  },
  {
    id: "kale",
    name: "Kale",
    category: "Greens",
    defaultServingLabel: "1 cup",
    calories: 30,
    protein: 2,
    carbs: 6,
    fat: 0.5
  },
  {
    id: "greek-yogurt-plain",
    name: "Greek yogurt (plain)",
    category: "Other",
    defaultServingLabel: "3/4 cup",
    calories: 130,
    protein: 17,
    carbs: 6,
    fat: 0
  },
  {
    id: "vanilla-yogurt",
    name: "Vanilla yogurt",
    category: "Other",
    defaultServingLabel: "3/4 cup",
    calories: 150,
    protein: 8,
    carbs: 25,
    fat: 2
  },
  {
    id: "chia-seeds",
    name: "Chia seeds",
    category: "Other",
    defaultServingLabel: "2 tbsp",
    calories: 140,
    protein: 5,
    carbs: 12,
    fat: 9
  },
  {
    id: "flax-seeds",
    name: "Flax seeds (ground)",
    category: "Other",
    defaultServingLabel: "2 tbsp",
    calories: 110,
    protein: 4,
    carbs: 6,
    fat: 9
  },
  {
    id: "rolled-oats",
    name: "Rolled oats",
    category: "Other",
    defaultServingLabel: "1/2 cup",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3
  },
  {
    id: "honey",
    name: "Honey",
    category: "Other",
    defaultServingLabel: "1 tbsp",
    calories: 60,
    protein: 0,
    carbs: 17,
    fat: 0
  },
  {
    id: "cocoa-powder",
    name: "Cocoa powder (unsweetened)",
    category: "Other",
    defaultServingLabel: "1 tbsp",
    calories: 20,
    protein: 1,
    carbs: 3,
    fat: 1
  },
  {
    id: "ice-cubes",
    name: "Ice cubes",
    category: "Other",
    defaultServingLabel: "1 cup",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  }
];

const clampNonNegative = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;

const clampNonNegativeServings = (value: number) =>
  Number.isFinite(value) && value >= 0 ? value : 0;

const createRowFromIngredient = (
  ingredient: SmoothieIngredient
): SmoothieRow => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Math.random()),
  source: "preset",
  ingredientId: ingredient.id,
  name: ingredient.name,
  category: ingredient.category,
  servingLabel: ingredient.defaultServingLabel,
  calories: ingredient.calories,
  protein: ingredient.protein,
  carbs: ingredient.carbs,
  fat: ingredient.fat,
  servings: 1
});

const loadInitialSmoothiePresets = (): SmoothiePreset[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(smoothiePresetsStorageKey);

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
        typeof (item as { name?: unknown }).name === "string" &&
        Array.isArray((item as { rows?: unknown }).rows)
      ) {
        const rows = (item as { rows: unknown[] }).rows
          .map((row) => {
            if (
              row &&
              typeof row === "object" &&
              typeof (row as { id?: unknown }).id === "string" &&
              typeof (row as { name?: unknown }).name === "string" &&
              typeof (row as { servingLabel?: unknown }).servingLabel ===
                "string"
            ) {
              const numericCalories = Number(
                (row as { calories?: unknown }).calories
              );
              const numericProtein = Number(
                (row as { protein?: unknown }).protein
              );
              const numericCarbs = Number((row as { carbs?: unknown }).carbs);
              const numericFat = Number((row as { fat?: unknown }).fat);
              const numericServings = Number(
                (row as { servings?: unknown }).servings
              );

              return {
                id: (row as { id: string }).id,
                source:
                  (row as { source?: "preset" | "custom" }).source === "custom"
                    ? "custom"
                    : "preset",
                ingredientId:
                  typeof (row as { ingredientId?: unknown }).ingredientId ===
                  "string"
                    ? (row as { ingredientId: string }).ingredientId
                    : undefined,
                name: (row as { name: string }).name,
                category:
                  (row as { category?: IngredientCategory | "Custom" })
                    .category ?? "Custom",
                servingLabel: (row as { servingLabel: string }).servingLabel,
                calories: clampNonNegative(numericCalories),
                protein: clampNonNegative(numericProtein),
                carbs: clampNonNegative(numericCarbs),
                fat: clampNonNegative(numericFat),
                servings: clampNonNegativeServings(numericServings)
              } as SmoothieRow;
            }
            return null;
          })
          .filter((row): row is SmoothieRow => row !== null);

        return {
          id: (item as { id: string }).id,
          name: (item as { name: string }).name,
          rows
        } as SmoothiePreset;
      }
      return null;
    })
    .filter((preset): preset is SmoothiePreset => preset !== null);
};

const formatNumber = (value: number, fractionDigits: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });

export default function SmoothieMacroCalculator() {
  const [smoothieState, setSmoothieState] = useState<SmoothieMacroState>({
    selectedIngredientId: ingredients[0]?.id ?? "",
    rows: []
  });

  const [custom, setCustom] = useState<CustomIngredientState>({
    name: "",
    servingLabel: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  });

  const [customError, setCustomError] = useState<string | null>(null);
  const [presets, setPresets] = useState<SmoothiePreset[]>([]);
  const [smoothieNameInput, setSmoothieNameInput] = useState("");

  useEffect(() => {
    const initial = loadInitialSmoothiePresets();
    if (initial.length > 0) {
      setPresets(initial);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const serializable = presets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      rows: preset.rows
    }));
    window.localStorage.setItem(
      smoothiePresetsStorageKey,
      JSON.stringify(serializable)
    );
  }, [presets]);

  const addSelectedIngredient = () => {
    const ingredient = ingredients.find(
      (item) => item.id === smoothieState.selectedIngredientId
    );
    if (!ingredient) {
      return;
    }
    const row = createRowFromIngredient(ingredient);
    setSmoothieState((previous) => ({
      ...previous,
      rows: [...previous.rows, row]
    }));
  };

  const handleRowServingsChange = (id: string, raw: string) => {
    const numeric = Number.parseFloat(raw);
    const safeServings = clampNonNegativeServings(numeric);
    setSmoothieState((previous) => ({
      ...previous,
      rows: previous.rows.map((row) =>
        row.id === id ? { ...row, servings: safeServings } : row
      )
    }));
  };

  const removeRow = (id: string) => {
    setSmoothieState((previous) => ({
      ...previous,
      rows: previous.rows.filter((row) => row.id !== id)
    }));
  };

  const handleAddCustomIngredient = () => {
    const trimmedName = custom.name.trim();
    const trimmedServingLabel = custom.servingLabel.trim();

    const calories = clampNonNegative(Number.parseFloat(custom.calories || "0"));
    const protein = clampNonNegative(Number.parseFloat(custom.protein || "0"));
    const carbs = clampNonNegative(Number.parseFloat(custom.carbs || "0"));
    const fat = clampNonNegative(Number.parseFloat(custom.fat || "0"));

    if (!trimmedName || !trimmedServingLabel) {
      setCustomError("Custom ingredients need a name and serving label.");
      return;
    }

    if (
      calories < 0 ||
      (protein === 0 && carbs === 0 && fat === 0 && calories === 0)
    ) {
      setCustomError(
        "Provide calories and at least one macro value for a custom ingredient."
      );
      return;
    }

    setCustomError(null);

    const row: SmoothieRow = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Math.random()),
      source: "custom",
      name: trimmedName,
      category: "Custom",
      servingLabel: trimmedServingLabel,
      calories,
      protein,
      carbs,
      fat,
      servings: 1
    };

    setSmoothieState((previous) => ({
      ...previous,
      rows: [...previous.rows, row]
    }));

    setCustom({
      name: "",
      servingLabel: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: ""
    });
  };

  const totals = useMemo(() => {
    return smoothieState.rows.reduce(
      (accumulator, row) => {
        const servings = clampNonNegativeServings(row.servings);
        accumulator.calories += row.calories * servings;
        accumulator.protein += row.protein * servings;
        accumulator.carbs += row.carbs * servings;
        accumulator.fat += row.fat * servings;
        return accumulator;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [smoothieState.rows]);

  const hasAnyIngredient = smoothieState.rows.length > 0;
  const hasAnyMacro =
    totals.calories > 0 ||
    totals.protein > 0 ||
    totals.carbs > 0 ||
    totals.fat > 0;

  const macroLabel = useMemo(() => {
    if (!hasAnyMacro) {
      return null;
    }
    if (totals.protein >= 25) {
      return "High protein";
    }
    if (totals.carbs >= 50) {
      return "Higher carb";
    }
    if (totals.fat >= 20) {
      return "Higher fat";
    }
    return null;
  }, [hasAnyMacro, totals.carbs, totals.fat, totals.protein]);

  const handleSaveSmoothiePreset = () => {
    const trimmedName = smoothieNameInput.trim();
    if (!trimmedName || smoothieState.rows.length === 0) {
      return;
    }

    setPresets((previous) => {
      const existingIndex = previous.findIndex(
        (preset) => preset.name.toLowerCase() === trimmedName.toLowerCase()
      );
      const id =
        existingIndex >= 0
          ? previous[existingIndex].id
          : typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Math.random());
      const rows = smoothieState.rows.map((row) => ({
        ...row,
        servings: clampNonNegativeServings(row.servings)
      }));
      const updatedPreset: SmoothiePreset = {
        id,
        name: trimmedName,
        rows
      };
      if (existingIndex >= 0) {
        const copy = previous.slice();
        copy[existingIndex] = updatedPreset;
        return copy;
      }
      return [...previous, updatedPreset];
    });
  };

  const handleLoadSmoothiePreset = (preset: SmoothiePreset) => {
    setSmoothieState((previous) => ({
      ...previous,
      rows: preset.rows
    }));
  };

  const handleDeleteSmoothiePreset = (id: string) => {
    setPresets((previous) => previous.filter((preset) => preset.id !== id));
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="space-y-8">
      <section
        aria-label="Smoothie ingredients"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Ingredients
        </h2>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:items-end">
          <div className="space-y-1">
            <label
              htmlFor="ingredientSelect"
              className="text-sm font-medium text-slate-800"
            >
              Add ingredient
            </label>
            <div className="relative">
              <select
                id="ingredientSelect"
                value={smoothieState.selectedIngredientId}
                onChange={(event) =>
                  setSmoothieState((previous) => ({
                    ...previous,
                    selectedIngredientId: event.target.value
                  }))
                }
                className={selectBaseClasses}
              >
                {["Fruit", "Liquid", "Protein powder", "Nut butter", "Greens", "Other"].map(
                  (category) => (
                    <optgroup key={category} label={category}>
                      {ingredients
                        .filter((ingredient) => ingredient.category === category)
                        .map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.defaultServingLabel})
                          </option>
                        ))}
                    </optgroup>
                  )
                )}
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
          </div>
          <button
            type="button"
            onClick={addSelectedIngredient}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Add ingredient
          </button>
        </div>
        {smoothieState.rows.length === 0 ? (
          <p className="text-sm text-slate-700">
            Add at least one ingredient to see your smoothie macros.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current smoothie
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Ingredient
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Serving
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-slate-700">
                      Servings
                    </th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {smoothieState.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900">
                            {row.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {row.category === "Custom"
                              ? "Custom"
                              : row.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-800">
                        {row.servingLabel}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step={0.25}
                          value={row.servings}
                          onChange={(event) =>
                            handleRowServingsChange(row.id, event.target.value)
                          }
                          className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-red-300 hover:text-red-700"
                          aria-label={`Remove ${row.name}`}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      <section
        aria-label="Custom ingredients"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Custom ingredient
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="customName"
              className="text-sm font-medium text-slate-800"
            >
              Name
            </label>
            <input
              id="customName"
              type="text"
              value={custom.name}
              onChange={(event) =>
                setCustom((previous) => ({
                  ...previous,
                  name: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="e.g. Costco chocolate protein"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="customServingLabel"
              className="text-sm font-medium text-slate-800"
            >
              Serving label
            </label>
            <input
              id="customServingLabel"
              type="text"
              value={custom.servingLabel}
              onChange={(event) =>
                setCustom((previous) => ({
                  ...previous,
                  servingLabel: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="e.g. 1 scoop, 100 g"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="customCalories"
              className="text-sm font-medium text-slate-800"
            >
              Calories per serving
            </label>
            <input
              id="customCalories"
              type="number"
              min={0}
              step="1"
              value={custom.calories}
              onChange={(event) =>
                setCustom((previous) => ({
                  ...previous,
                  calories: event.target.value
                }))
              }
              className={inputBaseClasses}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="customProtein"
              className="text-sm font-medium text-slate-800"
            >
              Protein (g)
            </label>
            <input
              id="customProtein"
              type="number"
              min={0}
              step="0.5"
              value={custom.protein}
              onChange={(event) =>
                setCustom((previous) => ({
                  ...previous,
                  protein: event.target.value
                }))
              }
              className={inputBaseClasses}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="customCarbs"
              className="text-sm font-medium text-slate-800"
            >
              Carbs (g)
            </label>
            <input
              id="customCarbs"
              type="number"
              min={0}
              step="0.5"
              value={custom.carbs}
              onChange={(event) =>
                setCustom((previous) => ({
                  ...previous,
                  carbs: event.target.value
                }))
              }
              className={inputBaseClasses}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="customFat"
              className="text-sm font-medium text-slate-800"
            >
              Fat (g)
            </label>
            <input
              id="customFat"
              type="number"
              min={0}
              step="0.5"
              value={custom.fat}
              onChange={(event) =>
                setCustom((previous) => ({
                  ...previous,
                  fat: event.target.value
                }))
              }
              className={inputBaseClasses}
            />
          </div>
        </div>
        {customError && (
          <p className="text-xs text-red-600">{customError}</p>
        )}
        <button
          type="button"
          onClick={handleAddCustomIngredient}
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Add custom ingredient to smoothie
        </button>
      </section>
      <section
        aria-label="Smoothie presets"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Smoothie presets
        </h2>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <input
            type="text"
            value={smoothieNameInput}
            onChange={(event) => setSmoothieNameInput(event.target.value)}
            className={inputBaseClasses}
            placeholder="Smoothie name, e.g. 'Post-workout blend'"
          />
          <button
            type="button"
            onClick={handleSaveSmoothiePreset}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Save smoothie
          </button>
        </div>
        {presets.length === 0 ? (
          <p className="text-xs text-slate-600">
            No smoothies saved yet. Build a recipe above, give it a name, and click Save
            smoothie to reuse it later on this device.
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-700">Saved smoothies</p>
            <ul className="space-y-1 text-xs text-slate-800">
              {presets.map((preset) => (
                <li
                  key={preset.id}
                  className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1"
                >
                  <span className="truncate">{preset.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleLoadSmoothiePreset(preset)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 hover:border-slate-400"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSmoothiePreset(preset.id)}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-red-300 hover:text-red-700"
                      aria-label={`Delete smoothie ${preset.name}`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section
        aria-label="Smoothie totals"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Results
        </h2>
        {!hasAnyIngredient && (
          <p className="text-sm text-slate-700">
            Add at least one ingredient to see your smoothie macros.
          </p>
        )}
        {hasAnyIngredient && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total calories
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {Math.round(totals.calories).toLocaleString("en-US")} kcal
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Protein
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(totals.protein, 1)} g
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Carbs
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(totals.carbs, 1)} g
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fat
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(totals.fat, 1)} g
                </p>
              </div>
            </div>
            {macroLabel && (
              <p className="text-xs font-medium text-emerald-800">
                This looks like a <span className="font-semibold">{macroLabel}</span>{" "}
                smoothie based on simple thresholds.
              </p>
            )}
            {!macroLabel && hasAnyMacro && (
              <p className="text-xs text-slate-600">
                This smoothie is relatively balanced across macros based on the simple
                thresholds used here.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}


