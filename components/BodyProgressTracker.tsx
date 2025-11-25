"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ExportableImageFrame from "./ExportableImageFrame";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very"
  | "athlete";

type Sex = "male" | "female" | "other" | null;

type UnitSystem = "metric" | "imperial";

type UserProfile = {
  heightCm: number | null;
  sex: Sex;
  age: number | null;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
};

type BodyEntry = {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number | null;
  chestCm?: number | null;
  hipsCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
};

type GoalType = "lose" | "maintain" | "gain";

type GoalSettings = {
  targetWeightKg: number | null;
  goalType: GoalType;
  pacePerWeekKg: number | null;
};

type BodyProgressState = {
  profile: UserProfile;
  entries: BodyEntry[];
  goal: GoalSettings;
};

type EntryFormState = {
  idBeingEdited: string | null;
  dateInput: string;
  weightInput: string;
  waistInput: string;
  chestInput: string;
  hipsInput: string;
  armInput: string;
  thighInput: string;
};

const STORAGE_KEY = "lht_body_progress_tracker_v1";

const createTodayInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const parsePositiveNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return NaN;
  }
  const numeric = Number.parseFloat(trimmed.replace(/,/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : NaN;
};

const kgFromWeightInput = (weight: number, unitSystem: UnitSystem) =>
  unitSystem === "metric" ? weight : weight / 2.20462;

const weightForDisplay = (weightKg: number, unitSystem: UnitSystem) =>
  unitSystem === "metric" ? weightKg : weightKg * 2.20462;

const cmFromLengthInput = (length: number, unitSystem: UnitSystem) =>
  unitSystem === "metric" ? length : length * 2.54;

const lengthForDisplay = (lengthCm: number | null, unitSystem: UnitSystem) => {
  if (lengthCm === null || lengthCm === undefined) {
    return null;
  }
  return unitSystem === "metric" ? lengthCm : lengthCm / 2.54;
};

const computeBmi = (weightKg: number, heightCm: number | null) => {
  if (!heightCm || heightCm <= 0) {
    return NaN;
  }
  const heightMeters = heightCm / 100;
  if (heightMeters <= 0) {
    return NaN;
  }
  return weightKg / (heightMeters * heightMeters);
};

const bmiCategory = (bmi: number) => {
  if (!Number.isFinite(bmi)) {
    return "—";
  }
  if (bmi < 18.5) {
    return "Underweight";
  }
  if (bmi < 25) {
    return "Normal";
  }
  if (bmi < 30) {
    return "Overweight";
  }
  return "Obese";
};

const activityFactorMap: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9
};

const computeBmr = (
  sex: Sex,
  weightKg: number | null,
  heightCm: number | null,
  age: number | null
) => {
  if (!weightKg || !heightCm || !age || age <= 0) {
    return NaN;
  }
  if (sex === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  if (sex === "female") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return NaN;
};

const computeTdee = (bmr: number, activityLevel: ActivityLevel) => {
  if (!Number.isFinite(bmr) || bmr <= 0) {
    return NaN;
  }
  return bmr * activityFactorMap[activityLevel];
};

const computeGoalCalories = (
  tdee: number,
  goal: GoalSettings
) => {
  if (!Number.isFinite(tdee) || tdee <= 0) {
    return NaN;
  }
  if (!goal.pacePerWeekKg || goal.pacePerWeekKg <= 0) {
    return tdee;
  }
  const dailyDelta = (goal.pacePerWeekKg * 7700) / 7;
  if (goal.goalType === "lose") {
    return tdee - dailyDelta;
  }
  if (goal.goalType === "gain") {
    return tdee + dailyDelta;
  }
  return tdee;
};

const formatDateRangeLabel = (entries: BodyEntry[]) => {
  if (entries.length === 0) {
    return "No data yet";
  }
  const sorted = [...entries].sort((first, second) =>
    first.date.localeCompare(second.date)
  );
  const start = new Date(sorted[0].date);
  const end = new Date(sorted[sorted.length - 1].date);
  const formatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  if (sorted.length === 1) {
    return formatter.format(start);
  }
  return `${formatter.format(start)} – ${formatter.format(end)}`;
};

const BodyProgressTracker = () => {
  const [state, setState] = useState<BodyProgressState>({
    profile: {
      heightCm: null,
      sex: null,
      age: null,
      activityLevel: "sedentary",
      unitSystem: "metric"
    },
    entries: [],
    goal: {
      targetWeightKg: null,
      goalType: "maintain",
      pacePerWeekKg: null
    }
  });

  const [entryForm, setEntryForm] = useState<EntryFormState>({
    idBeingEdited: null,
    dateInput: createTodayInput(),
    weightInput: "",
    waistInput: "",
    chestInput: "",
    hipsInput: "",
    armInput: "",
    thighInput: ""
  });

  const [entryError, setEntryError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const exportFrameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setHasHydrated(true);
      return;
    }
    const parsed = JSON.parse(raw) as BodyProgressState;
    if (parsed && parsed.profile && parsed.entries && parsed.goal) {
      setState(parsed);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const toStore: BodyProgressState = {
      profile: state.profile,
      entries: state.entries,
      goal: state.goal
    };
    const serialized = JSON.stringify(toStore);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [hasHydrated, state]);

  const sortedEntries = useMemo(
    () =>
      [...state.entries].sort((first, second) =>
        first.date.localeCompare(second.date)
      ),
    [state.entries]
  );

  const latestEntry =
    sortedEntries.length > 0
      ? sortedEntries[sortedEntries.length - 1]
      : null;

  const firstEntry = sortedEntries.length > 0 ? sortedEntries[0] : null;

  const latestBmi = latestEntry
    ? computeBmi(latestEntry.weightKg, state.profile.heightCm)
    : NaN;

  const bmr = computeBmr(
    state.profile.sex,
    latestEntry ? latestEntry.weightKg : null,
    state.profile.heightCm,
    state.profile.age
  );

  const tdee = computeTdee(bmr, state.profile.activityLevel);

  const goalCalories = computeGoalCalories(tdee, state.goal);

  const weightChartData = sortedEntries.map((entry) => ({
    date: entry.date,
    weight: weightForDisplay(
      entry.weightKg,
      state.profile.unitSystem
    ),
    bmi: computeBmi(entry.weightKg, state.profile.heightCm)
  }));

  const goalLineData =
    state.goal.targetWeightKg && sortedEntries.length > 0
      ? [
          {
            date: sortedEntries[0].date,
            target: weightForDisplay(
              state.goal.targetWeightKg,
              state.profile.unitSystem
            )
          },
          {
            date: sortedEntries[sortedEntries.length - 1].date,
            target: weightForDisplay(
              state.goal.targetWeightKg,
              state.profile.unitSystem
            )
          }
        ]
      : [];

  const estimatedGoal = useMemo(() => {
    if (
      !state.goal.targetWeightKg ||
      !state.goal.pacePerWeekKg ||
      !latestEntry
    ) {
      return null;
    }
    const currentWeight = latestEntry.weightKg;
    const delta = state.goal.targetWeightKg - currentWeight;
    if (state.goal.goalType === "maintain" || delta === 0) {
      return {
        weeks: 0,
        targetDate: latestEntry.date
      };
    }
    const distanceKg = Math.abs(delta);
    if (distanceKg === 0) {
      return {
        weeks: 0,
        targetDate: latestEntry.date
      };
    }
    const weeks = distanceKg / state.goal.pacePerWeekKg;
    const baseDate = latestEntry.date
      ? new Date(latestEntry.date)
      : new Date();
    const target = new Date(
      baseDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000
    );
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    return {
      weeks,
      targetDate: formatter.format(target)
    };
  }, [latestEntry, state.goal]);

  const weightChangeSummary = useMemo(() => {
    if (!firstEntry || !latestEntry) {
      return null;
    }
    const changeKg = latestEntry.weightKg - firstEntry.weightKg;
    const first = new Date(firstEntry.date);
    const last = new Date(latestEntry.date);
    const days =
      (last.getTime() - first.getTime()) /
      (1000 * 60 * 60 * 24);
    const weeks = days > 0 ? days / 7 : 0;
    const perWeekKg = weeks > 0 ? changeKg / weeks : 0;
    return {
      changeKg,
      perWeekKg
    };
  }, [firstEntry, latestEntry]);

  const handleProfileChange = <Key extends keyof UserProfile>(
    key: Key,
    value: UserProfile[Key]
  ) => {
    setState((previous) => ({
      ...previous,
      profile: {
        ...previous.profile,
        [key]: value
      }
    }));
  };

  const handleGoalChange = <Key extends keyof GoalSettings>(
    key: Key,
    value: GoalSettings[Key]
  ) => {
    setState((previous) => ({
      ...previous,
      goal: {
        ...previous.goal,
        [key]: value
      }
    }));
  };

  const handleEntryInputChange = <
    Key extends keyof EntryFormState
  >(
    key: Key,
    value: EntryFormState[Key]
  ) => {
    setEntryForm((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const handleAddOrUpdateEntry = () => {
    setEntryError(null);
    const parsedWeight = parsePositiveNumber(
      entryForm.weightInput
    );
    if (!Number.isFinite(parsedWeight)) {
      setEntryError("Enter a positive weight value.");
      return;
    }
    const weightKg = kgFromWeightInput(
      parsedWeight,
      state.profile.unitSystem
    );
    const waistNumeric = parsePositiveNumber(
      entryForm.waistInput
    );
    const chestNumeric = parsePositiveNumber(
      entryForm.chestInput
    );
    const hipsNumeric = parsePositiveNumber(
      entryForm.hipsInput
    );
    const armNumeric = parsePositiveNumber(
      entryForm.armInput
    );
    const thighNumeric = parsePositiveNumber(
      entryForm.thighInput
    );

    const entry: BodyEntry = {
      id: entryForm.idBeingEdited ?? createId(),
      date: entryForm.dateInput,
      weightKg,
      waistCm: Number.isFinite(waistNumeric)
        ? cmFromLengthInput(
            waistNumeric,
            state.profile.unitSystem
          )
        : null,
      chestCm: Number.isFinite(chestNumeric)
        ? cmFromLengthInput(
            chestNumeric,
            state.profile.unitSystem
          )
        : null,
      hipsCm: Number.isFinite(hipsNumeric)
        ? cmFromLengthInput(
            hipsNumeric,
            state.profile.unitSystem
          )
        : null,
      armCm: Number.isFinite(armNumeric)
        ? cmFromLengthInput(
            armNumeric,
            state.profile.unitSystem
          )
        : null,
      thighCm: Number.isFinite(thighNumeric)
        ? cmFromLengthInput(
            thighNumeric,
            state.profile.unitSystem
          )
        : null
    };

    setState((previous) => {
      const existingIndex = previous.entries.findIndex(
        (current) => current.date === entry.date
      );
      let nextEntries: BodyEntry[];
      if (existingIndex >= 0) {
        const copy = [...previous.entries];
        copy[existingIndex] = {
          ...copy[existingIndex],
          ...entry
        };
        nextEntries = copy;
      } else {
        nextEntries = [...previous.entries, entry];
      }
      return {
        ...previous,
        entries: nextEntries
      };
    });

    setEntryForm((previous) => ({
      ...previous,
      idBeingEdited: null,
      dateInput: createTodayInput(),
      weightInput: "",
      waistInput: "",
      chestInput: "",
      hipsInput: "",
      armInput: "",
      thighInput: ""
    }));
  };

  const handleEditEntry = (entryId: string) => {
    const entry = state.entries.find(
      (current) => current.id === entryId
    );
    if (!entry) {
      return;
    }
    const unitSystem = state.profile.unitSystem;
    const weightDisplay = weightForDisplay(
      entry.weightKg,
      unitSystem
    );
    const waistDisplay = lengthForDisplay(
      entry.waistCm ?? null,
      unitSystem
    );
    const chestDisplay = lengthForDisplay(
      entry.chestCm ?? null,
      unitSystem
    );
    const hipsDisplay = lengthForDisplay(
      entry.hipsCm ?? null,
      unitSystem
    );
    const armDisplay = lengthForDisplay(
      entry.armCm ?? null,
      unitSystem
    );
    const thighDisplay = lengthForDisplay(
      entry.thighCm ?? null,
      unitSystem
    );
    setEntryForm({
      idBeingEdited: entry.id,
      dateInput: entry.date,
      weightInput: weightDisplay
        ? String(weightDisplay.toFixed(1))
        : "",
      waistInput:
        waistDisplay !== null
          ? String(waistDisplay.toFixed(1))
          : "",
      chestInput:
        chestDisplay !== null
          ? String(chestDisplay.toFixed(1))
          : "",
      hipsInput:
        hipsDisplay !== null
          ? String(hipsDisplay.toFixed(1))
          : "",
      armInput:
        armDisplay !== null
          ? String(armDisplay.toFixed(1))
          : "",
      thighInput:
        thighDisplay !== null
          ? String(thighDisplay.toFixed(1))
          : ""
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setState((previous) => ({
      ...previous,
      entries: previous.entries.filter(
        (entry) => entry.id !== entryId
      )
    }));
  };

  const handleExportCsv = () => {
    if (sortedEntries.length === 0) {
      return;
    }
    const unitSystem = state.profile.unitSystem;
    const heightCm = state.profile.heightCm;
    const header =
      unitSystem === "metric"
        ? "date,weight_kg,waist_cm,chest_cm,hips_cm,arm_cm,thigh_cm,bmi"
        : "date,weight_lb,waist_in,chest_in,hips_in,arm_in,thigh_in,bmi";

    const lines = sortedEntries.map((entry) => {
      const weightDisplay = weightForDisplay(
        entry.weightKg,
        unitSystem
      );
      const bmi = computeBmi(entry.weightKg, heightCm);
      const waistDisplay = lengthForDisplay(
        entry.waistCm ?? null,
        unitSystem
      );
      const chestDisplay = lengthForDisplay(
        entry.chestCm ?? null,
        unitSystem
      );
      const hipsDisplay = lengthForDisplay(
        entry.hipsCm ?? null,
        unitSystem
      );
      const armDisplay = lengthForDisplay(
        entry.armCm ?? null,
        unitSystem
      );
      const thighDisplay = lengthForDisplay(
        entry.thighCm ?? null,
        unitSystem
      );
      const values = [
        entry.date,
        weightDisplay ? weightDisplay.toFixed(2) : "",
        waistDisplay ? waistDisplay.toFixed(1) : "",
        chestDisplay ? chestDisplay.toFixed(1) : "",
        hipsDisplay ? hipsDisplay.toFixed(1) : "",
        armDisplay ? armDisplay.toFixed(1) : "",
        thighDisplay ? thighDisplay.toFixed(1) : "",
        Number.isFinite(bmi) ? bmi.toFixed(2) : ""
      ];
      return values.join(",");
    });

    const csvContent = [header, ...lines].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = createTodayInput();
    link.href = url;
    link.download = `lifehacktoolbox-body-progress-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportImage = async () => {
    if (!exportFrameRef.current) {
      return;
    }
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(exportFrameRef.current, {
      backgroundColor: "#ffffff",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lifehacktoolbox-body-progress.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const unitSuffixWeight =
    state.profile.unitSystem === "metric" ? "kg" : "lb";

  const unitSuffixLength =
    state.profile.unitSystem === "metric" ? "cm" : "in";

  const profileHeightDisplay = (() => {
    const height = state.profile.heightCm;
    if (!height) {
      return "";
    }
    if (state.profile.unitSystem === "metric") {
      return String(height);
    }
    const inchesTotal = height / 2.54;
    const feet = Math.floor(inchesTotal / 12);
    const inches = Math.round(inchesTotal - feet * 12);
    return `${feet}'${inches}"`;
  })();

  const latestWeightDisplay =
    latestEntry &&
    weightForDisplay(
      latestEntry.weightKg,
      state.profile.unitSystem
    );

  const goalDistanceKg =
    latestEntry && state.goal.targetWeightKg
      ? latestEntry.weightKg - state.goal.targetWeightKg
      : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Local storage only. Export regularly.
        </p>
        <p>
          Your body progress data is stored only in this browser using local
          storage. Clearing browser data or switching devices may remove your
          history. Export a CSV or image periodically to keep your own backup.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Profile &amp; goals
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-700">
                Unit system
              </p>
              <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
                <button
                  type="button"
                  onClick={() => handleProfileChange("unitSystem", "metric")}
                  className={`px-3 py-1 ${
                    state.profile.unitSystem === "metric"
                      ? "rounded-l-md bg-white font-semibold text-slate-900"
                      : "text-slate-700"
                  }`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => handleProfileChange("unitSystem", "imperial")}
                  className={`px-3 py-1 ${
                    state.profile.unitSystem === "imperial"
                      ? "rounded-r-md bg-white font-semibold text-slate-900"
                      : "text-slate-700"
                  }`}
                >
                  Imperial
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Height ({unitSuffixLength})
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={
                  state.profile.heightCm
                    ? state.profile.unitSystem === "metric"
                      ? state.profile.heightCm
                      : (state.profile.heightCm / 2.54).toFixed(1)
                    : ""
                }
                onChange={(event) => {
                  const numeric = parsePositiveNumber(
                    event.target.value
                  );
                  const heightCm = Number.isFinite(numeric)
                    ? cmFromLengthInput(
                        numeric,
                        state.profile.unitSystem
                      )
                    : null;
                  handleProfileChange("heightCm", heightCm);
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder={
                  state.profile.unitSystem === "metric"
                    ? "e.g. 175"
                    : "e.g. 69"
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Sex
              </label>
              <select
                value={state.profile.sex ?? ""}
                onChange={(event) =>
                  handleProfileChange(
                    "sex",
                    event.target.value
                      ? (event.target.value as Sex)
                      : null
                  )
                }
                className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / prefer not to say</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Age
              </label>
              <input
                type="number"
                min={0}
                step="1"
                value={state.profile.age ?? ""}
                onChange={(event) =>
                  handleProfileChange(
                    "age",
                    Number.parseInt(event.target.value, 10) || null
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. 32"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Activity level
              </label>
              <select
                value={state.profile.activityLevel}
                onChange={(event) =>
                  handleProfileChange(
                    "activityLevel",
                    event.target.value as ActivityLevel
                  )
                }
                className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (1–3 days/week)</option>
                <option value="moderate">Moderate (3–5 days/week)</option>
                <option value="very">Very active (6–7 days/week)</option>
                <option value="athlete">Athlete / twice-daily</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Latest stats
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  Latest weight:{" "}
                  {latestWeightDisplay
                    ? `${latestWeightDisplay.toFixed(1)} ${unitSuffixWeight}`
                    : "—"}
                </p>
                <p>
                  BMI:{" "}
                  {Number.isFinite(latestBmi)
                    ? `${latestBmi.toFixed(1)} (${bmiCategory(latestBmi)})`
                    : "—"}
                </p>
                {weightChangeSummary && (
                  <p>
                    Change since first entry:{" "}
                    {weightChangeSummary.changeKg >= 0 ? "+" : "-"}
                    {Math.abs(
                      weightForDisplay(
                        weightChangeSummary.changeKg,
                        state.profile.unitSystem
                      )
                    ).toFixed(1)}{" "}
                    {unitSuffixWeight} (
                    {weightChangeSummary.perWeekKg >= 0 ? "+" : "-"}
                    {Math.abs(
                      weightForDisplay(
                        weightChangeSummary.perWeekKg,
                        state.profile.unitSystem
                      )
                    ).toFixed(2)}{" "}
                    {state.profile.unitSystem === "metric"
                      ? "kg"
                      : "lb"}
                    /week)
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Calories
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  BMR:{" "}
                  {Number.isFinite(bmr) ? `${bmr.toFixed(0)} kcal/day` : "—"}
                </p>
                <p>
                  TDEE (estimated):{" "}
                  {Number.isFinite(tdee) ? `${tdee.toFixed(0)} kcal/day` : "—"}
                </p>
                <p>
                  Goal calories:{" "}
                  {Number.isFinite(goalCalories)
                    ? `${goalCalories.toFixed(0)} kcal/day`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3 rounded-md bg-slate-50 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Goal settings
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Target weight ({unitSuffixWeight})
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={
                    state.goal.targetWeightKg
                      ? weightForDisplay(
                          state.goal.targetWeightKg,
                          state.profile.unitSystem
                        ).toFixed(1)
                      : ""
                  }
                  onChange={(event) => {
                    const numeric = parsePositiveNumber(
                      event.target.value
                    );
                    const target =
                      Number.isFinite(numeric) && numeric > 0
                        ? kgFromWeightInput(
                            numeric,
                            state.profile.unitSystem
                          )
                        : null;
                    handleGoalChange("targetWeightKg", target);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder={
                    state.profile.unitSystem === "metric"
                      ? "e.g. 72.5"
                      : "e.g. 160"
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Goal type
                </label>
                <select
                  value={state.goal.goalType}
                  onChange={(event) =>
                    handleGoalChange(
                      "goalType",
                      event.target.value as GoalType
                    )
                  }
                  className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="lose">Lose weight</option>
                  <option value="maintain">Maintain</option>
                  <option value="gain">Gain weight</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Pace per week
                </label>
                <div className="flex gap-2">
                  <select
                    value={
                      state.goal.pacePerWeekKg
                        ? state.goal.pacePerWeekKg
                        : ""
                    }
                    onChange={(event) => {
                      const numeric = Number.parseFloat(
                        event.target.value
                      );
                      handleGoalChange(
                        "pacePerWeekKg",
                        Number.isFinite(numeric) && numeric > 0
                          ? numeric
                          : null
                      );
                    }}
                    className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Custom</option>
                    <option value={0.11}>~0.25 lb/week</option>
                    <option value={0.23}>~0.5 lb/week</option>
                    <option value={0.34}>~0.75 lb/week</option>
                    <option value={0.45}>~1.0 lb/week</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    step="0.05"
                    value={
                      state.goal.pacePerWeekKg ?? ""
                    }
                    onChange={(event) => {
                      const numeric = parsePositiveNumber(
                        event.target.value
                      );
                      handleGoalChange(
                        "pacePerWeekKg",
                        Number.isFinite(numeric) && numeric > 0
                          ? numeric
                          : null
                      );
                    }}
                    className="w-28 rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="kg/week"
                  />
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-700">
                <p>
                  Estimated weeks to goal:{" "}
                  {estimatedGoal
                    ? estimatedGoal.weeks.toFixed(1)
                    : "—"}
                </p>
                <p>
                  Estimated goal date:{" "}
                  {estimatedGoal ? estimatedGoal.targetDate : "—"}
                </p>
                <p>
                  Distance from goal:{" "}
                  {goalDistanceKg !== null
                    ? `${weightForDisplay(
                        Math.abs(goalDistanceKg),
                        state.profile.unitSystem
                      ).toFixed(1)} ${unitSuffixWeight} ${
                        goalDistanceKg > 0 ? "above" : "below"
                      } target`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Log entries
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={entryForm.dateInput}
                onChange={(event) =>
                  handleEntryInputChange(
                    "dateInput",
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Weight ({unitSuffixWeight})
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={entryForm.weightInput}
                onChange={(event) =>
                  handleEntryInputChange(
                    "weightInput",
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Waist ({unitSuffixLength}, optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={entryForm.waistInput}
                onChange={(event) =>
                  handleEntryInputChange(
                    "waistInput",
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Chest ({unitSuffixLength}, optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={entryForm.chestInput}
                onChange={(event) =>
                  handleEntryInputChange(
                    "chestInput",
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Hips ({unitSuffixLength}, optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={entryForm.hipsInput}
                onChange={(event) =>
                  handleEntryInputChange(
                    "hipsInput",
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Arm ({unitSuffixLength}, optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={entryForm.armInput}
                onChange={(event) =>
                  handleEntryInputChange(
                    "armInput",
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Thigh ({unitSuffixLength}, optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={entryForm.thighInput}
                onChange={(event) =>
                  handleEntryInputChange(
                    "thighInput",
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          {entryError && (
            <p className="text-xs font-medium text-red-600">
              {entryError}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddOrUpdateEntry}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {entryForm.idBeingEdited ? "Save entry" : "Add entry"}
            </button>
            {entryForm.idBeingEdited && (
              <button
                type="button"
                onClick={() =>
                  setEntryForm((previous) => ({
                    ...previous,
                    idBeingEdited: null,
                    weightInput: "",
                    waistInput: "",
                    chestInput: "",
                    hipsInput: "",
                    armInput: "",
                    thighInput: ""
                  }))
                }
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400"
              >
                Cancel edit
              </button>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Recent entries
            </h3>
            <div className="max-h-64 overflow-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Weight
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      BMI
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Waist
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedEntries
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((entry) => {
                      const bmi = computeBmi(
                        entry.weightKg,
                        state.profile.heightCm
                      );
                      const weight = weightForDisplay(
                        entry.weightKg,
                        state.profile.unitSystem
                      );
                      const waist = lengthForDisplay(
                        entry.waistCm ?? null,
                        state.profile.unitSystem
                      );
                      return (
                        <tr key={entry.id}>
                          <td className="whitespace-nowrap px-3 py-1 text-slate-800">
                            {entry.date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                            {weight
                              ? `${weight.toFixed(1)} ${unitSuffixWeight}`
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                            {Number.isFinite(bmi)
                              ? bmi.toFixed(1)
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                            {waist
                              ? `${waist.toFixed(1)} ${unitSuffixLength}`
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditEntry(entry.id)
                                }
                                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteEntry(entry.id)
                                }
                                className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {sortedEntries.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-3 text-center text-xs text-slate-500"
                      >
                        No entries yet. Add your first weight entry to get
                        started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Progress charts &amp; exports
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Export data as CSV
            </button>
            <button
              type="button"
              onClick={handleExportImage}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Download progress image
            </button>
          </div>
        </div>
        <ExportableImageFrame
          ref={exportFrameRef}
          title={`Body Progress – ${formatDateRangeLabel(
            sortedEntries
          )}`}
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Weight over time
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value: number) =>
                        `${value.toFixed(0)}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number | string) =>
                        typeof value === "number"
                          ? `${value.toFixed(1)} ${unitSuffixWeight}`
                          : value
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="Weight"
                      stroke="#0f766e"
                      strokeWidth={1.5}
                      dot={{ r: 2 }}
                    />
                    {goalLineData.length > 0 && (
                      <Line
                        type="linear"
                        data={goalLineData}
                        dataKey="target"
                        name="Target weight"
                        stroke="#f97316"
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Snapshot
              </h3>
              <div className="space-y-1 text-xs text-slate-700">
                <p>
                  Latest weight:{" "}
                  {latestWeightDisplay
                    ? `${latestWeightDisplay.toFixed(1)} ${unitSuffixWeight}`
                    : "—"}
                </p>
                <p>
                  Change since first entry:{" "}
                  {weightChangeSummary
                    ? `${weightForDisplay(
                        weightChangeSummary.changeKg,
                        state.profile.unitSystem
                      ).toFixed(1)} ${unitSuffixWeight}`
                    : "—"}
                </p>
                <p>
                  BMI:{" "}
                  {Number.isFinite(latestBmi)
                    ? `${latestBmi.toFixed(1)} (${bmiCategory(latestBmi)})`
                    : "—"}
                </p>
                <p>
                  Goal distance:{" "}
                  {goalDistanceKg !== null
                    ? `${weightForDisplay(
                        Math.abs(goalDistanceKg),
                        state.profile.unitSystem
                      ).toFixed(1)} ${unitSuffixWeight} ${
                        goalDistanceKg > 0 ? "above" : "below"
                      }`
                    : "—"}
                </p>
                <p>
                  Estimated goal date:{" "}
                  {estimatedGoal ? estimatedGoal.targetDate : "—"}
                </p>
                <p>
                  Goal calories:{" "}
                  {Number.isFinite(goalCalories)
                    ? `${goalCalories.toFixed(0)} kcal/day`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </ExportableImageFrame>
        {state.profile.heightCm && weightChartData.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              BMI over time
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    domain={[10, 40]}
                  />
                  <Tooltip
                    formatter={(value: number | string) =>
                      typeof value === "number"
                        ? value.toFixed(1)
                        : value
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="bmi"
                    name="BMI"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Remember to keep your own backups.
        </p>
        <p>
          Your body progress data is stored only in this browser using local
          storage. Clearing browser data or switching devices may remove your
          history. Export a CSV or image periodically so you always have a copy.
        </p>
      </div>
    </div>
  );
};

export default BodyProgressTracker;


