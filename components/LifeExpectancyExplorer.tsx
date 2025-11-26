"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type CountryCode,
  type LifestyleProfile,
  type Sex,
  type SurvivalPoint,
  adjustRemainingYearsForLifestyle,
  buildSurvivalCurve,
  estimateRemainingYearsBaseline,
  probabilityOfReachingAge
} from "@/lib/lifeExpectancyLogic";

const PROFILE_STORAGE_KEY =
  "lht_life_expectancy_profile_v1";

type StoredProfile = {
  age: number;
  sex: Sex;
  country: CountryCode;
  lifestyle: LifestyleProfile;
  targetAge: number;
};

const sexOptions: { id: Sex; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other / unspecified" }
];

const countryOptions: {
  id: CountryCode;
  label: string;
}[] = [
  { id: "US", label: "United States" },
  { id: "CA", label: "Canada" },
  { id: "UK", label: "United Kingdom" },
  { id: "AU", label: "Australia" },
  { id: "EU", label: "European Union (avg)" },
  { id: "WORLD", label: "World average" }
];

const LifeExpectancyExplorer = () => {
  const [ageInput, setAgeInput] = useState("35");
  const [sex, setSex] = useState<Sex>("male");
  const [country, setCountry] =
    useState<CountryCode>("US");
  const [lifestyle, setLifestyle] =
    useState<LifestyleProfile>({
      smoking: "never",
      exercise: "moderate",
      bmiBand: "normal",
      alcohol: "moderate",
      stress: "medium"
    });
  const [targetAge, setTargetAge] =
    useState<number>(85);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw =
      window.localStorage.getItem(
        PROFILE_STORAGE_KEY
      );
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as StoredProfile;
    if (
      typeof parsed.age === "number" &&
      typeof parsed.targetAge === "number" &&
      typeof parsed.sex === "string" &&
      typeof parsed.country === "string" &&
      parsed.lifestyle
    ) {
      setAgeInput(
        String(
          Math.min(
            100,
            Math.max(18, Math.round(parsed.age))
          )
        )
      );
      setSex(parsed.sex as Sex);
      setCountry(parsed.country as CountryCode);
      setLifestyle(parsed.lifestyle);
      setTargetAge(parsed.targetAge);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const ageNumeric = Number(ageInput);
    if (!Number.isFinite(ageNumeric)) {
      return;
    }
    const stored: StoredProfile = {
      age: ageNumeric,
      sex,
      country,
      lifestyle,
      targetAge
    };
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(stored)
    );
  }, [ageInput, sex, country, lifestyle, targetAge]);

  const age = Number(ageInput);
  const ageValid =
    Number.isFinite(age) &&
    age >= 18 &&
    age <= 100;

  const baselineRemaining = useMemo(() => {
    if (!ageValid) {
      return 0;
    }
    return estimateRemainingYearsBaseline(
      age,
      sex,
      country
    );
  }, [age, ageValid, sex, country]);

  const {
    adjustedRemaining,
    deltaYears
  } = useMemo(() => {
    if (!ageValid || baselineRemaining <= 0) {
      return {
        adjustedRemaining: 0,
        deltaYears: 0
      };
    }
    return adjustRemainingYearsForLifestyle(
      baselineRemaining,
      lifestyle,
      age
    );
  }, [
    age,
    ageValid,
    baselineRemaining,
    lifestyle
  ]);

  const expectedLifeBaseline =
    ageValid && baselineRemaining > 0
      ? age + baselineRemaining
      : 0;
  const expectedLifeAdjusted =
    ageValid && adjustedRemaining > 0
      ? age + adjustedRemaining
      : 0;

  const range = useMemo(() => {
    if (!ageValid || adjustedRemaining <= 0) {
      return { low: 0, high: 0 };
    }
    const center = expectedLifeAdjusted;
    const halfSpan = 7;
    const low = Math.max(
      age + 5,
      center - halfSpan
    );
    const high = Math.min(100, center + halfSpan);
    return { low, high };
  }, [
    age,
    ageValid,
    adjustedRemaining,
    expectedLifeAdjusted
  ]);

  const survivalCurve: SurvivalPoint[] = useMemo(
    () => {
      if (!ageValid || expectedLifeAdjusted <= 0) {
        return [];
      }
      return buildSurvivalCurve(
        age,
        expectedLifeAdjusted,
        range
      );
    },
    [age, ageValid, expectedLifeAdjusted, range]
  );

  const targetProbability = useMemo(() => {
    if (
      !ageValid ||
      expectedLifeAdjusted <= 0 ||
      survivalCurve.length === 0
    ) {
      return 0;
    }
    return probabilityOfReachingAge(
      targetAge,
      survivalCurve
    );
  }, [
    ageValid,
    expectedLifeAdjusted,
    survivalCurve,
    targetAge
  ]);

  const handleLifestyleChange = <
    T extends keyof LifestyleProfile
  >(
    key: T,
    value: LifestyleProfile[T]
  ) => {
    setLifestyle((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const formatYears = (value: number): string =>
    value.toFixed(1);

  const formatAge = (value: number): string =>
    value.toFixed(1);

  const baselineText =
    ageValid && baselineRemaining > 0
      ? `${formatAge(
          expectedLifeBaseline
        )} years`
      : "—";

  const adjustedText =
    ageValid && adjustedRemaining > 0
      ? `${formatAge(
          expectedLifeAdjusted
        )} years`
      : "—";

  const remainingText =
    ageValid && adjustedRemaining > 0
      ? `${formatYears(
          adjustedRemaining
        )} years`
      : "—";

  const targetProbabilityText =
    targetProbability > 0
      ? `${Math.round(
          targetProbability * 100
        )}%`
      : "—";

  const deltaText =
    deltaYears === 0
      ? "about the same as baseline"
      : deltaYears > 0
      ? `about +${formatYears(
          deltaYears
        )} years vs baseline`
      : `about ${formatYears(
          deltaYears
        )} years vs baseline`;

  const renderSurvivalChart = () => {
    if (survivalCurve.length < 2) {
      return null;
    }
    const width = 360;
    const height = 200;
    const marginLeft = 38;
    const marginRight = 12;
    const marginTop = 12;
    const marginBottom = 22;
    const innerWidth =
      width - marginLeft - marginRight;
    const innerHeight =
      height - marginTop - marginBottom;
    const minAge = survivalCurve[0].age;
    const maxAge =
      survivalCurve[survivalCurve.length - 1].age;
    const ageSpan = Math.max(
      1,
      maxAge - minAge
    );
    const pathD = survivalCurve
      .map((point, index) => {
        const x =
          marginLeft +
          ((point.age - minAge) / ageSpan) *
            innerWidth;
        const y =
          marginTop +
          (1 - point.survivalProbability) *
            innerHeight;
        const command = index === 0 ? "M" : "L";
        return `${command} ${x} ${y}`;
      })
      .join(" ");
    const xForAge = (value: number): number =>
      marginLeft +
      ((value - minAge) / ageSpan) *
        innerWidth;
    const yForProb = (probability: number): number =>
      marginTop +
      (1 - probability) * innerHeight;
    const xCurrent = xForAge(age);
    const xExpected = xForAge(
      expectedLifeAdjusted
    );
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        aria-label="Estimated survival curve"
      >
        <defs>
          <linearGradient
            id="survivalArea"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="#22c55e"
              stopOpacity="0.45"
            />
            <stop
              offset="100%"
              stopColor="#22c55e"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={10}
          fill="#020617"
        />
        <g>
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={marginLeft}
            y2={marginTop + innerHeight}
            stroke="#1f2937"
            strokeWidth={1}
          />
          <line
            x1={marginLeft}
            y1={marginTop + innerHeight}
            x2={marginLeft + innerWidth}
            y2={marginTop + innerHeight}
            stroke="#1f2937"
            strokeWidth={1}
          />
          {[0, 0.5, 1].map((probability) => {
            const y = yForProb(probability);
            return (
              <g key={probability}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={marginLeft + innerWidth}
                  y2={y}
                  stroke="#111827"
                  strokeWidth={0.5}
                  strokeDasharray="2 4"
                />
                <text
                  x={marginLeft - 6}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-slate-400 text-[9px]"
                >
                  {Math.round(
                    probability * 100
                  )}
                  %
                </text>
              </g>
            );
          })}
          <path
            d={`${pathD} L ${
              marginLeft +
              innerWidth
            } ${marginTop + innerHeight} L ${
              marginLeft
            } ${marginTop + innerHeight} Z`}
            fill="url(#survivalArea)"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
          />
          <line
            x1={xExpected}
            y1={marginTop}
            x2={xExpected}
            y2={marginTop + innerHeight}
            stroke="#38bdf8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <circle
            cx={xCurrent}
            cy={yForProb(1)}
            r={3.5}
            fill="#f97316"
          />
          <text
            x={xCurrent}
            y={yForProb(1) - 6}
            textAnchor="middle"
            className="fill-orange-300 text-[9px]"
          >
            Current age
          </text>
          <text
            x={xExpected}
            y={marginTop + 10}
            textAnchor="middle"
            className="fill-sky-300 text-[9px]"
          >
            Expected life
          </text>
          <text
            x={marginLeft}
            y={marginTop + innerHeight + 14}
            className="fill-slate-400 text-[9px]"
          >
            Age
          </text>
          <text
            x={marginLeft + innerWidth}
            y={marginTop + innerHeight + 14}
            textAnchor="end"
            className="fill-slate-400 text-[9px]"
          >
            {maxAge}+
          </text>
        </g>
      </svg>
    );
  };

  const renderComparisonBars = () => {
    if (
      !ageValid ||
      baselineRemaining <= 0 ||
      adjustedRemaining <= 0
    ) {
      return null;
    }
    const maxYears = Math.max(
      baselineRemaining,
      adjustedRemaining
    );
    const widthFor = (value: number): string =>
      `${Math.max(
        8,
        (value / maxYears) * 100
      ).toFixed(1)}%`;
    return (
      <div className="space-y-2 text-xs text-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-100">
            Baseline remaining years
          </span>
          <span className="font-mono">
            {formatYears(
              baselineRemaining
            )}{" "}
            years
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800">
          <div
            className="h-3 rounded-full bg-slate-500"
            style={{
              width: widthFor(baselineRemaining)
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-medium text-slate-100">
            With your lifestyle inputs
          </span>
          <span className="font-mono">
            {formatYears(adjustedRemaining)}{" "}
            years
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800">
          <div
            className="h-3 rounded-full bg-emerald-500"
            style={{
              width: widthFor(adjustedRemaining)
            }}
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-300">
          Overall, your profile looks{" "}
          <span className="font-semibold">
            {deltaText}
          </span>
          .
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-sm">
        <p className="font-semibold">
          Educational and entertainment only
        </p>
        <p className="mt-1">
          This life expectancy explorer uses approximate
          population statistics and simple models. It is not
          medical advice, does not account for your full
          health history, and should never replace a
          conversation with a doctor or licensed clinician.
        </p>
      </div>
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-1 shadow-xl ring-1 ring-slate-800/80">
        <div className="space-y-6 rounded-[1.6rem] bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
              Health &amp; lifestyle tools
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
              Life Expectancy Explorer
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              Explore how age, sex, country and lifestyle
              choices can shift your estimated remaining years
              of life. These estimates are based on population
              averages, not individual prediction.
            </p>
          </header>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs sm:p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Inputs
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Basic information
                  </h4>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Age
                    </span>
                    <input
                      type="number"
                      min={18}
                      max={100}
                      value={ageInput}
                      onChange={(event) =>
                        setAgeInput(
                          event.target.value
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    />
                    <span className="block text-[10px] text-slate-400">
                      This explorer is designed for adults
                      18–100 years old.
                    </span>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Sex at birth
                    </span>
                    <select
                      value={sex}
                      onChange={(event) =>
                        setSex(
                          event.target
                            .value as Sex
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      {sexOptions.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Country / region
                    </span>
                    <select
                      value={country}
                      onChange={(event) =>
                        setCountry(
                          event.target
                            .value as CountryCode
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      {countryOptions.map((option) => (
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
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Lifestyle snapshot
                  </h4>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Smoking
                    </span>
                    <select
                      value={lifestyle.smoking}
                      onChange={(event) =>
                        handleLifestyleChange(
                          "smoking",
                          event.target
                            .value as LifestyleProfile["smoking"]
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      <option value="never">
                        Never
                      </option>
                      <option value="former">
                        Former
                      </option>
                      <option value="light">
                        Current (light)
                      </option>
                      <option value="heavy">
                        Current (heavy)
                      </option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Exercise level
                    </span>
                    <select
                      value={lifestyle.exercise}
                      onChange={(event) =>
                        handleLifestyleChange(
                          "exercise",
                          event.target
                            .value as LifestyleProfile["exercise"]
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      <option value="sedentary">
                        Sedentary
                      </option>
                      <option value="light">
                        Light (1–2x/week)
                      </option>
                      <option value="moderate">
                        Moderate (3–4x/week)
                      </option>
                      <option value="high">
                        High (5+ intense sessions/week)
                      </option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Weight / BMI band
                    </span>
                    <select
                      value={lifestyle.bmiBand}
                      onChange={(event) =>
                        handleLifestyleChange(
                          "bmiBand",
                          event.target
                            .value as LifestyleProfile["bmiBand"]
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      <option value="underweight">
                        Underweight
                      </option>
                      <option value="normal">
                        Normal range
                      </option>
                      <option value="overweight">
                        Overweight
                      </option>
                      <option value="obese">
                        Obese
                      </option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Alcohol
                    </span>
                    <select
                      value={lifestyle.alcohol}
                      onChange={(event) =>
                        handleLifestyleChange(
                          "alcohol",
                          event.target
                            .value as LifestyleProfile["alcohol"]
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      <option value="none">
                        None / rare
                      </option>
                      <option value="moderate">
                        Moderate
                      </option>
                      <option value="heavy">
                        Heavy
                      </option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Stress &amp; sleep
                    </span>
                    <select
                      value={lifestyle.stress}
                      onChange={(event) =>
                        handleLifestyleChange(
                          "stress",
                          event.target
                            .value as LifestyleProfile["stress"]
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      <option value="low">
                        Low stress, good sleep
                      </option>
                      <option value="medium">
                        Moderate stress
                      </option>
                      <option value="high">
                        High stress / poor sleep
                      </option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <label className="flex flex-col gap-1 text-[11px] text-slate-200 sm:flex-row sm:items-center">
                  <span className="font-medium">
                    Target age for probability
                  </span>
                  <div className="flex flex-1 items-center gap-3">
                    <input
                      type="range"
                      min={ageValid ? age : 18}
                      max={100}
                      value={targetAge}
                      onChange={(event) =>
                        setTargetAge(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="h-1 flex-1 cursor-pointer rounded-full bg-slate-700 accent-emerald-500"
                    />
                    <span className="w-10 text-right font-mono text-xs">
                      {targetAge}
                    </span>
                  </div>
                </label>
                <p className="text-[10px] text-slate-400">
                  Move the slider to see the estimated
                  probability of reaching a specific age.
                </p>
              </div>
            </section>
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs sm:p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Estimated outlook
              </h3>
              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Summary
                </p>
                {ageValid &&
                adjustedRemaining > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-50">
                      Estimated life expectancy:{" "}
                      <span className="text-emerald-300">
                        {adjustedText}
                      </span>
                    </p>
                    <p className="text-sm text-slate-200">
                      Estimated remaining time:{" "}
                      <span className="font-semibold text-slate-50">
                        {remainingText}
                      </span>
                    </p>
                    {range.low > 0 &&
                      range.high > 0 && (
                        <p className="text-[11px] text-slate-300">
                          Likely range (rough 80–90% of
                          people with similar profiles):
                          {" "}
                          <span className="font-semibold">
                            {formatAge(
                              range.low
                            )}
                            {"–"}
                            {formatAge(
                              range.high
                            )}{" "}
                            years
                          </span>
                          .
                        </p>
                      )}
                    <p className="text-[11px] text-slate-300">
                      Probability of reaching age{" "}
                      <span className="font-semibold">
                        {targetAge}
                      </span>
                      :{" "}
                      <span className="font-semibold text-emerald-300">
                        {targetProbabilityText}
                      </span>
                      .
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Numbers are approximate and based on
                      population averages, not guarantees for
                      any one person.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300">
                    Enter an age between 18 and 100 to see
                    estimates.
                  </p>
                )}
              </div>
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Baseline vs lifestyle-adjusted years
                </p>
                <p className="text-[11px] text-slate-300">
                  Baseline is based only on your age, sex and
                  country. The adjusted estimate layers in your
                  selected lifestyle snapshot.
                </p>
                {renderComparisonBars()}
                <p className="text-[10px] text-slate-400">
                  These lifestyle adjustments are
                  intentionally conservative and simplified.
                  They cannot capture every medical or genetic
                  factor.
                </p>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Survival curve
                </p>
                <p className="text-[11px] text-slate-300">
                  This curve shows the estimated probability of
                  still being alive at each future age,
                  assuming your profile stays similar over
                  time.
                </p>
                {renderSurvivalChart()}
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-sm">
        <p className="font-semibold">
          Not a medical device
        </p>
        <p className="mt-1">
          This calculator cannot diagnose conditions, estimate
          personal risk with precision, or replace
          professional medical guidance. If you have questions
          about your health or risk factors, talk with your
          doctor or another licensed clinician.
        </p>
      </div>
    </div>
  );
};

export default LifeExpectancyExplorer;


