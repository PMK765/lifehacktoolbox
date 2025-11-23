"use client";

import { useMemo, useState } from "react";

type LawnType = "new" | "reseed";

type GrassSeedBag = {
  id: string;
  weightLbs: number;
  coverageNew: number;
  coverageReseed: number;
  notes?: string;
};

type GrassSeedBrand = {
  id: string;
  name: string;
  defaultMix: string;
  bagSizes: GrassSeedBag[];
};

type GrassSeedCalculatorState = {
  lawnType: LawnType;
  areaSqFtInput: string;
  brandId: string;
  bagId: string;
  applicationRateInput: string;
  customBagWeightInput: string;
  customPriceInput: string;
};

const brands: GrassSeedBrand[] = [
  {
    id: "scotts-sun-shade",
    name: "Scotts Turf Builder Sun & Shade Mix",
    defaultMix: "Cool-season sun and shade mix",
    bagSizes: [
      {
        id: "3lb",
        weightLbs: 3,
        coverageNew: 1200,
        coverageReseed: 3000
      },
      {
        id: "7lb",
        weightLbs: 7,
        coverageNew: 2800,
        coverageReseed: 8400
      },
      {
        id: "20lb",
        weightLbs: 20,
        coverageNew: 8000,
        coverageReseed: 20000
      }
    ]
  },
  {
    id: "scotts-ez-seed",
    name: "Scotts EZ Seed Patch & Repair",
    defaultMix: "Patch and repair mix",
    bagSizes: [
      {
        id: "10lb",
        weightLbs: 10,
        coverageNew: 225,
        coverageReseed: 225,
        notes: "Designed for patching small bare spots rather than full lawns."
      }
    ]
  },
  {
    id: "jonathan-green-black-beauty-ultra",
    name: "Jonathan Green Black Beauty Ultra",
    defaultMix: "Premium cool-season tall fescue mix",
    bagSizes: [
      {
        id: "3lb",
        weightLbs: 3,
        coverageNew: 1200,
        coverageReseed: 3000
      },
      {
        id: "7lb",
        weightLbs: 7,
        coverageNew: 2800,
        coverageReseed: 7000
      },
      {
        id: "25lb",
        weightLbs: 25,
        coverageNew: 10000,
        coverageReseed: 25000
      }
    ]
  },
  {
    id: "pennington-smart-seed-sun-shade",
    name: "Pennington Smart Seed Sun & Shade",
    defaultMix: "Sun and shade cool-season mix",
    bagSizes: [
      {
        id: "3lb",
        weightLbs: 3,
        coverageNew: 1000,
        coverageReseed: 3000
      },
      {
        id: "7lb",
        weightLbs: 7,
        coverageNew: 2330,
        coverageReseed: 7000
      },
      {
        id: "20lb",
        weightLbs: 20,
        coverageNew: 6660,
        coverageReseed: 20000
      }
    ]
  },
  {
    id: "vigoro-sun-shade",
    name: "Vigoro Sun & Shade Mix",
    defaultMix: "Sun and shade mix",
    bagSizes: [
      {
        id: "3lb",
        weightLbs: 3,
        coverageNew: 1000,
        coverageReseed: 3000
      },
      {
        id: "7lb",
        weightLbs: 7,
        coverageNew: 2333,
        coverageReseed: 7000
      },
      {
        id: "20lb",
        weightLbs: 20,
        coverageNew: 6666,
        coverageReseed: 20000
      }
    ]
  },
  {
    id: "custom",
    name: "Custom mix",
    defaultMix: "User-specified coverage and bag size",
    bagSizes: [
      {
        id: "custom-bag",
        weightLbs: 20,
        coverageNew: 0,
        coverageReseed: 0
      }
    ]
  }
];

const getBrandById = (id: string) =>
  brands.find((brand) => brand.id === id) ?? brands[0];

const getBagById = (brand: GrassSeedBrand, bagId: string) => {
  if (bagId) {
    const found = brand.bagSizes.find((bag) => bag.id === bagId);
    if (found) {
      return found;
    }
  }
  const middleIndex = Math.floor(brand.bagSizes.length / 2);
  return brand.bagSizes[middleIndex] ?? brand.bagSizes[0];
};

const computeDefaultRate = (
  brand: GrassSeedBrand,
  bag: GrassSeedBag,
  lawnType: LawnType
) => {
  if (brand.id === "custom") {
    return lawnType === "new" ? 8 : 4;
  }
  const coverage =
    lawnType === "new" ? bag.coverageNew : bag.coverageReseed;
  if (coverage <= 0 || bag.weightLbs <= 0) {
    return lawnType === "new" ? 8 : 4;
  }
  return (bag.weightLbs / (coverage / 1000));
};

const clampNonNegative = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;

const formatNumber = (value: number, fractionDigits: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });

export default function GrassSeedCalculator() {
  const defaultBrand = brands[0];
  const defaultBag = getBagById(defaultBrand, defaultBrand.bagSizes[0]?.id);

  const [state, setState] = useState<GrassSeedCalculatorState>({
    lawnType: "new",
    areaSqFtInput: "5000",
    brandId: defaultBrand.id,
    bagId: defaultBag.id,
    applicationRateInput: formatNumber(
      computeDefaultRate(defaultBrand, defaultBag, "new"),
      1
    ),
    customBagWeightInput: "20",
    customPriceInput: ""
  });

  const brand = getBrandById(state.brandId);
  const bag = getBagById(brand, state.bagId);

  const lawnTypeLabel =
    state.lawnType === "new" ? "Planting a brand new lawn" : "Reseeding / overseeding";

  const parsedAreaSqFt = useMemo(() => {
    const value = Number.parseFloat(state.areaSqFtInput);
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, value);
  }, [state.areaSqFtInput]);

  const parsedApplicationRate = useMemo(() => {
    const value = Number.parseFloat(state.applicationRateInput);
    if (!Number.isFinite(value) || value <= 0) {
      return computeDefaultRate(brand, bag, state.lawnType);
    }
    return value;
  }, [bag, brand, state.applicationRateInput, state.lawnType]);

  const parsedCustomBagWeight = useMemo(() => {
    if (brand.id !== "custom") {
      return bag.weightLbs;
    }
    const value = Number.parseFloat(state.customBagWeightInput);
    if (!Number.isFinite(value) || value <= 0) {
      return bag.weightLbs;
    }
    return value;
  }, [bag, brand.id, state.customBagWeightInput]);

  const parsedCustomPricePerBag = useMemo(() => {
    if (brand.id !== "custom") {
      return undefined;
    }
    const value = Number.parseFloat(state.customPriceInput);
    if (!Number.isFinite(value) || value <= 0) {
      return undefined;
    }
    return value;
  }, [brand.id, state.customPriceInput]);

  const effectiveCoveragePerBag = useMemo(() => {
    if (parsedApplicationRate <= 0) {
      return 0;
    }
    return (parsedCustomBagWeight / parsedApplicationRate) * 1000;
  }, [parsedApplicationRate, parsedCustomBagWeight]);

  const defaultPackageCoverage = useMemo(() => {
    const coverage =
      state.lawnType === "new" ? bag.coverageNew : bag.coverageReseed;
    const rate = computeDefaultRate(brand, bag, state.lawnType);
    return {
      coverage,
      rate
    };
  }, [bag, brand, state.lawnType]);

  const calculation = useMemo(() => {
    if (parsedAreaSqFt <= 0 || effectiveCoveragePerBag <= 0) {
      return {
        bags: 0,
        totalLbs: 0
      };
    }

    const rawBags = parsedAreaSqFt / effectiveCoveragePerBag;
    const bags = Math.ceil(rawBags);

    const totalLbs = clampNonNegative(bags * parsedCustomBagWeight);

    return {
      bags,
      totalLbs
    };
  }, [effectiveCoveragePerBag, parsedAreaSqFt, parsedCustomBagWeight]);

  const applicationRateWarning =
    parsedApplicationRate < 3 || parsedApplicationRate > 12;

  const areaWarning = parsedAreaSqFt > 0 && parsedAreaSqFt < 100;

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const handleBrandChange = (brandId: string) => {
    const nextBrand = getBrandById(brandId);
    const nextBag = getBagById(nextBrand, nextBrand.bagSizes[0]?.id);
    const nextRate = computeDefaultRate(nextBrand, nextBag, state.lawnType);
    setState((previous) => ({
      ...previous,
      brandId,
      bagId: nextBag.id,
      applicationRateInput: formatNumber(nextRate, 1),
      customBagWeightInput:
        nextBrand.id === "custom"
          ? String(nextBag.weightLbs)
          : previous.customBagWeightInput
    }));
  };

  const handleBagChange = (bagId: string) => {
    const nextBag = getBagById(brand, bagId);
    const nextRate = computeDefaultRate(brand, nextBag, state.lawnType);
    setState((previous) => ({
      ...previous,
      bagId,
      applicationRateInput: formatNumber(nextRate, 1),
      customBagWeightInput:
        brand.id === "custom"
          ? String(nextBag.weightLbs)
          : previous.customBagWeightInput
    }));
  };

  const handleLawnTypeChange = (lawnType: LawnType) => {
    const nextRate = computeDefaultRate(brand, bag, lawnType);
    setState((previous) => ({
      ...previous,
      lawnType,
      applicationRateInput: formatNumber(nextRate, 1)
    }));
  };

  return (
    <div className="space-y-8">
      <section
        aria-label="Lawn type and size"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Lawn type and size
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Lawn type</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleLawnTypeChange("new")}
                className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm shadow-sm transition ${
                  state.lawnType === "new"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                <span className="font-semibold">Planting a new lawn</span>
                <span className="text-xs text-slate-600">
                  Heavier seed rate to cover bare soil.
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleLawnTypeChange("reseed")}
                className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm shadow-sm transition ${
                  state.lawnType === "reseed"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                <span className="font-semibold">Reseeding / overseeding</span>
                <span className="text-xs text-slate-600">
                  Lighter seed rate over existing grass.
                </span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="areaSqFt"
              className="text-sm font-medium text-slate-800"
            >
              Lawn area (sq ft)
            </label>
            <input
              id="areaSqFt"
              type="number"
              min={0}
              step="50"
              value={state.areaSqFtInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  areaSqFtInput: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="e.g. 5000"
            />
            <p className="text-xs text-slate-600">
              Measure your lawn or use a mapping tool to estimate. Coverage assumes total
              grass area, not driveway or patio.
            </p>
            {areaWarning && (
              <p className="text-xs text-amber-700">
                This area is quite small. Double-check your measurement.
              </p>
            )}
          </div>
        </div>
      </section>
      <section
        aria-label="Brand and bag selection"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Brand and bag
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="brandSelect"
              className="text-sm font-medium text-slate-800"
            >
              Brand
            </label>
            <div className="relative">
              <select
                id="brandSelect"
                value={state.brandId}
                onChange={(event) => handleBrandChange(event.target.value)}
                className={selectBaseClasses}
              >
                {brands.map((brandOption) => (
                  <option key={brandOption.id} value={brandOption.id}>
                    {brandOption.name}
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
            <p className="text-xs text-slate-600">
              {brand.defaultMix}
            </p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="bagSelect"
              className="text-sm font-medium text-slate-800"
            >
              Bag size
            </label>
            <div className="relative">
              <select
                id="bagSelect"
                value={state.bagId}
                onChange={(event) => handleBagChange(event.target.value)}
                className={selectBaseClasses}
              >
                {brand.bagSizes.map((bagOption) => (
                  <option key={bagOption.id} value={bagOption.id}>
                    {bagOption.weightLbs} lb bag — new:{" "}
                    {bagOption.coverageNew.toLocaleString("en-US")} sq ft, reseed:{" "}
                    {bagOption.coverageReseed.toLocaleString("en-US")} sq ft
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
            {bag.notes && (
              <p className="text-xs text-amber-700">
                {bag.notes}
              </p>
            )}
          </div>
        </div>
        {brand.id === "custom" && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label
                htmlFor="customBagWeight"
                className="text-sm font-medium text-slate-800"
              >
                Custom bag weight (lbs)
              </label>
              <input
                id="customBagWeight"
                type="number"
                min={1}
                step="0.5"
                value={state.customBagWeightInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    customBagWeightInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="customPrice"
                className="text-sm font-medium text-slate-800"
              >
                Price per bag (optional)
              </label>
              <div className="flex rounded-md border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <span className="flex items-center px-2 text-xs text-slate-500">
                  $
                </span>
                <input
                  id="customPrice"
                  type="number"
                  min={0}
                  step="1"
                  value={state.customPriceInput}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      customPriceInput: event.target.value
                    }))
                  }
                  className="flex-1 rounded-r-md border-0 bg-transparent px-2 py-1.5 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </section>
      <section
        aria-label="Application rate"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Application rate
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="applicationRate"
              className="text-sm font-medium text-slate-800"
            >
              Seed rate (lbs per 1,000 sq ft)
            </label>
            <input
              id="applicationRate"
              type="number"
              min={0}
              step="0.5"
              value={state.applicationRateInput}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  applicationRateInput: event.target.value
                }))
              }
              className={inputBaseClasses}
            />
            <p className="text-xs text-slate-600">
              Typical new lawns use around 8–10 lbs per 1,000 sq ft. Overseeding usually
              runs closer to 3–5 lbs per 1,000 sq ft.
            </p>
            {applicationRateWarning && (
              <p className="text-xs text-amber-700">
                This rate is outside common ranges. Double-check the bag directions.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Package guidance (selected bag)
            </p>
            <p className="text-sm text-slate-800">
              Approx. {formatNumber(defaultPackageCoverage.rate, 1)} lbs per 1,000 sq ft
              for {lawnTypeLabel.toLowerCase()}.
            </p>
            <p className="text-xs text-slate-600">
              Coverage on the bag:{" "}
              {defaultPackageCoverage.coverage.toLocaleString("en-US")} sq ft.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Effective coverage per bag
            </p>
            <p className="text-sm text-slate-800">
              {effectiveCoveragePerBag > 0
                ? `${Math.round(
                    effectiveCoveragePerBag
                  ).toLocaleString("en-US")} sq ft per bag`
                : "Enter a positive seed rate to see coverage."}
            </p>
          </div>
        </div>
      </section>
      <section
        aria-label="Results"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Results
        </h2>
        {parsedAreaSqFt <= 0 || effectiveCoveragePerBag <= 0 ? (
          <p className="text-sm text-slate-700">
            Enter a lawn area and a positive seed rate to estimate bags and total seed
            needed.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lawn size
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {parsedAreaSqFt.toLocaleString("en-US")} sq ft
                </p>
                <p className="text-xs text-slate-600">
                  {lawnTypeLabel}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Brand and bag
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {brand.name}
                </p>
                <p className="text-xs text-slate-600">
                  {parsedCustomBagWeight.toLocaleString("en-US")} lb bag
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Seed rate used
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatNumber(parsedApplicationRate, 1)} lbs / 1,000 sq ft
                </p>
                <p className="text-xs text-slate-600">
                  Package implied rate is{" "}
                  {formatNumber(defaultPackageCoverage.rate, 1)} lbs / 1,000 sq ft for this
                  bag and lawn type.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bags required
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {calculation.bags.toLocaleString("en-US")}{" "}
                  {calculation.bags === 1 ? "bag" : "bags"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total seed weight
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(calculation.totalLbs, 1)} lbs
                </p>
              </div>
              {parsedCustomPricePerBag !== undefined && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estimated cost
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(calculation.bags * parsedCustomPricePerBag)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      <section
        aria-label="Brand coverage table"
        className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Brand coverage reference
        </h2>
        <p className="text-xs text-slate-600">
          Coverage numbers below are approximate manufacturer guidelines. Actual results
          depend on soil prep, spreader settings, and conditions.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Brand
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Bag
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  New lawn
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Reseed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {brands
                .filter((brandOption) => brandOption.id !== "custom")
                .map((brandOption) =>
                  brandOption.bagSizes.map((bagOption) => {
                    const rateNew = computeDefaultRate(
                      brandOption,
                      bagOption,
                      "new"
                    );
                    const rateReseed = computeDefaultRate(
                      brandOption,
                      bagOption,
                      "reseed"
                    );
                    return (
                      <tr key={`${brandOption.id}-${bagOption.id}`}>
                        <td className="px-3 py-2">
                          <span className="font-medium text-slate-900">
                            {brandOption.name}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {bagOption.weightLbs} lb
                        </td>
                        <td className="px-3 py-2">
                          {bagOption.coverageNew.toLocaleString("en-US")} sq ft
                          {" · "}
                          {formatNumber(rateNew, 1)} lbs / 1,000 sq ft
                        </td>
                        <td className="px-3 py-2">
                          {bagOption.coverageReseed.toLocaleString("en-US")} sq
                          ft {" · "}
                          {formatNumber(rateReseed, 1)} lbs / 1,000 sq ft
                        </td>
                      </tr>
                    );
                  })
                )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


