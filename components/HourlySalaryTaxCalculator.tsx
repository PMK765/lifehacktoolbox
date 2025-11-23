"use client";

import { useState } from "react";

type FilingStatus = "single" | "married";

type CalculationMode = "hourly" | "salary";

type LocationKey =
  | "us_generic"
  | "al"
  | "ak"
  | "az"
  | "ar"
  | "ca"
  | "co"
  | "ct"
  | "de"
  | "fl"
  | "ga"
  | "hi"
  | "id"
  | "il"
  | "in"
  | "ia"
  | "ks"
  | "ky"
  | "la"
  | "me"
  | "md"
  | "ma"
  | "mi"
  | "mn"
  | "ms"
  | "mo"
  | "mt"
  | "ne"
  | "nv"
  | "nh"
  | "nj"
  | "nm"
  | "ny"
  | "nc"
  | "nd"
  | "oh"
  | "ok"
  | "or"
  | "pa"
  | "ri"
  | "sc"
  | "sd"
  | "tn"
  | "tx"
  | "ut"
  | "vt"
  | "va"
  | "wa"
  | "wv"
  | "wi"
  | "wy"
  | "dc";

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
    hourly: number;
  };
};

type LocationOption = {
  key: LocationKey;
  label: string;
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

const stateTaxRates: Record<LocationKey, number> = {
  us_generic: 0.04,
  al: 0.04,
  ak: 0,
  az: 0.03,
  ar: 0.04,
  ca: 0.067,
  co: 0.044,
  ct: 0.05,
  de: 0.045,
  fl: 0,
  ga: 0.045,
  hi: 0.06,
  id: 0.045,
  il: 0.04,
  in: 0.032,
  ia: 0.04,
  ks: 0.045,
  ky: 0.045,
  la: 0.035,
  me: 0.055,
  md: 0.047,
  ma: 0.05,
  mi: 0.042,
  mn: 0.055,
  ms: 0.04,
  mo: 0.04,
  mt: 0.045,
  ne: 0.05,
  nv: 0,
  nh: 0,
  nj: 0.055,
  nm: 0.04,
  ny: 0.058,
  nc: 0.045,
  nd: 0.025,
  oh: 0.03,
  ok: 0.035,
  or: 0.07,
  pa: 0.031,
  ri: 0.045,
  sc: 0.04,
  sd: 0,
  tn: 0,
  tx: 0,
  ut: 0.045,
  vt: 0.055,
  va: 0.045,
  wa: 0,
  wv: 0.045,
  wi: 0.05,
  wy: 0,
  dc: 0.06
};

const locationOptions: LocationOption[] = [
  { key: "us_generic", label: "United States – Generic" },
  { key: "al", label: "Alabama" },
  { key: "ak", label: "Alaska" },
  { key: "az", label: "Arizona" },
  { key: "ar", label: "Arkansas" },
  { key: "ca", label: "California" },
  { key: "co", label: "Colorado" },
  { key: "ct", label: "Connecticut" },
  { key: "de", label: "Delaware" },
  { key: "fl", label: "Florida" },
  { key: "ga", label: "Georgia" },
  { key: "hi", label: "Hawaii" },
  { key: "id", label: "Idaho" },
  { key: "il", label: "Illinois" },
  { key: "in", label: "Indiana" },
  { key: "ia", label: "Iowa" },
  { key: "ks", label: "Kansas" },
  { key: "ky", label: "Kentucky" },
  { key: "la", label: "Louisiana" },
  { key: "me", label: "Maine" },
  { key: "md", label: "Maryland" },
  { key: "ma", label: "Massachusetts" },
  { key: "mi", label: "Michigan" },
  { key: "mn", label: "Minnesota" },
  { key: "ms", label: "Mississippi" },
  { key: "mo", label: "Missouri" },
  { key: "mt", label: "Montana" },
  { key: "ne", label: "Nebraska" },
  { key: "nv", label: "Nevada" },
  { key: "nh", label: "New Hampshire" },
  { key: "nj", label: "New Jersey" },
  { key: "nm", label: "New Mexico" },
  { key: "ny", label: "New York" },
  { key: "nc", label: "North Carolina" },
  { key: "nd", label: "North Dakota" },
  { key: "oh", label: "Ohio" },
  { key: "ok", label: "Oklahoma" },
  { key: "or", label: "Oregon" },
  { key: "pa", label: "Pennsylvania" },
  { key: "ri", label: "Rhode Island" },
  { key: "sc", label: "South Carolina" },
  { key: "sd", label: "South Dakota" },
  { key: "tn", label: "Tennessee" },
  { key: "tx", label: "Texas" },
  { key: "ut", label: "Utah" },
  { key: "vt", label: "Vermont" },
  { key: "va", label: "Virginia" },
  { key: "wa", label: "Washington" },
  { key: "wv", label: "West Virginia" },
  { key: "wi", label: "Wisconsin" },
  { key: "wy", label: "Wyoming" },
  { key: "dc", label: "Washington, D.C." }
];

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

function calculateAnnualTaxes(
  income: number,
  filingStatus: FilingStatus,
  location: LocationKey
) {
  if (!Number.isFinite(income) || income <= 0) {
    return {
      taxes: { federal: 0, state: 0, fica: 0, total: 0 },
      netAnnual: 0
    };
  }

  const brackets =
    filingStatus === "single" ? federalBracketsSingle : federalBracketsMarried;

  const federal = calculateProgressiveTax(income, brackets);
  const stateRate = stateTaxRates[location];
  const state = income * stateRate;
  const fica = income * ficaRate;
  const total = federal + state + fica;
  const netAnnual = income - total;

  return {
    taxes: { federal, state, fica, total },
    netAnnual
  };
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
  const [mode, setMode] = useState<CalculationMode>("hourly");
  const [hourlyWage, setHourlyWage] = useState("");
  const [annualSalary, setAnnualSalary] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [location, setLocation] = useState<LocationKey>("us_generic");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hourlyError, setHourlyError] = useState<string | null>(null);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  const handleCalculate = () => {
    const hoursRaw = parseFloat(hoursPerWeek);
    const weeksRaw = parseFloat(weeksPerYear);

    const safeHours = Number.isFinite(hoursRaw) ? Math.max(0, hoursRaw) : 0;
    const safeWeeks = Number.isFinite(weeksRaw) ? Math.max(0, weeksRaw) : 0;
    const hoursTimesWeeks = safeHours * safeWeeks;

    if (mode === "hourly") {
      const hourlyRaw = parseFloat(hourlyWage.replace(",", "."));
      const safeHourly = Number.isFinite(hourlyRaw)
        ? Math.max(0, hourlyRaw)
        : 0;

      if (safeHourly <= 0) {
        setHourlyError("Enter an hourly wage greater than 0 to calculate.");
        setSalaryError(null);
        setResult(null);
        return;
      }

      setHourlyError(null);
      setSalaryError(null);

      const grossYearly = safeHourly * hoursTimesWeeks;
      const { taxes, netAnnual } = calculateAnnualTaxes(
        grossYearly,
        filingStatus,
        location
      );

      const grossMonthly = grossYearly / 12;
      const grossBiWeekly = grossYearly / 26;
      const grossWeekly = grossYearly / 52;

      const netMonthly = netAnnual / 12;
      const netBiWeekly = netAnnual / 26;
      const netWeekly = netAnnual / 52;
      const netHourly =
        hoursTimesWeeks > 0 ? netAnnual / hoursTimesWeeks : 0;

      setResult({
        gross: {
          hourly: safeHourly,
          weekly: grossWeekly,
          biWeekly: grossBiWeekly,
          monthly: grossMonthly,
          yearly: grossYearly
        },
        taxes,
        net: {
          yearly: netAnnual,
          monthly: netMonthly,
          biWeekly: netBiWeekly,
          weekly: netWeekly,
          hourly: netHourly
        }
      });
    } else {
      const annualRaw = parseFloat(annualSalary.replace(",", "."));
      const safeAnnual = Number.isFinite(annualRaw)
        ? Math.max(0, annualRaw)
        : 0;

      if (safeAnnual <= 0) {
        setSalaryError("Enter an annual salary greater than 0 to calculate.");
        setHourlyError(null);
        setResult(null);
        return;
      }

      setHourlyError(null);
      setSalaryError(null);

      const grossYearly = safeAnnual;
      const { taxes, netAnnual } = calculateAnnualTaxes(
        grossYearly,
        filingStatus,
        location
      );

      const grossHourly =
        hoursTimesWeeks > 0 ? grossYearly / hoursTimesWeeks : 0;
      const grossMonthly = grossYearly / 12;
      const grossBiWeekly = grossYearly / 26;
      const grossWeekly = grossYearly / 52;

      const netMonthly = netAnnual / 12;
      const netBiWeekly = netAnnual / 26;
      const netWeekly = netAnnual / 52;
      const netHourly =
        hoursTimesWeeks > 0 ? netAnnual / hoursTimesWeeks : 0;

      setResult({
        gross: {
          hourly: grossHourly,
          weekly: grossWeekly,
          biWeekly: grossBiWeekly,
          monthly: grossMonthly,
          yearly: grossYearly
        },
        taxes,
        net: {
          yearly: netAnnual,
          monthly: netMonthly,
          biWeekly: netBiWeekly,
          weekly: netWeekly,
          hourly: netHourly
        }
      });
    }
  };

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="space-y-6">
      <section aria-label="Income inputs" className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-800">
            Calculation mode
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label
              className="flex cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-400 data-[active=true]:border-emerald-500 data-[active=true]:ring-1 data-[active=true]:ring-emerald-500"
              data-active={mode === "hourly"}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="calculation-mode"
                  value="hourly"
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={mode === "hourly"}
                  onChange={() => setMode("hourly")}
                />
                <span className="font-medium text-slate-900">
                  Start with hourly pay
                </span>
              </div>
            </label>
            <label
              className="flex cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-400 data-[active=true]:border-emerald-500 data-[active=true]:ring-1 data-[active=true]:ring-emerald-500"
              data-active={mode === "salary"}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="calculation-mode"
                  value="salary"
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={mode === "salary"}
                  onChange={() => setMode("salary")}
                />
                <span className="font-medium text-slate-900">
                  Start with annual salary
                </span>
              </div>
            </label>
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          {mode === "hourly" ? (
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
                  onChange={(event) => {
                    setHourlyWage(event.target.value);
                    if (hourlyError) {
                      setHourlyError(null);
                    }
                  }}
                  className="flex-1 rounded-r-md border-0 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                  placeholder="e.g. 25"
                  inputMode="decimal"
                />
              </div>
              {hourlyError && (
                <p className="text-xs text-red-600">{hourlyError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label
                htmlFor="annualSalary"
                className="text-sm font-medium text-slate-800"
              >
                Annual salary (gross)
              </label>
              <div className="flex rounded-md border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <span className="flex items-center px-3 text-sm text-slate-500">
                  $
                </span>
                <input
                  id="annualSalary"
                  type="number"
                  min={0}
                  step="100"
                  value={annualSalary}
                  onChange={(event) => {
                    setAnnualSalary(event.target.value);
                    if (salaryError) {
                      setSalaryError(null);
                    }
                  }}
                  className="flex-1 rounded-r-md border-0 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                  placeholder="e.g. 52000"
                  inputMode="decimal"
                />
              </div>
              {salaryError && (
                <p className="text-xs text-red-600">{salaryError}</p>
              )}
            </div>
          )}
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
            <div className="relative">
              <select
                id="filingStatus"
                value={filingStatus}
                onChange={(event) =>
                  setFilingStatus(event.target.value as FilingStatus)
                }
                className={selectBaseClasses}
              >
                <option value="single">Single</option>
                <option value="married">Married filing jointly</option>
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
              htmlFor="location"
              className="text-sm font-medium text-slate-800"
            >
              Location
            </label>
            <div className="relative">
              <select
                id="location"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value as LocationKey)
                }
                className={selectBaseClasses}
              >
                {locationOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
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
          situation. State income tax uses approximate effective rates for the
          state or district you choose and will not match every individual
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
              <div className="flex justify-between">
                <dt>Hourly</dt>
                <dd>{formatCurrencyWithCents(result.net.hourly)}</dd>
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

