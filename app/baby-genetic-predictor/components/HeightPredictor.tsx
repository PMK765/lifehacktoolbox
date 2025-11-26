"use client";

import { useMemo, useState } from "react";
import type { HeightPrediction, HeightUnit, Sex } from "../logic";
import {
  CM_PER_INCH,
  HeightUnit as HeightUnitType,
  Sex as SexType,
  convertFeetInchesToCm,
  convertCmToFeetInches,
  predictChildHeight
} from "../logic";
import ChartHeight from "./ChartHeight";

type HeightPredictorProps = {
  id: string;
};

const HeightPredictor = (props: HeightPredictorProps) => {
  const { id } = props;
  const [unit, setUnit] =
    useState<HeightUnitType>("imperial");
  const [sex, setSex] = useState<SexType>("boy");
  const [motherFeet, setMotherFeet] = useState("5");
  const [motherInches, setMotherInches] = useState("4");
  const [fatherFeet, setFatherFeet] = useState("5");
  const [fatherInches, setFatherInches] = useState("10");
  const [motherCm, setMotherCm] = useState("162");
  const [fatherCm, setFatherCm] = useState("178");

  const prediction: HeightPrediction | null = useMemo(() => {
    let mCm = 0;
    let fCm = 0;
    if (unit === "imperial") {
      const mf = Number(motherFeet);
      const mi = Number(motherInches);
      const ff = Number(fatherFeet);
      const fi = Number(fatherInches);
      if (
        Number.isFinite(mf) &&
        Number.isFinite(mi) &&
        Number.isFinite(ff) &&
        Number.isFinite(fi)
      ) {
        mCm = convertFeetInchesToCm(mf, mi);
        fCm = convertFeetInchesToCm(ff, fi);
      } else {
        return null;
      }
    } else {
      const m = Number(motherCm);
      const f = Number(fatherCm);
      if (
        !Number.isFinite(m) ||
        !Number.isFinite(f)
      ) {
        return null;
      }
      mCm = m;
      fCm = f;
    }
    return predictChildHeight(mCm, fCm, sex);
  }, [
    fatherCm,
    fatherFeet,
    fatherInches,
    motherCm,
    motherFeet,
    motherInches,
    sex,
    unit
  ]);

  const meanLabel =
    prediction != null
      ? (() => {
          const cm = Math.round(
            prediction.meanCm
          );
          const inchesTotal =
            prediction.meanCm / CM_PER_INCH;
          const ft = Math.floor(inchesTotal / 12);
          const inch = Math.round(
            inchesTotal - ft * 12
          );
          return `${cm} cm • ${ft}′${inch}″`;
        })()
      : "Add both parent heights to see a prediction.";

  const rangeLabel =
    prediction != null
      ? (() => {
          const minCm = Math.round(
            prediction.rangeCm.min
          );
          const maxCm = Math.round(
            prediction.rangeCm.max
          );
          const minFt = convertCmToFeetInches(
            prediction.rangeCm.min
          );
          const maxFt = convertCmToFeetInches(
            prediction.rangeCm.max
          );
          return `${minCm}–${maxCm} cm (${minFt.feet}′${minFt.inches}″ – ${maxFt.feet}′${maxFt.inches}″)`;
        })()
      : "";

  return (
    <section
      id={id}
      className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-sm md:p-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-50">
            Height predictor
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Estimate your child&apos;s adult height using the
            mid-parental height formula and a normal
            distribution to show a likely range.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-300">Child sex:</span>
          <div className="inline-flex rounded-full bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setSex("boy")}
              className={`rounded-full px-2.5 py-0.5 ${
                sex === "boy"
                  ? "bg-emerald-500 text-slate-900"
                  : "text-slate-300"
              }`}
            >
              Boy
            </button>
            <button
              type="button"
              onClick={() => setSex("girl")}
              className={`rounded-full px-2.5 py-0.5 ${
                sex === "girl"
                  ? "bg-emerald-500 text-slate-900"
                  : "text-slate-300"
              }`}
            >
              Girl
            </button>
          </div>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold">Units:</span>
            <div className="inline-flex rounded-full bg-slate-800 p-1">
              <button
                type="button"
                onClick={() =>
                  setUnit("imperial")
                }
                className={`rounded-full px-2.5 py-0.5 ${
                  unit === "imperial"
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-300"
                }`}
              >
                ft / in
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`rounded-full px-2.5 py-0.5 ${
                  unit === "cm"
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-300"
                }`}
              >
                cm
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">
                Mother&apos;s height
              </p>
              {unit === "imperial" ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={motherFeet}
                    onChange={(event) =>
                      setMotherFeet(event.target.value)
                    }
                    className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
                    placeholder="ft"
                    min={0}
                  />
                  <input
                    type="number"
                    value={motherInches}
                    onChange={(event) =>
                      setMotherInches(
                        event.target.value
                      )
                    }
                    className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
                    placeholder="in"
                    min={0}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  value={motherCm}
                  onChange={(event) =>
                    setMotherCm(event.target.value)
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
                  placeholder="cm"
                  min={0}
                />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">
                Father&apos;s height
              </p>
              {unit === "imperial" ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={fatherFeet}
                    onChange={(event) =>
                      setFatherFeet(event.target.value)
                    }
                    className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
                    placeholder="ft"
                    min={0}
                  />
                  <input
                    type="number"
                    value={fatherInches}
                    onChange={(event) =>
                      setFatherInches(
                        event.target.value
                      )
                    }
                    className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
                    placeholder="in"
                    min={0}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  value={fatherCm}
                  onChange={(event) =>
                    setFatherCm(event.target.value)
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
                  placeholder="cm"
                  min={0}
                />
              )}
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs font-semibold text-slate-200">
            Predicted adult height
          </p>
          <p className="text-lg font-semibold text-slate-50">
            {prediction ? meanLabel : "—"}
          </p>
          {prediction && (
            <p className="text-xs text-slate-300">
              Likely range (≈95% of children):{" "}
              {rangeLabel}
            </p>
          )}
          {prediction && (
            <div className="mt-3">
              <ChartHeight
                prediction={prediction}
                unit={unit}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeightPredictor;


