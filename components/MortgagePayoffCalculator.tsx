"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type TermMode = "15" | "30" | "custom";

type CalculationMode = "standard" | "extra";

type AmortizationRow = {
  paymentNumber: number;
  dateLabel: string;
  payment: number;
  extraPayment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
};

type ScheduleSummary = {
  totalInterest: number;
  totalPaid: number;
  months: number;
  payoffDateLabel: string;
};

type ScheduleResult = {
  rows: AmortizationRow[];
  summary: ScheduleSummary;
};

type CalculatorState = {
  loanAmountInput: string;
  aprInput: string;
  termMode: TermMode;
  customYearsInput: string;
  startDateInput: string;
  overridePaymentEnabled: boolean;
  paymentOverrideInput: string;
  extraMonthlyInput: string;
  extraOneTimeInput: string;
  extraOneTimeMonthInput: string;
  activeScheduleView: CalculationMode;
};

const createTodayDateInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parsePositiveNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return NaN;
  }
  const numeric = Number.parseFloat(trimmed.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : NaN;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2
});

const formatDateLabel = (startDate: Date | null, offsetMonths: number) => {
  if (!startDate) {
    return `Month ${offsetMonths + 1}`;
  }
  const date = new Date(startDate.getTime());
  date.setMonth(date.getMonth() + offsetMonths);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short"
  });
};

const buildSchedule = (
  principal: number,
  monthlyRate: number,
  basePayment: number,
  extraMonthly: number,
  extraOneTime: number,
  extraOneTimeMonthIndex: number,
  termMonths: number,
  startDate: Date | null
): ScheduleResult => {
  const rows: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let monthIndex = 0;

  const maxMonths = termMonths + 240;

  while (balance > 0 && monthIndex < maxMonths) {
    const interest = balance * monthlyRate;
    const isOneTimeMonth = monthIndex === extraOneTimeMonthIndex;
    const extraThisMonth =
      extraMonthly +
      (isOneTimeMonth && extraOneTime > 0 ? extraOneTime : 0);
    const rawPrincipal = basePayment + extraThisMonth - interest;
    const principalPortion =
      rawPrincipal > balance ? balance : rawPrincipal > 0 ? rawPrincipal : 0;
    const paymentThisMonth =
      principalPortion + interest > 0 ? principalPortion + interest : 0;
    const newBalance = balance - principalPortion;

    rows.push({
      paymentNumber: monthIndex + 1,
      dateLabel: formatDateLabel(startDate, monthIndex),
      payment: paymentThisMonth,
      extraPayment: extraThisMonth,
      interest,
      principal: principalPortion,
      remainingBalance: newBalance > 0 ? newBalance : 0
    });

    totalInterest += interest;
    totalPaid += paymentThisMonth;
    balance = newBalance;
    monthIndex += 1;

    if (newBalance <= 0.01) {
      balance = 0;
    }
  }

  const payoffDateLabel =
    startDate && rows.length > 0
      ? formatDateLabel(startDate, rows.length - 1)
      : rows.length > 0
      ? `Month ${rows.length}`
      : "—";

  return {
    rows,
    summary: {
      totalInterest,
      totalPaid,
      months: rows.length,
      payoffDateLabel
    }
  };
};

export default function MortgagePayoffCalculator() {
  const todayInput = useMemo(() => createTodayDateInput(), []);

  const [state, setState] = useState<CalculatorState>({
    loanAmountInput: "400000",
    aprInput: "6.5",
    termMode: "30",
    customYearsInput: "25",
    startDateInput: todayInput,
    overridePaymentEnabled: false,
    paymentOverrideInput: "",
    extraMonthlyInput: "0",
    extraOneTimeInput: "",
    extraOneTimeMonthInput: "12",
    activeScheduleView: "standard"
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const parsedStartDate = useMemo(() => {
    if (!state.startDateInput) {
      return null;
    }
    const date = new Date(state.startDateInput);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [state.startDateInput]);

  const calculation = useMemo(() => {
    const principal = parsePositiveNumber(state.loanAmountInput);
    const apr = parsePositiveNumber(state.aprInput);

    let termYears =
      state.termMode === "15"
        ? 15
        : state.termMode === "30"
        ? 30
        : parsePositiveNumber(state.customYearsInput);

    if (!Number.isFinite(termYears)) {
      termYears = NaN;
    }

    const extraMonthlyRaw = parsePositiveNumber(state.extraMonthlyInput);
    const extraMonthly =
      Number.isFinite(extraMonthlyRaw) && extraMonthlyRaw > 0
        ? extraMonthlyRaw
        : 0;

    const extraOneTimeRaw = parsePositiveNumber(state.extraOneTimeInput);
    const extraOneTime =
      Number.isFinite(extraOneTimeRaw) && extraOneTimeRaw > 0
        ? extraOneTimeRaw
        : 0;

    const extraOneTimeMonthIndexRaw = Number.parseInt(
      state.extraOneTimeMonthInput.trim(),
      10
    );
    const extraOneTimeMonthIndex =
      Number.isFinite(extraOneTimeMonthIndexRaw) &&
      extraOneTimeMonthIndexRaw > 0
        ? extraOneTimeMonthIndexRaw - 1
        : 0;

    const monthlyRate =
      Number.isFinite(apr) && apr > 0 ? apr / 100 / 12 : 0;

    const termMonths =
      Number.isFinite(termYears) && termYears > 0
        ? Math.round(termYears * 12)
        : NaN;

    if (!Number.isFinite(principal) || principal <= 0) {
      setValidationError("Enter a positive loan amount.");
      return null;
    }
    if (!Number.isFinite(termMonths) || termMonths <= 0) {
      setValidationError("Enter a valid loan term in years.");
      return null;
    }
    if (!Number.isFinite(apr) || apr < 0) {
      setValidationError("Enter a non-negative interest rate.");
      return null;
    }

    let basePayment = 0;
    if (state.overridePaymentEnabled) {
      const override = parsePositiveNumber(state.paymentOverrideInput);
      if (!Number.isFinite(override) || override <= 0) {
        setValidationError(
          "Enter a positive monthly payment when override is enabled."
        );
        return null;
      }
      if (monthlyRate > 0 && override <= principal * monthlyRate) {
        setValidationError(
          "Monthly payment must be greater than the first month of interest, or the loan will never be paid off."
        );
        return null;
      }
      basePayment = override;
    } else {
      if (monthlyRate > 0) {
        const factor = (1 + monthlyRate) ** termMonths;
        basePayment =
          (principal * monthlyRate * factor) / (factor - 1);
      } else {
        basePayment = principal / termMonths;
      }
    }

    setValidationError(null);

    const standard = buildSchedule(
      principal,
      monthlyRate,
      basePayment,
      0,
      0,
      0,
      termMonths,
      parsedStartDate
    );

    const hasAnyExtras =
      extraMonthly > 0 || extraOneTime > 0;

    const extra = hasAnyExtras
      ? buildSchedule(
          principal,
          monthlyRate,
          basePayment,
          extraMonthly,
          extraOneTime,
          extraOneTimeMonthIndex,
          termMonths,
          parsedStartDate
        )
      : null;

    return {
      principal,
      apr,
      termYears,
      termMonths,
      monthlyRate,
      basePayment,
      extraMonthly,
      extraOneTime,
      hasAnyExtras,
      standard,
      extra
    };
  }, [
    parsedStartDate,
    state.aprInput,
    state.customYearsInput,
    state.extraMonthlyInput,
    state.extraOneTimeInput,
    state.extraOneTimeMonthInput,
    state.loanAmountInput,
    state.overridePaymentEnabled,
    state.paymentOverrideInput,
    state.termMode
  ]);

  const combinedChartData = useMemo(() => {
    if (!calculation) {
      return [];
    }
    const { standard, extra } = calculation;
    const maxLength = extra
      ? Math.max(standard.rows.length, extra.rows.length)
      : standard.rows.length;

    const data = [];
    for (let index = 0; index < maxLength; index += 1) {
      const standardRow = standard.rows[index];
      const extraRow = extra?.rows[index];
      data.push({
        name: `#${index + 1}`,
        standardBalance:
          standardRow?.remainingBalance ?? null,
        extraBalance: extraRow?.remainingBalance ?? null
      });
    }
    return data;
  }, [calculation]);

  const activeScheduleRows =
    state.activeScheduleView === "extra" &&
    calculation?.extra &&
    calculation.hasAnyExtras
      ? calculation.extra.rows
      : calculation?.standard.rows ?? [];

  const activeSummary =
    state.activeScheduleView === "extra" &&
    calculation?.extra &&
    calculation.hasAnyExtras
      ? calculation.extra.summary
      : calculation?.standard.summary ?? null;

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="space-y-8">
      <section
        aria-label="Mortgage inputs"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Loan details
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="loanAmount"
              className="text-xs font-medium text-slate-700"
            >
              Loan amount
            </label>
            <input
              id="loanAmount"
              type="number"
              min={0}
              step="1000"
              value={state.loanAmountInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  loanAmountInput: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="e.g. 400000"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="apr"
              className="text-xs font-medium text-slate-700"
            >
              Interest rate (APR, %)
            </label>
            <input
              id="apr"
              type="number"
              min={0}
              step="0.01"
              value={state.aprInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  aprInput: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="e.g. 6.5"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Loan term
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    termMode: "15"
                  }))
                }
                className={`rounded-md border px-2 py-1 text-xs transition ${
                  state.termMode === "15"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                15 years
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    termMode: "30"
                  }))
                }
                className={`rounded-md border px-2 py-1 text-xs transition ${
                  state.termMode === "30"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                30 years
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    termMode: "custom"
                  }))
                }
                className={`rounded-md border px-2 py-1 text-xs transition ${
                  state.termMode === "custom"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                Custom
              </button>
            </div>
            {state.termMode === "custom" && (
              <div className="mt-2 space-y-1">
                <label
                  htmlFor="customYears"
                  className="text-[11px] font-medium text-slate-700"
                >
                  Custom term (years)
                </label>
                <input
                  id="customYears"
                  type="number"
                  min={1}
                  step="1"
                  value={state.customYearsInput}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      customYearsInput: event.target.value
                    }))
                  }
                  className={inputBaseClasses}
                  placeholder="e.g. 20"
                />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label
              htmlFor="startDate"
              className="text-xs font-medium text-slate-700"
            >
              Loan start date
            </label>
            <input
              id="startDate"
              type="date"
              value={state.startDateInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  startDateInput: event.target.value
                }))
              }
              className={inputBaseClasses}
            />
            <p className="text-[11px] text-slate-500">
              Used for payment dates and payoff date labels.
            </p>
          </div>
        </div>
      </section>
      <section
        aria-label="Payment settings"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Payment settings
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Monthly payment
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step="10"
                value={
                  state.overridePaymentEnabled
                    ? state.paymentOverrideInput
                    : calculation
                    ? numberFormatter.format(calculation.basePayment)
                    : ""
                }
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    paymentOverrideInput: event.target.value
                  }))
                }
                className={`${inputBaseClasses} ${
                  state.overridePaymentEnabled
                    ? ""
                    : "bg-slate-100 text-slate-700"
                }`}
                readOnly={!state.overridePaymentEnabled}
              />
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    overridePaymentEnabled:
                      !previous.overridePaymentEnabled
                  }))
                }
                className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
              >
                {state.overridePaymentEnabled
                  ? "Lock formula"
                  : "Override"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Default uses the standard mortgage formula. Override if you want
              to explore a different monthly amount.
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="extraMonthly"
              className="text-xs font-medium text-slate-700"
            >
              Extra monthly payment
            </label>
            <input
              id="extraMonthly"
              type="number"
              min={0}
              step="25"
              value={state.extraMonthlyInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  extraMonthlyInput: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="e.g. 200"
            />
            <p className="text-[11px] text-slate-500">
              Applied with every payment from month 1 until payoff.
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="extraOneTime"
              className="text-xs font-medium text-slate-700"
            >
              One-time extra payment
            </label>
            <input
              id="extraOneTime"
              type="number"
              min={0}
              step="100"
              value={state.extraOneTimeInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  extraOneTimeInput: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="e.g. 5000"
            />
            <div className="mt-2 space-y-1">
              <label
                htmlFor="extraOneTimeMonth"
                className="text-[11px] font-medium text-slate-700"
              >
                Applied with payment #
              </label>
              <input
                id="extraOneTimeMonth"
                type="number"
                min={1}
                step="1"
                value={state.extraOneTimeMonthInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    extraOneTimeMonthInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
                placeholder="e.g. 12"
              />
            </div>
          </div>
        </div>
        {validationError && (
          <p className="text-xs font-medium text-red-600">
            {validationError}
          </p>
        )}
      </section>
      {calculation && !validationError && (
        <>
          <section
            aria-label="Summary"
            className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2"
          >
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Standard schedule
              </h2>
              <div className="grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Monthly payment
                  </p>
                  <p className="text-base font-semibold">
                    {currencyFormatter.format(
                      calculation.basePayment
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total interest
                  </p>
                  <p className="text-base font-semibold">
                    {currencyFormatter.format(
                      calculation.standard.summary.totalInterest
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total paid
                  </p>
                  <p className="text-base font-semibold">
                    {currencyFormatter.format(
                      calculation.standard.summary.totalPaid
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Payoff date
                  </p>
                  <p className="text-base font-semibold">
                    {
                      calculation.standard.summary
                        .payoffDateLabel
                    }
                  </p>
                </div>
              </div>
            </div>
            {calculation.hasAnyExtras && calculation.extra && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  With extra payments
                </h2>
                <div className="grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Effective monthly payment
                    </p>
                    <p className="text-base font-semibold">
                      {currencyFormatter.format(
                        calculation.basePayment +
                          calculation.extraMonthly
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Total interest
                    </p>
                    <p className="text-base font-semibold">
                      {currencyFormatter.format(
                        calculation.extra.summary.totalInterest
                      )}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Interest saved:{" "}
                      {currencyFormatter.format(
                        calculation.standard.summary
                          .totalInterest -
                          calculation.extra.summary.totalInterest
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Payoff date
                    </p>
                    <p className="text-base font-semibold">
                      {
                        calculation.extra.summary
                          .payoffDateLabel
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Time saved
                    </p>
                    <p className="text-base font-semibold">
                      {calculation.standard.summary.months -
                        calculation.extra.summary.months}{" "}
                      months
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
          <section
            aria-label="Charts"
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Balance over time
            </h2>
            <p className="text-xs text-slate-600">
              See how your remaining balance drops over time with the standard payment,
              and how much faster it falls when you add extra payments.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value: number) =>
                      value >= 1000
                        ? `${Math.round(value / 1000)}k`
                        : String(Math.round(value))
                    }
                  />
                  <Tooltip
                    formatter={(value: number | null) =>
                      value !== null
                        ? currencyFormatter.format(value)
                        : ""
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="standardBalance"
                    name="Standard"
                    stroke="#0f766e"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  {calculation.hasAnyExtras && (
                    <Line
                      type="monotone"
                      dataKey="extraBalance"
                      name="With extra payments"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section
            aria-label="Amortization table"
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Amortization schedule
              </h2>
              {calculation.hasAnyExtras && calculation.extra && (
                <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setState((previous) => ({
                        ...previous,
                        activeScheduleView: "standard"
                      }))
                    }
                    className={`px-3 py-1 ${
                      state.activeScheduleView === "standard"
                        ? "rounded-l-md bg-white font-semibold text-slate-900"
                        : "text-slate-700"
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((previous) => ({
                        ...previous,
                        activeScheduleView: "extra"
                      }))
                    }
                    className={`px-3 py-1 ${
                      state.activeScheduleView === "extra"
                        ? "rounded-r-md bg-white font-semibold text-slate-900"
                        : "text-slate-700"
                    }`}
                  >
                    With extras
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      #
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Payment
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Extra
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Principal
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Interest
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeScheduleRows.map((row) => (
                    <tr key={row.paymentNumber}>
                      <td className="whitespace-nowrap px-3 py-1 text-slate-800">
                        {row.paymentNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1 text-slate-800">
                        {row.dateLabel}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                        {currencyFormatter.format(row.payment)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                        {row.extraPayment > 0
                          ? currencyFormatter.format(
                              row.extraPayment
                            )
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                        {currencyFormatter.format(row.principal)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                        {currencyFormatter.format(row.interest)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                        {currencyFormatter.format(
                          row.remainingBalance
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activeSummary && (
              <p className="text-[11px] text-slate-600">
                Showing {activeSummary.months} payments from{" "}
                {activeScheduleRows[0]?.dateLabel ?? "start"} to{" "}
                {activeSummary.payoffDateLabel}.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}


