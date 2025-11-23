"use client";

import { useState } from "react";

type FilingStatus = "single" | "married";

type LocationKey = "us_generic" | "california" | "texas" | "new_york";

type TaxBracket = {
  upTo: number | null;
  rate: number;
};

type CalculationResult = {
  gross: {
    hourly: number;
    weekly: number;
    biWeekly: number;
    monthly: number;
    yearly: number;
  };
  taxes: {
    federal: number;
    state: number;
    fica: number;
    total: number;
  };
  net: {
    yearly: number;
    monthly: number;
    biWeekly: number;
    weekly: number;
  };
};

const federalBracketsSingle: TaxBracket[] = [
  { upTo: 11000, rate: 0.1 },
  { upTo: 44725, rate: 0.12 },
  { upTo: 95375, rate: 0.22 },
  { upTo: 182100, rate: 0.24 },
  { upTo: 231250, rate: 0.32 },
  { upTo: 578125, rate: 0.35 },
  { upTo: null, rate: 0.37 }
];

const federalBracketsMarried: TaxBracket[] = [
  { upTo: 22000, rate: 0.1 },
  { upTo: 89450, rate: 0.12 },
  { upTo: 190750, rate: 0.22 },
  { upTo: 364200, rate: 0.24 },
  { upTo: 462500, rate: 0.32 },
  { upTo: 693750, rate: 0.35 },
  { upTo: null, rate: 0.37 }
];

const stateRates: Record<LocationKey, number> = {
  us_generic: 0.04,
  california: 0.065,
  texas: 0,
  new_york: 0.055
};

const ficaRate = 0.0765;

function calculateProgressiveTax(income: number, brackets: TaxBracket[]) {
  let remaining = income;
  let lastCap = 0;
  let tax = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) {
      return tax;
    }

    if (bracket.upTo === null) {
      tax += remaining * bracket.rate;
      return tax;
    }

    const width = bracket.upTo - lastCap;
    const taxableHere = Math.min(remaining, width);

    if (taxableHere > 0) {
      tax += taxableHere * bracket.rate;
      remaining -= taxableHere;
    }

    lastCap = bracket.upTo;
  }

  return tax;
}

function formatCurrency(value: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  return formatter.format(Math.round(value));
}

function formatCurrencyWithCents(value: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return formatter.format(value);
}

export default function HourlySalaryTaxCalculator() {
  const [hourlyWage, setHourlyWage] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [location, setLocation] = useState<LocationKey>("us_generic");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    const hourlyRaw = parseFloat(hourlyWage.replace(",", "."));
    const hoursRaw = parseFloat(hoursPerWeek);
    const weeksRaw = parseFloat(weeksPerYear);

    const safeHourly = Number.isFinite(hourlyRaw) ? Math.max(0, hourlyRaw) : 0;
    const safeHours = Number.isFinite(hoursRaw) ? Math.max(0, hoursRaw) : 0;
    const safeWeeks = Number.isFinite(weeksRaw) ? Math.max(0, weeksRaw) : 0;

    if (safeHourly <= 0) {
      setError("Enter an hourly wage greater than 0 to calculate.");
      setResult(null);
      return;
    }

    setError(null);

    const grossYearly = safeHourly * safeHours * safeWeeks;
    const grossWeekly = safeHourly * safeHours;
    const grossBiWeekly = grossYearly / 26;
    const grossMonthly = grossYearly / 12;

    const brackets =
      filingStatus === "single"
        ? federalBracketsSingle
        : federalBracketsMarried;

    const estimatedFederalTax = calculateProgressiveTax(
      grossYearly,
      brackets
    );

    const stateRate = stateRates[location];
    const estimatedStateTax = grossYearly * stateRate;
    const estimatedFicaTax = grossYearly * ficaRate;
    const totalTax =
      estimatedFederalTax + estimatedStateTax + estimatedFicaTax;

    const netYearly = grossYearly - totalTax;
    const netMonthly = netYearly / 12;
    const netBiWeekly = netYearly / 26;
    const netWeekly = netYearly / 52;

    setResult({
      gross: {
        hourly: safeHourly,
        weekly: grossWeekly,
        biWeekly: grossBiWeekly,
        monthly: grossMonthly,
        yearly: grossYearly
      },
      taxes: {
        federal: estimatedFederalTax,
        state: estimatedStateTax,
        fica: estimatedFicaTax,
        total: totalTax
      },
      net: {
        yearly: netYearly,
        monthly: netMonthly,
        biWeekly: netBiWeekly,
        weekly: netWeekly
      }
    });
  };

  return (
    <div className="space-y-6">
      <section aria-label="Hourly to salary inputs" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="hourlyWage"
              className="text-sm font-medium text-slate-800"
            >
              Hourly wage
            </label>
            <div className="flex rounded-md border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <span className="flex items-center px-3 text-sm text-slate-500">
                $
              </span>
              <input
                id="hourlyWage"
                type="number"
                min={0}
                step="0.01"
                value={hourlyWage}
                onChange={(event) => setHourlyWage(event.target.value)}
                className="flex-1 rounded-r-md border-0 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                placeholder="e.g. 25"
                inputMode="decimal"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
          <div className="space-y-1">
            <label
              htmlFor="hoursPerWeek"
              className="text-sm font-medium text-slate-800"
            >
              Hours per week
            </label>
            <input
              id="hoursPerWeek"
              type="number"
              min={0}
              step="1"
              value={hoursPerWeek}
              onChange={(event) => setHoursPerWeek(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="40"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="weeksPerYear"
              className="text-sm font-medium text-slate-800"
            >
              Weeks per year
            </label>
            <input
              id="weeksPerYear"
              type="number"
              min={0}
              step="1"
              value={weeksPerYear}
              onChange={(event) => setWeeksPerYear(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="52"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="filingStatus"
              className="text-sm font-medium text-slate-800"
            >
              Filing status
            </label>
            <select
              id="filingStatus"
              value={filingStatus}
              onChange={(event) =>
                setFilingStatus(event.target.value as FilingStatus)
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="single">Single</option>
              <option value="married">Married filing jointly</option>
            </select>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="location"
              className="text-sm font-medium text-slate-800"
            >
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value as LocationKey)
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="us_generic">United States - Generic</option>
              <option value="california">California</option>
              <option value="texas">Texas</option>
              <option value="new_york">New York</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCalculate}
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Calculate
        </button>
        <p className="text-xs text-slate-600">
          Tax calculations are rough estimates based on simplified U.S. federal,
          state, and FICA assumptions and may differ from your actual tax
          situation.
        </p>
      </section>
      {result && (
        <section
          aria-label="Results"
          className="grid gap-6 md:grid-cols-3"
        >
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Gross pay
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm text-slate-800">
              <div className="flex justify-between">
                <dt>Hourly</dt>
                <dd>{formatCurrencyWithCents(result.gross.hourly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Weekly</dt>
                <dd>{formatCurrency(result.gross.weekly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Bi-weekly</dt>
                <dd>{formatCurrency(result.gross.biWeekly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Monthly</dt>
                <dd>{formatCurrency(result.gross.monthly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Yearly</dt>
                <dd>{formatCurrency(result.gross.yearly)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Estimated taxes (annual)
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm text-slate-800">
              <div className="flex justify-between">
                <dt>Federal income tax</dt>
                <dd>{formatCurrency(result.taxes.federal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>State income tax</dt>
                <dd>{formatCurrency(result.taxes.state)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>FICA (Social Security + Medicare)</dt>
                <dd>{formatCurrency(result.taxes.fica)}</dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
                <dt className="font-semibold">Total estimated tax</dt>
                <dd className="font-semibold">
                  {formatCurrency(result.taxes.total)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              Net (take-home)
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm text-emerald-900">
              <div className="flex justify-between">
                <dt>Yearly</dt>
                <dd>{formatCurrency(result.net.yearly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Monthly</dt>
                <dd>{formatCurrency(result.net.monthly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Bi-weekly</dt>
                <dd>{formatCurrency(result.net.biWeekly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Weekly</dt>
                <dd>{formatCurrency(result.net.weekly)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-emerald-900">
              Actual take-home pay depends on many factors including deductions,
              benefits, credits, and local taxes. Use this as a directional
              estimate only.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}


