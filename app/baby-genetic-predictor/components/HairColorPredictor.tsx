"use client";

import { useMemo, useState } from "react";
import type {
  HairColorProbability,
  HairParentType
} from "../logic";
import {
  HAIR_PARENT_LABELS,
  predictHairColor
} from "../logic";
import ChartHairColor from "./ChartHairColor";

type HairColorPredictorProps = {
  id: string;
};

const HairColorPredictor = (
  props: HairColorPredictorProps
) => {
  const { id } = props;
  const [parent1, setParent1] =
    useState<HairParentType>("dark");
  const [parent2, setParent2] =
    useState<HairParentType>("light");

  const probabilities: HairColorProbability[] =
    useMemo(
      () =>
        predictHairColor(parent1, parent2).sort(
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
            Hair color predictor
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Approximate hair color probabilities
            including dark, light, blonde and red
            phenotypes, assuming simplified inheritance
            of key genes such as MC1R.
          </p>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-200">
            Parent hair types
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
                      .value as HairParentType
                  )
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              >
                {HAIR_PARENT_LABELS.map((option) => (
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
                      .value as HairParentType
                  )
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              >
                {HAIR_PARENT_LABELS.map((option) => (
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
            <div className="mt-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs">
              <p className="font-semibold text-sky-300">
                Most likely hair color:{" "}
                {top.color === "black"
                  ? "Black"
                  : top.color === "dark-brown"
                  ? "Dark brown"
                  : top.color === "light-brown"
                  ? "Light brown"
                  : top.color === "blonde"
                  ? "Blonde"
                  : "Red"}{" "}
                ({Math.round(top.percentage)}%)
              </p>
              <p className="mt-1 text-slate-200">
                Real-world genetics involve many genes;
                these values are illustrative, not
                diagnostic.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs font-semibold text-slate-200">
            Probability by hair color
          </p>
          <ChartHairColor data={probabilities} />
        </div>
      </div>
    </section>
  );
};

export default HairColorPredictor;


