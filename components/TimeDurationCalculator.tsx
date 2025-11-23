"use client";

import { useMemo, useState } from "react";

type CalculatorMode = "difference" | "add-subtract";

type Operation = "add" | "subtract";

type DifferenceResult = {
  isNegative: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
};

type AddSubtractResult = {
  base: Date;
  result: Date;
  operation: Operation;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type TimeDurationState = {
  mode: CalculatorMode;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  baseDate: string;
  baseTime: string;
  operation: Operation;
  durationDays: string;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
};

const msPerSecond = 1000;
const msPerMinute = msPerSecond * 60;
const msPerHour = msPerMinute * 60;
const msPerDay = msPerHour * 24;

const parseLocalDateTime = (dateString: string, timeString: string) => {
  if (!dateString) {
    return null;
  }
  const trimmedTime = timeString.trim();
  const effectiveTime = trimmedTime === "" ? "00:00" : trimmedTime;
  const isoLike = `${dateString}T${effectiveTime}:00`;
  const value = new Date(isoLike);
  if (Number.isNaN(value.getTime())) {
    return null;
  }
  return value;
};

const clampInt = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return Math.floor(value);
};

const clampNonNegativeInt = (value: number) =>
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

const formatDayOfWeek = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "long"
  });

const createTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TimeDurationCalculator() {
  const todayString = useMemo(() => createTodayString(), []);

  const [state, setState] = useState<TimeDurationState>({
    mode: "difference",
    startDate: todayString,
    startTime: "",
    endDate: todayString,
    endTime: "",
    baseDate: todayString,
    baseTime: "",
    operation: "add",
    durationDays: "0",
    durationHours: "0",
    durationMinutes: "0",
    durationSeconds: "0"
  });

  const [differenceResult, setDifferenceResult] =
    useState<DifferenceResult | null>(null);
  const [differenceError, setDifferenceError] = useState<string | null>(null);

  const [addSubtractResult, setAddSubtractResult] =
    useState<AddSubtractResult | null>(null);
  const [addSubtractError, setAddSubtractError] = useState<string | null>(null);

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const numberInputClasses =
    "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const handleModeChange = (mode: CalculatorMode) => {
    setState((previous) => ({
      ...previous,
      mode
    }));
    setDifferenceError(null);
    setAddSubtractError(null);
  };

  const handleCalculateDifference = () => {
    const start = parseLocalDateTime(state.startDate, state.startTime);
    const end = parseLocalDateTime(state.endDate, state.endTime);

    if (!start || !end) {
      setDifferenceError(
        "Enter valid start and end dates (times optional) to calculate a duration."
      );
      setDifferenceResult(null);
      return;
    }

    setDifferenceError(null);

    const diffMsRaw = end.getTime() - start.getTime();
    const isNegative = diffMsRaw < 0;
    const diffMs = Math.abs(diffMsRaw);

    const days = Math.floor(diffMs / msPerDay);
    let remainder = diffMs - days * msPerDay;

    const hours = Math.floor(remainder / msPerHour);
    remainder -= hours * msPerHour;

    const minutes = Math.floor(remainder / msPerMinute);
    remainder -= minutes * msPerMinute;

    const seconds = Math.floor(remainder / msPerSecond);

    const totalSeconds = diffMs / msPerSecond;
    const totalMinutes = diffMs / msPerMinute;
    const totalHours = diffMs / msPerHour;

    setDifferenceResult({
      isNegative,
      days,
      hours,
      minutes,
      seconds,
      totalHours,
      totalMinutes,
      totalSeconds
    });
  };

  const handleCalculateAddSubtract = () => {
    const base = parseLocalDateTime(state.baseDate, state.baseTime);
    if (!base) {
      setAddSubtractError(
        "Enter a valid base date (time optional) to calculate a new date."
      );
      setAddSubtractResult(null);
      return;
    }

    const days = clampNonNegativeInt(Number.parseFloat(state.durationDays));
    const hours = clampInt(
      Number.parseFloat(state.durationHours),
      0,
      23
    );
    const minutes = clampInt(
      Number.parseFloat(state.durationMinutes),
      0,
      59
    );
    const seconds = clampInt(
      Number.parseFloat(state.durationSeconds),
      0,
      59
    );

    const totalMs =
      (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * msPerSecond;

    setAddSubtractError(null);

    const operation = state.operation;
    const result = new Date(
      operation === "add"
        ? base.getTime() + totalMs
        : base.getTime() - totalMs
    );

    setAddSubtractResult({
      base,
      result,
      operation,
      days,
      hours,
      minutes,
      seconds
    });
  };

  return (
    <div className="space-y-8">
      <section
        aria-label="Mode selection"
        className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Choose mode
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleModeChange("difference")}
            className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm shadow-sm transition ${
              state.mode === "difference"
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
            }`}
          >
            <span className="font-semibold">
              Difference between two dates
            </span>
            <span className="text-xs text-slate-600">
              Find how much time passed between a start and an end date/time.
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("add-subtract")}
            className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm shadow-sm transition ${
              state.mode === "add-subtract"
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
            }`}
          >
            <span className="font-semibold">Add or subtract a duration</span>
            <span className="text-xs text-slate-600">
              Take a base date and move it forward or backward by a set amount of time.
            </span>
          </button>
        </div>
      </section>
      {state.mode === "difference" ? (
        <section
          aria-label="Difference between two dates"
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Difference between two dates/times
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">Start</p>
              <div className="space-y-1">
                <label
                  htmlFor="startDate"
                  className="text-xs font-medium text-slate-700"
                >
                  Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={state.startDate}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      startDate: event.target.value
                    }))
                  }
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="startTime"
                  className="text-xs font-medium text-slate-700"
                >
                  Time (optional)
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={state.startTime}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      startTime: event.target.value
                    }))
                  }
                  className={inputBaseClasses}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">End</p>
              <div className="space-y-1">
                <label
                  htmlFor="endDate"
                  className="text-xs font-medium text-slate-700"
                >
                  Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={state.endDate}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      endDate: event.target.value
                    }))
                  }
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="endTime"
                  className="text-xs font-medium text-slate-700"
                >
                  Time (optional)
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={state.endTime}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      endTime: event.target.value
                    }))
                  }
                  className={inputBaseClasses}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCalculateDifference}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Calculate difference
          </button>
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Result
            </p>
            {differenceError && (
              <p className="text-xs text-red-600">{differenceError}</p>
            )}
            {!differenceError && !differenceResult && (
              <p className="text-sm text-slate-700">
                Enter a start and end date to see the time between them.
              </p>
            )}
            {differenceResult && !differenceError && (
              <div className="space-y-1">
                <p>
                  Difference: {differenceResult.days} days,{" "}
                  {differenceResult.hours} hours, {differenceResult.minutes} minutes,{" "}
                  {differenceResult.seconds} seconds
                  {differenceResult.isNegative && (
                    <span className="text-xs text-amber-700">
                      {" "}
                      (end is earlier than start)
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-700">
                  Total hours: {differenceResult.totalHours.toFixed(2)} – total
                  minutes: {differenceResult.totalMinutes.toFixed(2)} – total
                  seconds: {differenceResult.totalSeconds.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section
          aria-label="Add or subtract duration"
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Add or subtract a duration
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">
                Base date &amp; time
              </p>
              <div className="space-y-1">
                <label
                  htmlFor="baseDate"
                  className="text-xs font-medium text-slate-700"
                >
                  Date
                </label>
                <input
                  id="baseDate"
                  type="date"
                  value={state.baseDate}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      baseDate: event.target.value
                    }))
                  }
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="baseTime"
                  className="text-xs font-medium text-slate-700"
                >
                  Time (optional)
                </label>
                <input
                  id="baseTime"
                  type="time"
                  value={state.baseTime}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      baseTime: event.target.value
                    }))
                  }
                  className={inputBaseClasses}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">
                  Operation
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setState((previous) => ({
                        ...previous,
                        operation: "add"
                      }))
                    }
                    className={`rounded-md border px-3 py-1.5 transition ${
                      state.operation === "add"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                    }`}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((previous) => ({
                        ...previous,
                        operation: "subtract"
                      }))
                    }
                    className={`rounded-md border px-3 py-1.5 transition ${
                      state.operation === "subtract"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                    }`}
                  >
                    Subtract
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">
                  Duration to {state.operation === "add" ? "add" : "subtract"}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="durationDays"
                      className="text-[11px] font-medium text-slate-700"
                    >
                      Days
                    </label>
                    <input
                      id="durationDays"
                      type="number"
                      min={0}
                      step="1"
                      value={state.durationDays}
                      onChange={(event) =>
                        setState((previous) => ({
                          ...previous,
                          durationDays: event.target.value
                        }))
                      }
                      className={numberInputClasses}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label
                      htmlFor="durationHours"
                      className="text-[11px] font-medium text-slate-700"
                    >
                      Hours
                    </label>
                    <input
                      id="durationHours"
                      type="number"
                      min={0}
                      max={23}
                      step="1"
                      value={state.durationHours}
                      onChange={(event) =>
                        setState((previous) => ({
                          ...previous,
                          durationHours: event.target.value
                        }))
                      }
                      className={numberInputClasses}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label
                      htmlFor="durationMinutes"
                      className="text-[11px] font-medium text-slate-700"
                    >
                      Minutes
                    </label>
                    <input
                      id="durationMinutes"
                      type="number"
                      min={0}
                      max={59}
                      step="1"
                      value={state.durationMinutes}
                      onChange={(event) =>
                        setState((previous) => ({
                          ...previous,
                          durationMinutes: event.target.value
                        }))
                      }
                      className={numberInputClasses}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label
                      htmlFor="durationSeconds"
                      className="text-[11px] font-medium text-slate-700"
                    >
                      Seconds
                    </label>
                    <input
                      id="durationSeconds"
                      type="number"
                      min={0}
                      max={59}
                      step="1"
                      value={state.durationSeconds}
                      onChange={(event) =>
                        setState((previous) => ({
                          ...previous,
                          durationSeconds: event.target.value
                        }))
                      }
                      className={numberInputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCalculateAddSubtract}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Calculate new date &amp; time
          </button>
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Result
            </p>
            {addSubtractError && (
              <p className="text-xs text-red-600">{addSubtractError}</p>
            )}
            {!addSubtractError && !addSubtractResult && (
              <p className="text-sm text-slate-700">
                Enter a base date and a duration to see the new date and time.
              </p>
            )}
            {addSubtractResult && !addSubtractError && (
              <div className="space-y-1">
                <p>
                  Base:{" "}
                  <span className="font-medium">
                    {formatDayOfWeek(addSubtractResult.base)},{" "}
                    {formatDate(addSubtractResult.base)} at{" "}
                    {formatTime(addSubtractResult.base)}
                  </span>
                </p>
                <p>
                  {addSubtractResult.operation === "add" ? "Plus" : "Minus"}{" "}
                  {addSubtractResult.days} days,{" "}
                  {addSubtractResult.hours} hours,{" "}
                  {addSubtractResult.minutes} minutes,{" "}
                  {addSubtractResult.seconds} seconds
                </p>
                <p>
                  Result:{" "}
                  <span className="font-medium">
                    {formatDayOfWeek(addSubtractResult.result)},{" "}
                    {formatDate(addSubtractResult.result)} at{" "}
                    {formatTime(addSubtractResult.result)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}


