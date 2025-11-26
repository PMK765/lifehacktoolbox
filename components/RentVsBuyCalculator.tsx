"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  RentVsBuyInputs,
  YearlyComparison,
  YearlyHomeOutcome,
  YearlyRentOutcome
} from "@/lib/rentVsBuyLogic";
import {
  buildComparisonTimeline,
  buildHomeTimeline,
  buildRentTimeline,
  calculateMonthlyMortgagePayment
} from "@/lib/rentVsBuyLogic";

const STORAGE_KEY = "lht_rent_vs_buy_inputs_v1";

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

const formatCurrencyCompact = (value: number): string =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  });

const defaultInputs: RentVsBuyInputs = {
  homePrice: 450000,
  downPaymentPercent: 20,
  interestRate: 6.5,
  loanTermYears: 30,
  closingCostPercent: 3,
  propertyTaxRate: 1.2,
  insurancePerYear: 1500,
  hoaPerMonth: 0,
  maintenancePercent: 1,
  appreciationRate: 3,
  currentRent: 2300,
  rentIncreaseRate: 3,
  rentersInsurancePerMonth: 25,
  investmentReturnRate: 6,
  horizonYears: 10,
  sellingCostPercent: 6
};

type CalculatorState = {
  homePrice: string;
  downPaymentPercent: string;
  interestRate: string;
  loanTermYears: string;
  loanTermPreset: "15" | "30" | "custom";
  closingCostPercent: string;
  propertyTaxRate: string;
  insurancePerYear: string;
  hoaPerMonth: string;
  maintenancePercent: string;
  appreciationRate: string;
  currentRent: string;
  rentIncreaseRate: string;
  rentersInsurancePerMonth: string;
  investmentReturnRate: string;
  horizonYears: number;
  sellingCostPercent: string;
};

const toStateFromInputs = (
  inputs: RentVsBuyInputs
): CalculatorState => {
  const preset =
    inputs.loanTermYears === 15
      ? "15"
      : inputs.loanTermYears === 30
      ? "30"
      : "custom";
  return {
    homePrice: String(inputs.homePrice),
    downPaymentPercent: String(
      inputs.downPaymentPercent
    ),
    interestRate: String(inputs.interestRate),
    loanTermYears: String(inputs.loanTermYears),
    loanTermPreset: preset,
    closingCostPercent: String(
      inputs.closingCostPercent
    ),
    propertyTaxRate: String(
      inputs.propertyTaxRate
    ),
    insurancePerYear: String(
      inputs.insurancePerYear
    ),
    hoaPerMonth: String(inputs.hoaPerMonth),
    maintenancePercent: String(
      inputs.maintenancePercent
    ),
    appreciationRate: String(
      inputs.appreciationRate
    ),
    currentRent: String(inputs.currentRent),
    rentIncreaseRate: String(
      inputs.rentIncreaseRate
    ),
    rentersInsurancePerMonth: String(
      inputs.rentersInsurancePerMonth
    ),
    investmentReturnRate: String(
      inputs.investmentReturnRate
    ),
    horizonYears: Math.max(
      1,
      Math.min(30, Math.round(inputs.horizonYears))
    ),
    sellingCostPercent: String(
      inputs.sellingCostPercent
    )
  };
};

const parseInputs = (
  state: CalculatorState
): RentVsBuyInputs => {
  const loanTermPresetYears =
    state.loanTermPreset === "15"
      ? 15
      : state.loanTermPreset === "30"
      ? 30
      : Number(state.loanTermYears);
  const horizonYears = Math.max(
    1,
    Math.min(30, state.horizonYears)
  );
  return {
    homePrice: Number(state.homePrice),
    downPaymentPercent: Number(
      state.downPaymentPercent
    ),
    interestRate: Number(state.interestRate),
    loanTermYears: Number.isFinite(
      loanTermPresetYears
    )
      ? loanTermPresetYears
      : defaultInputs.loanTermYears,
    closingCostPercent: Number(
      state.closingCostPercent
    ),
    propertyTaxRate: Number(
      state.propertyTaxRate
    ),
    insurancePerYear: Number(
      state.insurancePerYear
    ),
    hoaPerMonth: Number(state.hoaPerMonth),
    maintenancePercent: Number(
      state.maintenancePercent
    ),
    appreciationRate: Number(
      state.appreciationRate
    ),
    currentRent: Number(state.currentRent),
    rentIncreaseRate: Number(
      state.rentIncreaseRate
    ),
    rentersInsurancePerMonth: Number(
      state.rentersInsurancePerMonth
    ),
    investmentReturnRate: Number(
      state.investmentReturnRate
    ),
    horizonYears,
    sellingCostPercent: Number(
      state.sellingCostPercent
    )
  };
};

const RentVsBuyCalculator = () => {
  const [state, setState] = useState<CalculatorState>(
    toStateFromInputs(defaultInputs)
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(
      STORAGE_KEY
    );
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(
      raw
    ) as RentVsBuyInputs;
    if (
      typeof parsed.homePrice === "number" &&
      typeof parsed.downPaymentPercent ===
        "number"
    ) {
      setState(toStateFromInputs(parsed));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const inputs = parseInputs(state);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(inputs)
    );
  }, [state]);

  const {
    inputs,
    ownerTimeline,
    renterTimeline,
    comparison,
    breakEvenYear
  }: {
    inputs: RentVsBuyInputs;
    ownerTimeline: YearlyHomeOutcome[];
    renterTimeline: YearlyRentOutcome[];
    comparison: YearlyComparison[];
    breakEvenYear: number | null;
  } = useMemo(() => {
    const parsed = parseInputs(state);
    const inputsSafe: RentVsBuyInputs = {
      ...defaultInputs,
      ...parsed
    };
    const owner = buildHomeTimeline(inputsSafe);
    const renter = buildRentTimeline(
      inputsSafe,
      owner
    );
    const comparisonResult =
      buildComparisonTimeline(
        owner,
        renter,
        inputsSafe
      );
    return {
      inputs: inputsSafe,
      ownerTimeline: owner,
      renterTimeline: renter,
      comparison: comparisonResult.comparison,
      breakEvenYear:
        comparisonResult.breakEvenYear
    };
  }, [state]);

  const horizonYears = inputs.horizonYears;

  const loanAmount =
    inputs.homePrice *
    (1 - inputs.downPaymentPercent / 100);
  const monthlyMortgage =
    calculateMonthlyMortgagePayment(
      loanAmount,
      inputs.interestRate,
      inputs.loanTermYears
    );
  const monthlyPropertyTax =
    (inputs.homePrice *
      (inputs.propertyTaxRate / 100)) /
    12;
  const monthlyMaintenance =
    (inputs.homePrice *
      (inputs.maintenancePercent / 100)) /
    12;
  const monthlyInsurance =
    inputs.insurancePerYear / 12;
  const monthlyHoa = inputs.hoaPerMonth;

  const monthlyOwnerCost =
    monthlyMortgage +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyHoa +
    monthlyMaintenance;
  const monthlyRentCost =
    inputs.currentRent +
    inputs.rentersInsurancePerMonth;

  const finalComparison =
    comparison[comparison.length - 1];
  const netDifferenceAtHorizon =
    finalComparison != null
      ? finalComparison.ownerNetWorth -
        finalComparison.renterNetWorth
      : 0;

  const handleChange =
    (field: keyof CalculatorState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setState((previous) => {
        if (field === "horizonYears") {
          return {
            ...previous,
            horizonYears: Number(value)
          };
        }
        if (
          field === "loanTermPreset" &&
          (value === "15" ||
            value === "30" ||
            value === "custom")
        ) {
          return {
            ...previous,
            loanTermPreset: value
          };
        }
        return {
          ...previous,
          [field]: value
        } as CalculatorState;
      });
    };

  const summaryHeadline =
    netDifferenceAtHorizon > 0
      ? `Buying leaves you about ${formatCurrencyCompact(
          netDifferenceAtHorizon
        )} ahead of renting after ${horizonYears} years.`
      : netDifferenceAtHorizon < 0
      ? `Renting and investing leaves you about ${formatCurrencyCompact(
          Math.abs(netDifferenceAtHorizon)
        )} ahead of buying after ${horizonYears} years.`
      : "Renting and buying end up roughly the same under these assumptions.";

  const breakEvenText =
    breakEvenYear != null
      ? `Break-even year: around year ${breakEvenYear}, buying first pulls ahead of renting.`
      : "Buying never clearly catches up to renting within this time horizon based on these inputs.";

  const renderMonthlyCostChart = () => {
    const owner = monthlyOwnerCost;
    const renter = monthlyRentCost;
    if (
      !Number.isFinite(owner) ||
      !Number.isFinite(renter)
    ) {
      return null;
    }
    const max = Math.max(owner, renter, 1);
    const widthFor = (value: number) =>
      `${Math.max(
        8,
        (value / max) * 100
      ).toFixed(1)}%`;
    return (
      <div className="space-y-3 text-xs text-slate-100">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            Current monthly rent
          </span>
          <span className="font-mono">
            {formatCurrency(renter)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800">
          <div
            className="h-3 rounded-full bg-sky-500"
            style={{ width: widthFor(renter) }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-medium">
            Estimated monthly owning cost
          </span>
          <span className="font-mono">
            {formatCurrency(owner)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800">
          <div
            className="h-3 rounded-full bg-emerald-500"
            style={{ width: widthFor(owner) }}
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-300">
          Owning combines mortgage principal &amp; interest,
          property tax, homeowners insurance, HOA dues, and a
          simple maintenance allowance.
        </p>
      </div>
    );
  };

  const renderNetWorthChart = () => {
    if (comparison.length === 0) {
      return null;
    }
    const width = 420;
    const height = 220;
    const marginLeft = 40;
    const marginRight = 16;
    const marginTop = 16;
    const marginBottom = 26;
    const innerWidth =
      width - marginLeft - marginRight;
    const innerHeight =
      height - marginTop - marginBottom;
    const minYear = comparison[0].year;
    const maxYear =
      comparison[comparison.length - 1].year;
    const yearSpan = Math.max(
      1,
      maxYear - minYear
    );
    const values = comparison.flatMap((row) => [
      row.ownerNetWorth,
      row.renterNetWorth
    ]);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 1);
    const valueSpan = maxValue - minValue || 1;
    const xForYear = (year: number): number =>
      marginLeft +
      ((year - minYear) / yearSpan) *
        innerWidth;
    const yForValue = (value: number): number =>
      marginTop +
      (1 - (value - minValue) / valueSpan) *
        innerHeight;
    const ownerPath = comparison
      .map((row, index) => {
        const x = xForYear(row.year);
        const y = yForValue(row.ownerNetWorth);
        const command = index === 0 ? "M" : "L";
        return `${command} ${x} ${y}`;
      })
      .join(" ");
    const renterPath = comparison
      .map((row, index) => {
        const x = xForYear(row.year);
        const y = yForValue(
          row.renterNetWorth
        );
        const command = index === 0 ? "M" : "L";
        return `${command} ${x} ${y}`;
      })
      .join(" ");
    const zeroY = yForValue(0);
    const breakEvenPoint =
      breakEvenYear != null
        ? comparison.find(
            (row) =>
              row.year === breakEvenYear
          )
        : undefined;
    const breakEvenX =
      breakEvenPoint != null
        ? xForYear(breakEvenPoint.year)
        : null;
    const breakEvenY =
      breakEvenPoint != null
        ? yForValue(
            breakEvenPoint.ownerNetWorth
          )
        : null;
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        aria-label="Net worth comparison over time"
      >
        <defs>
          <linearGradient
            id="ownerArea"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="#22c55e"
              stopOpacity="0.3"
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
          rx={12}
          fill="#020617"
        />
        <g>
          <line
            x1={marginLeft}
            y1={zeroY}
            x2={marginLeft + innerWidth}
            y2={zeroY}
            stroke="#111827"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <text
            x={marginLeft - 4}
            y={zeroY}
            textAnchor="end"
            dominantBaseline="central"
            className="fill-slate-400 text-[9px]"
          >
            $0
          </text>
          <path
            d={`${ownerPath} L ${
              marginLeft + innerWidth
            } ${yForValue(0)} L ${marginLeft} ${yForValue(
              0
            )} Z`}
            fill="url(#ownerArea)"
          />
          <path
            d={ownerPath}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
          />
          <path
            d={renterPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
          />
          {breakEvenX != null &&
            breakEvenY != null && (
              <>
                <circle
                  cx={breakEvenX}
                  cy={breakEvenY}
                  r={4}
                  fill="#f97316"
                  stroke="#020617"
                  strokeWidth={1}
                />
                <text
                  x={breakEvenX}
                  y={breakEvenY - 8}
                  textAnchor="middle"
                  className="fill-orange-200 text-[9px]"
                >
                  Break-even
                </text>
              </>
            )}
          <text
            x={marginLeft}
            y={marginTop + innerHeight + 16}
            className="fill-slate-400 text-[9px]"
          >
            Years
          </text>
          <text
            x={marginLeft + innerWidth}
            y={marginTop + 10}
            textAnchor="end"
            className="fill-slate-400 text-[9px]"
          >
            Net worth ({formatCurrencyCompact(
              maxValue
            )}
            )
          </text>
          <g
            className="text-[9px] fill-slate-200"
            transform={`translate(${marginLeft}, ${
              marginTop - 6
            })`}
          >
            <rect
              x={0}
              y={0}
              width={8}
              height={2}
              fill="#22c55e"
            />
            <text x={12} y={2}>
              Owner
            </text>
            <rect
              x={70}
              y={0}
              width={8}
              height={2}
              fill="#38bdf8"
            />
            <text x={84} y={2}>
              Renter
            </text>
          </g>
        </g>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-1 shadow-xl ring-1 ring-slate-800/80">
        <div className="space-y-6 rounded-[1.6rem] bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
              Money &amp; bills
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
              Rent vs Buy Calculator
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              Compare the long-term costs and net worth impact
              of renting versus buying a home. Adjust key
              assumptions to see how appreciation, rent
              inflation, and investment returns change the
              picture.
            </p>
          </header>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs sm:p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Assumptions
              </h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Home &amp; mortgage
                  </h4>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Home price
                    </span>
                    <input
                      type="number"
                      value={state.homePrice}
                      onChange={handleChange("homePrice")}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Down payment
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={state.downPaymentPercent}
                        onChange={handleChange(
                          "downPaymentPercent"
                        )}
                        className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                      <span className="text-[11px] text-slate-300">
                        %
                      </span>
                      <span className="ml-auto text-[11px] text-slate-300">
                        ≈{" "}
                        {formatCurrency(
                          inputs.homePrice *
                            (inputs.downPaymentPercent /
                              100)
                        )}
                      </span>
                    </div>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Mortgage interest rate (APR)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={state.interestRate}
                        onChange={handleChange(
                          "interestRate"
                        )}
                        className="w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                      <span className="text-[11px] text-slate-300">
                        %
                      </span>
                    </div>
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Loan term
                      </span>
                      <select
                        value={state.loanTermPreset}
                        onChange={handleChange(
                          "loanTermPreset"
                        )}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      >
                        <option value="30">
                          30 years
                        </option>
                        <option value="15">
                          15 years
                        </option>
                        <option value="custom">
                          Custom
                        </option>
                      </select>
                    </label>
                    {state.loanTermPreset ===
                      "custom" && (
                      <label className="space-y-1">
                        <span className="block text-[11px] font-medium text-slate-200">
                          Custom term (years)
                        </span>
                        <input
                          type="number"
                          value={state.loanTermYears}
                          onChange={handleChange(
                            "loanTermYears"
                          )}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                        />
                      </label>
                    )}
                  </div>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Buyer closing costs
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={state.closingCostPercent}
                        onChange={handleChange(
                          "closingCostPercent"
                        )}
                        className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                      <span className="text-[11px] text-slate-300">
                        %
                      </span>
                      <span className="ml-auto text-[11px] text-slate-300">
                        ≈{" "}
                        {formatCurrency(
                          inputs.homePrice *
                            (inputs.closingCostPercent /
                              100)
                        )}
                      </span>
                    </div>
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Property tax rate
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={state.propertyTaxRate}
                          onChange={handleChange(
                            "propertyTaxRate"
                          )}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                        />
                        <span className="text-[11px] text-slate-300">
                          %
                        </span>
                      </div>
                    </label>
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Homeowners insurance / year
                      </span>
                      <input
                        type="number"
                        value={state.insurancePerYear}
                        onChange={handleChange(
                          "insurancePerYear"
                        )}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                    </label>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        HOA dues / month
                      </span>
                      <input
                        type="number"
                        value={state.hoaPerMonth}
                        onChange={handleChange(
                          "hoaPerMonth"
                        )}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Maintenance reserve
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={state.maintenancePercent}
                          onChange={handleChange(
                            "maintenancePercent"
                          )}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                        />
                        <span className="text-[11px] text-slate-300">
                          % of value / year
                        </span>
                      </div>
                    </label>
                  </div>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Expected home appreciation
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={state.appreciationRate}
                        onChange={handleChange(
                          "appreciationRate"
                        )}
                        className="w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                      <span className="text-[11px] text-slate-300">
                        % / year
                      </span>
                    </div>
                  </label>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Rent &amp; investing
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Current monthly rent
                      </span>
                      <input
                        type="number"
                        value={state.currentRent}
                        onChange={handleChange(
                          "currentRent"
                        )}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Annual rent increase
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={state.rentIncreaseRate}
                          onChange={handleChange(
                            "rentIncreaseRate"
                          )}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                        />
                        <span className="text-[11px] text-slate-300">
                          %
                        </span>
                      </div>
                    </label>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Renter&apos;s insurance / month
                      </span>
                      <input
                        type="number"
                        value={
                          state.rentersInsurancePerMonth
                        }
                        onChange={handleChange(
                          "rentersInsurancePerMonth"
                        )}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-[11px] font-medium text-slate-200">
                        Investment return if renting
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={
                            state.investmentReturnRate
                          }
                          onChange={handleChange(
                            "investmentReturnRate"
                          )}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                        />
                        <span className="text-[11px] text-slate-300">
                          % / year
                        </span>
                      </div>
                    </label>
                  </div>
                  <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Horizon &amp; selling
                  </h4>
                  <label className="flex flex-col gap-2 text-[11px] text-slate-200">
                    <span className="font-medium">
                      Time horizon
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={state.horizonYears}
                        onChange={handleChange(
                          "horizonYears"
                        )}
                        className="h-1 flex-1 cursor-pointer rounded-full bg-slate-700 accent-emerald-500"
                      />
                      <span className="w-8 text-right font-mono text-xs">
                        {state.horizonYears}y
                      </span>
                    </div>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Selling costs if you sell
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={state.sellingCostPercent}
                        onChange={handleChange(
                          "sellingCostPercent"
                        )}
                        className="w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                      />
                      <span className="text-[11px] text-slate-300">
                        % of sale price
                      </span>
                    </div>
                  </label>
                  <p className="mt-1 text-[10px] text-slate-400">
                    This calculator ignores income taxes and
                    deductions. Real-world results will differ
                    based on your tax situation.
                  </p>
                </div>
              </div>
            </section>
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs sm:p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Results
              </h3>
              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Summary over {horizonYears} years
                </p>
                <p className="text-sm text-slate-100">
                  {summaryHeadline}
                </p>
                <p className="text-[11px] text-slate-300">
                  {breakEvenText}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Assumes you invest the down payment and
                  closing costs if you keep renting, plus any
                  annual savings when renting is cheaper.
                </p>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Monthly cost comparison (today)
                </p>
                {renderMonthlyCostChart()}
              </div>
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Net worth over time
                </p>
                {renderNetWorthChart()}
              </div>
              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Year-by-year snapshot
                </p>
                <div className="max-h-64 overflow-auto rounded-md border border-slate-800">
                  <table className="min-w-full border-collapse text-[11px]">
                    <thead className="bg-slate-900">
                      <tr className="text-left text-slate-300">
                        <th className="px-3 py-2 font-medium">
                          Year
                        </th>
                        <th className="px-3 py-2 font-medium">
                          Owner net worth
                        </th>
                        <th className="px-3 py-2 font-medium">
                          Renter net worth
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((row) => (
                        <tr
                          key={row.year}
                          className="border-t border-slate-800/80 text-slate-200"
                        >
                          <td className="px-3 py-1.5">
                            {row.year}
                          </td>
                          <td className="px-3 py-1.5 font-mono">
                            {formatCurrency(
                              row.ownerNetWorth
                            )}
                          </td>
                          <td className="px-3 py-1.5 font-mono">
                            {formatCurrency(
                              row.renterNetWorth
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-sm">
        <p className="font-semibold">
          Not financial advice
        </p>
        <p className="mt-1">
          This rent vs buy calculator is for education and
          planning only. Real-world decisions should factor in
          your income, taxes, credit, local market conditions,
          and risk tolerance, ideally with guidance from a
          qualified professional.
        </p>
      </div>
    </div>
  );
};

export default RentVsBuyCalculator;


