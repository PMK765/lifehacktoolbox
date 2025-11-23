"use client";

import { useMemo, useState } from "react";

type GradeMode = "points" | "percent";

type GradeCategory = {
  id: string;
  name: string;
  weightPercent: number;
  mode: GradeMode;
  earnedPoints: number;
  possiblePoints: number;
  categoryPercent: number;
};

type WeightedGradeState = {
  categories: GradeCategory[];
  whatIfCategoryId: string;
  whatIfPercentInput: string;
};

const createCategory = (partial?: Partial<GradeCategory>): GradeCategory => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Math.random()),
  name: "Category",
  weightPercent: 0,
  mode: "points",
  earnedPoints: 0,
  possiblePoints: 0,
  categoryPercent: 0,
  ...partial
});

const defaultCategories: GradeCategory[] = [
  createCategory({ name: "Homework", weightPercent: 30 }),
  createCategory({ name: "Quizzes", weightPercent: 20 }),
  createCategory({ name: "Exams", weightPercent: 40 }),
  createCategory({ name: "Participation", weightPercent: 10 })
];

const clampNonNegative = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;

const clampPercent = (value: number) =>
  Number.isFinite(value) && value >= 0 ? value : 0;

const formatPercent = (value: number, fractionDigits: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });

const letterFromPercent = (value: number) => {
  if (value >= 90) {
    return "A";
  }
  if (value >= 80) {
    return "B";
  }
  if (value >= 70) {
    return "C";
  }
  if (value >= 60) {
    return "D";
  }
  return "F";
};

export default function WeightedGradeCalculator() {
  const [state, setState] = useState<WeightedGradeState>({
    categories: defaultCategories,
    whatIfCategoryId: defaultCategories[0]?.id ?? "",
    whatIfPercentInput: ""
  });

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const numberInputClasses =
    "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const categoriesWithDerived = useMemo(() => {
    return state.categories.map((category) => {
      let percent = 0;
      if (category.mode === "points") {
        const possible = clampNonNegative(category.possiblePoints);
        const earned = clampNonNegative(category.earnedPoints);
        if (possible > 0) {
          percent = (earned / possible) * 100;
        }
      } else {
        percent = clampPercent(category.categoryPercent);
      }
      return {
        ...category,
        derivedPercent: percent
      };
    });
  }, [state.categories]);

  const totalWeight = useMemo(
    () =>
      categoriesWithDerived.reduce(
        (sum, category) => sum + clampPercent(category.weightPercent),
        0
      ),
    [categoriesWithDerived]
  );

  const overall = useMemo(() => {
    const weightedSum = categoriesWithDerived.reduce(
      (sum, category) => sum + category.derivedPercent * category.weightPercent,
      0
    );
    const weightTotal = categoriesWithDerived.reduce(
      (sum, category) => sum + clampPercent(category.weightPercent),
      0
    );
    const overallPercent =
      weightTotal > 0 ? weightedSum / weightTotal : 0;
    const letter = letterFromPercent(overallPercent);
    return {
      overallPercent,
      letter
    };
  }, [categoriesWithDerived]);

  const whatIfResult = useMemo(() => {
    const raw = Number.parseFloat(state.whatIfPercentInput);
    if (!Number.isFinite(raw)) {
      return null;
    }
    const whatIfPercent = clampPercent(raw);
    const categories = categoriesWithDerived;

    const weightedSum = categories.reduce((sum, category) => {
      const percent =
        category.id === state.whatIfCategoryId
          ? whatIfPercent
          : category.derivedPercent;
      return sum + percent * category.weightPercent;
    }, 0);
    const weightTotal = categories.reduce(
      (sum, category) => sum + clampPercent(category.weightPercent),
      0
    );
    const overallPercent =
      weightTotal > 0 ? weightedSum / weightTotal : 0;
    const letter = letterFromPercent(overallPercent);

    return {
      overallPercent,
      letter
    };
  }, [categoriesWithDerived, state.whatIfCategoryId, state.whatIfPercentInput]);

  const handleCategoryChange = <Key extends keyof GradeCategory>(
    id: string,
    key: Key,
    value: GradeCategory[Key]
  ) => {
    setState((previous) => ({
      ...previous,
      categories: previous.categories.map((category) =>
        category.id === id
          ? {
              ...category,
              [key]: value
            }
          : category
      )
    }));
  };

  const handleWeightChange = (id: string, raw: string) => {
    const numeric = Number.parseFloat(raw);
    handleCategoryChange(id, "weightPercent", clampPercent(numeric));
  };

  const handlePointsChange = (
    id: string,
    key: "earnedPoints" | "possiblePoints",
    raw: string
  ) => {
    const numeric = Number.parseFloat(raw);
    handleCategoryChange(id, key, clampNonNegative(numeric));
  };

  const handlePercentChange = (id: string, raw: string) => {
    const numeric = Number.parseFloat(raw);
    handleCategoryChange(id, "categoryPercent", clampPercent(numeric));
  };

  const addCategory = () => {
    setState((previous) => {
      const next = createCategory({
        name: "New category",
        weightPercent: 0,
        mode: "points"
      });
      return {
        ...previous,
        categories: [...previous.categories, next],
        whatIfCategoryId:
          previous.whatIfCategoryId || next.id
      };
    });
  };

  const removeCategory = (id: string) => {
    setState((previous) => {
      if (previous.categories.length <= 1) {
        return previous;
      }
      const filtered = previous.categories.filter(
        (category) => category.id !== id
      );
      const nextWhatIf =
        previous.whatIfCategoryId === id && filtered.length > 0
          ? filtered[0].id
          : previous.whatIfCategoryId;
      return {
        ...previous,
        categories: filtered,
        whatIfCategoryId: nextWhatIf
      };
    });
  };

  const weightStatusColor =
    totalWeight === 100
      ? "text-emerald-700"
      : totalWeight === 0
      ? "text-slate-600"
      : "text-amber-700";

  const weightStatusMessage =
    totalWeight === 100
      ? "Total weight is 100%. This matches a typical syllabus."
      : `Total weight should usually be 100%. Currently: ${formatPercent(
          totalWeight,
          1
        )}%. Results are still computed using these weights.`;

  return (
    <div className="space-y-8">
      <section
        aria-label="Grade categories"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Categories
        </h2>
        <p className="text-xs text-slate-600">
          Match these categories and weights to your syllabus. Each category can use
          either points (earned / possible) or a direct percentage.
        </p>
        <div className="space-y-3">
          {categoriesWithDerived.map((category) => (
            <div
              key={category.id}
              className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={`name-${category.id}`}
                    className="text-xs font-medium text-slate-700"
                  >
                    Category name
                  </label>
                  <input
                    id={`name-${category.id}`}
                    type="text"
                    value={category.name}
                    onChange={(event) =>
                      handleCategoryChange(
                        category.id,
                        "name",
                        event.target.value
                      )
                    }
                    className={inputBaseClasses}
                  />
                </div>
                <div className="w-full space-y-1 sm:w-32">
                  <label
                    htmlFor={`weight-${category.id}`}
                    className="text-xs font-medium text-slate-700"
                  >
                    Weight (%)
                  </label>
                  <input
                    id={`weight-${category.id}`}
                    type="number"
                    min={0}
                    step="1"
                    value={category.weightPercent}
                    onChange={(event) =>
                      handleWeightChange(
                        category.id,
                        event.target.value
                      )
                    }
                    className={numberInputClasses}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">
                  How do you want to enter this category?
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange(
                        category.id,
                        "mode",
                        "points"
                      )
                    }
                    className={`rounded-md border px-2.5 py-1.5 transition ${
                      category.mode === "points"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                    }`}
                  >
                    Use points
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange(
                        category.id,
                        "mode",
                        "percent"
                      )
                    }
                    className={`rounded-md border px-2.5 py-1.5 transition ${
                      category.mode === "percent"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                    }`}
                  >
                    Enter percent directly
                  </button>
                </div>
              </div>
              {category.mode === "points" ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label
                      htmlFor={`earned-${category.id}`}
                      className="text-xs font-medium text-slate-700"
                    >
                      Earned points
                    </label>
                    <input
                      id={`earned-${category.id}`}
                      type="number"
                      min={0}
                      step="0.5"
                      value={category.earnedPoints}
                      onChange={(event) =>
                        handlePointsChange(
                          category.id,
                          "earnedPoints",
                          event.target.value
                        )
                      }
                      className={numberInputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`possible-${category.id}`}
                      className="text-xs font-medium text-slate-700"
                    >
                      Possible points
                    </label>
                    <input
                      id={`possible-${category.id}`}
                      type="number"
                      min={0}
                      step="0.5"
                      value={category.possiblePoints}
                      onChange={(event) =>
                        handlePointsChange(
                          category.id,
                          "possiblePoints",
                          event.target.value
                        )
                      }
                      className={numberInputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-700">
                      Category %
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {category.possiblePoints > 0
                        ? `${formatPercent(
                            category.derivedPercent,
                            1
                          )}%`
                        : "—"}
                    </p>
                    {category.possiblePoints <= 0 && (
                      <p className="text-[11px] text-slate-600">
                        Enter possible points to compute this category.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label
                      htmlFor={`percent-${category.id}`}
                      className="text-xs font-medium text-slate-700"
                    >
                      Category %
                    </label>
                    <input
                      id={`percent-${category.id}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={category.categoryPercent}
                      onChange={(event) =>
                        handlePercentChange(
                          category.id,
                          event.target.value
                        )
                      }
                      className={numberInputClasses}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Contribution: {formatPercent(category.derivedPercent, 1)}% in this
                  category × {formatPercent(category.weightPercent, 1)}% weight.
                </p>
                {state.categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategory(category.id)}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Add category
          </button>
        </div>
      </section>
      <section
        aria-label="Overall grade summary"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Summary
        </h2>
        <div className="space-y-2">
          <p className={`text-sm font-medium ${weightStatusColor}`}>
            Total weight: {formatPercent(totalWeight, 1)}%
          </p>
          <p className="text-xs text-slate-600">{weightStatusMessage}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Overall grade
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatPercent(overall.overallPercent, 1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Approximate letter
            </p>
            <p className="text-xl font-semibold text-slate-900">
              {overall.letter}
            </p>
            <p className="text-xs text-slate-600">
              Letter cutoffs vary by instructor and school.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </p>
            <p className="text-xs text-slate-600">
              This calculator does not handle drop-lowest rules or extra credit
              automatically. Adjust category values yourself to reflect those policies.
            </p>
          </div>
        </div>
      </section>
      <section
        aria-label="What-if grade scenario"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          What-if scenario
        </h2>
        <p className="text-xs text-slate-600">
          Use this to see how your overall grade would change if a specific category
          ended at a certain percentage. This does not modify your main inputs.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="whatIfCategory"
              className="text-xs font-medium text-slate-700"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="whatIfCategory"
                value={state.whatIfCategoryId}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    whatIfCategoryId: event.target.value
                  }))
                }
                className={selectBaseClasses}
              >
                {state.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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
          </div>
          <div className="space-y-1">
            <label
              htmlFor="whatIfPercent"
              className="text-xs font-medium text-slate-700"
            >
              Hypothetical category %
            </label>
            <input
              id="whatIfPercent"
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={state.whatIfPercentInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  whatIfPercentInput: event.target.value
                }))
              }
              className={numberInputClasses}
              placeholder="e.g. 85"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              New overall grade (what-if)
            </p>
            {whatIfResult ? (
              <div className="space-y-0.5">
                <p className="text-lg font-semibold text-slate-900">
                  {formatPercent(whatIfResult.overallPercent, 1)}%
                </p>
                <p className="text-xs text-slate-600">
                  Letter: {whatIfResult.letter}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Enter a hypothetical percent to see a preview.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


