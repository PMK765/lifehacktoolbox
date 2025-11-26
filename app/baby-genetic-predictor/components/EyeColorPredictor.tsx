"use client";

import { useMemo, useState } from "react";
import type {
  EyeColorId,
  EyeColorProbability
} from "../logic";
import { predictEyeColor } from "../logic";
import ChartEyeColor from "./ChartEyeColor";

type EyeColorPredictorProps = {
  id: string;
};

const EYE_COLOR_OPTIONS: {
  id: EyeColorId;
  label: string;
}[] = [
  { id: "brown", label: "Brown" },
  { id: "hazel", label: "Hazel" },
  { id: "green", label: "Green" },
  { id: "blue", label: "Blue" },
  { id: "gray", label: "Gray" }
];

const labelForEye = (id: EyeColorId): string =>
  EYE_COLOR_OPTIONS.find(
    (option) => option.id === id
  )?.label ?? id;

const EyeColorPredictor = (
  props: EyeColorPredictorProps
) => {
  const { id } = props;
  const [parent1, setParent1] =
    useState<EyeColorId>("brown");
  const [parent2, setParent2] =
    useState<EyeColorId>("blue");

  const probabilities: EyeColorProbability[] =
    useMemo(
      () =>
        predictEyeColor(parent1, parent2).sort(
          (first, second) =>
            second.percentage - first.percentage
        ),
      [parent1, parent2]
    );

  const top = probabilities[0];

  return (
    <section
      id={id}
      className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-sm md:p-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-50">
            Eye color predictor
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            A polygenic-inspired probability model,
            based on common charts used by genetic
            counselors, to estimate eye color outcomes.
          </p>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-200">
            Parent eye colors
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-300">
              <span className="block font-semibold">
                Parent 1
              </span>
              <select
                value={parent1}
                onChange={(event) =>
                  setParent1(
                    event.target
                      .value as EyeColorId
                  )
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              >
                {EYE_COLOR_OPTIONS.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              <span className="block font-semibold">
                Parent 2
              </span>
              <select
                value={parent2}
                onChange={(event) =>
                  setParent2(
                    event.target
                      .value as EyeColorId
                  )
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              >
                {EYE_COLOR_OPTIONS.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {top && (
            <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs">
              <p className="font-semibold text-emerald-300">
                Most likely: {labelForEye(top.color)} (
                {Math.round(top.percentage)}%)
              </p>
              <p className="mt-1 text-slate-200">
                Values are approximate and based on
                generalized population data.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs font-semibold text-slate-200">
            Probability by eye color
          </p>
          <ChartEyeColor data={probabilities} />
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-200 sm:grid-cols-3">
            {probabilities.map((entry) => (
              <div
                key={entry.color}
                className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1"
              >
                <span>
                  {labelForEye(entry.color)}
                </span>
                <span className="font-mono">
                  {Math.round(entry.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EyeColorPredictor;


