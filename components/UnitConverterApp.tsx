"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  NumberBaseId,
  UnitCategoryId,
  UnitDefinition
} from "@/lib/unitConversion";
import {
  UNITS_BY_CATEGORY,
  UNIT_MAP,
  allowedDigitPatternForBase,
  baseForId,
  convertNumberBase,
  convertValue,
  formatNumber
} from "@/lib/unitConversion";

type FavoritePair = {
  id: string;
  category: UnitCategoryId;
  fromUnitId: string;
  toUnitId: string;
  label?: string;
};

const FAVORITES_KEY = "lht_unit_converter_favorites_v1";

const CATEGORY_CONFIG: {
  id: UnitCategoryId;
  label: string;
  emoji: string;
}[] = [
  { id: "length", label: "Length", emoji: "📏" },
  { id: "weight", label: "Weight", emoji: "⚖️" },
  { id: "volume", label: "Volume", emoji: "🧴" },
  { id: "energy", label: "Energy", emoji: "⚡️" },
  { id: "temperature", label: "Temperature", emoji: "🌡️" },
  { id: "speed", label: "Speed", emoji: "🚗" },
  { id: "area", label: "Area", emoji: "🗺️" },
  { id: "pressure", label: "Pressure", emoji: "📎" },
  { id: "data", label: "Data", emoji: "💾" },
  { id: "number-base", label: "Number bases", emoji: "🔢" }
];

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const UnitConverterApp = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<UnitCategoryId>("length");
  const [fromUnitId, setFromUnitId] = useState<string>(
    UNITS_BY_CATEGORY.length[0]?.id ?? "meter"
  );
  const [toUnitId, setToUnitId] = useState<string>(
    UNITS_BY_CATEGORY.length[1]?.id ?? "kilometer"
  );
  const [inputValue, setInputValue] = useState("");
  const [favorites, setFavorites] = useState<FavoritePair[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    if (!stored) {
      return;
    }
    const parsed = JSON.parse(stored) as FavoritePair[];
    if (Array.isArray(parsed)) {
      setFavorites(parsed);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (favorites.length === 0) {
      window.localStorage.removeItem(FAVORITES_KEY);
      return;
    }
    const serialized = JSON.stringify(favorites);
    window.localStorage.setItem(FAVORITES_KEY, serialized);
  }, [favorites]);

  useEffect(() => {
    const categoryUnits = UNITS_BY_CATEGORY[selectedCategory];
    if (!categoryUnits || categoryUnits.length === 0) {
      return;
    }
    const ids = categoryUnits.map((unit) => unit.id);
    if (!ids.includes(fromUnitId) || !ids.includes(toUnitId)) {
      const first = categoryUnits[0]?.id ?? fromUnitId;
      const second =
        categoryUnits[1]?.id ?? categoryUnits[0]?.id ?? toUnitId;
      setFromUnitId(first);
      setToUnitId(second);
    }
  }, [selectedCategory, fromUnitId, toUnitId]);

  const numericInput =
    inputValue.trim() === "" ? null : Number(inputValue);
  const numericValid =
    numericInput !== null && !Number.isNaN(numericInput);

  const isNumberBaseCategory = selectedCategory === "number-base";
  const fromUnit = UNIT_MAP[fromUnitId];
  const toUnit = UNIT_MAP[toUnitId];

  const numberBaseErrorMessage = useMemo(() => {
    if (!isNumberBaseCategory) {
      return "";
    }
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return "";
    }
    const fromBaseId = fromUnit?.id as NumberBaseId | undefined;
    if (!fromBaseId) {
      return "Unable to convert with current settings.";
    }
    const pattern = allowedDigitPatternForBase(fromBaseId);
    const upper = trimmed.toUpperCase();
    if (pattern.test(upper)) {
      return "";
    }
    if (fromBaseId === "binary") {
      return "Binary values use digits 0 and 1 only.";
    }
    if (fromBaseId === "octal") {
      return "Octal values use digits 0–7 only.";
    }
    if (fromBaseId === "decimal") {
      return "Decimal values use digits 0–9 only.";
    }
    return "Hex values use digits 0–9 and A–F.";
  }, [inputValue, isNumberBaseCategory, fromUnit]);

  const conversionResult = useMemo(() => {
    if (isNumberBaseCategory) {
      const fromBaseId = fromUnit?.id as NumberBaseId | undefined;
      const toBaseId = toUnit?.id as NumberBaseId | undefined;
      if (!fromBaseId || !toBaseId) {
        return "";
      }
      const converted = convertNumberBase(inputValue, fromBaseId, toBaseId);
      if (converted == null) {
        return "";
      }
      return converted;
    }
    if (!numericValid || numericInput == null) {
      return "";
    }
    const result = convertValue(
      selectedCategory,
      numericInput,
      fromUnitId,
      toUnitId
    );
    if (result == null) {
      return "";
    }
    return formatNumber(result);
  }, [
    fromUnit,
    fromUnitId,
    inputValue,
    isNumberBaseCategory,
    numericInput,
    numericValid,
    selectedCategory,
    toUnit,
    toUnitId
  ]);

  const allConversions = useMemo(() => {
    const units = UNITS_BY_CATEGORY[selectedCategory];
    if (!units || units.length === 0) {
      return [];
    }
    if (isNumberBaseCategory) {
      const fromBaseId = fromUnit?.id as NumberBaseId | undefined;
      if (!fromBaseId) {
        return [];
      }
      return units.map((target) => {
        const toBaseId = target.id as NumberBaseId;
        const converted = convertNumberBase(
          inputValue,
          fromBaseId,
          toBaseId
        );
        return {
          unit: target,
          value: converted
        };
      });
    }
    if (!numericValid || numericInput == null) {
      return units.map((unit) => ({
        unit,
        value: ""
      }));
    }
    return units.map((unit) => {
      const converted = convertValue(
        selectedCategory,
        numericInput,
        fromUnitId,
        unit.id
      );
      return {
        unit,
        value: converted == null ? "" : formatNumber(converted)
      };
    });
  }, [
    fromUnit,
    fromUnitId,
    inputValue,
    isNumberBaseCategory,
    numericInput,
    numericValid,
    selectedCategory
  ]);

  const handleSwapUnits = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const handleSaveFavorite = () => {
    if (!fromUnit || !toUnit) {
      return;
    }
    const existing = favorites.find(
      (favorite) =>
        favorite.category === selectedCategory &&
        favorite.fromUnitId === fromUnitId &&
        favorite.toUnitId === toUnitId
    );
    if (existing) {
      return;
    }
    const label = `${fromUnit.symbol || fromUnit.label} → ${
      toUnit.symbol || toUnit.label
    }`;
    const entry: FavoritePair = {
      id: createId(),
      category: selectedCategory,
      fromUnitId,
      toUnitId,
      label
    };
    setFavorites((previous) => [...previous, entry]);
  };

  const handleApplyFavorite = (favorite: FavoritePair) => {
    setSelectedCategory(favorite.category);
    setFromUnitId(favorite.fromUnitId);
    setToUnitId(favorite.toUnitId);
  };

  const categoryUnits: UnitDefinition[] =
    UNITS_BY_CATEGORY[selectedCategory] ?? [];

  const renderUnitOptions = (units: UnitDefinition[]) =>
    units.map((unit) => (
      <option key={unit.id} value={unit.id}>
        {unit.label} ({unit.symbol})
      </option>
    ));

  const numberBaseHelper =
    selectedCategory === "number-base" && fromUnit
      ? `Base ${
          baseForId(fromUnit.id as NumberBaseId)
        } input.`
      : "";

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Universal Unit Converter
            </h2>
            <p className="max-w-xl text-xs text-slate-600">
              Choose a category, enter a value, and instantly convert between
              units. Everything runs locally in your browser with no data
              sent to a server.
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {CATEGORY_CONFIG.map((category) => {
            const isActive = category.id === selectedCategory;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setInputValue("");
                }}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 shadow-sm ${
                  isActive
                    ? "bg-emerald-500 text-slate-950"
                    : "border border-slate-300 bg-slate-50 text-slate-800 hover:border-emerald-400"
                }`}
              >
                <span>{category.emoji}</span>
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <label className="flex flex-col gap-1 text-xs text-slate-700">
              <span className="flex items-center justify-between">
                <span className="font-semibold">From</span>
                {numberBaseHelper && (
                  <span className="text-[11px] text-slate-500">
                    {numberBaseHelper}
                  </span>
                )}
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  inputMode={isNumberBaseCategory ? "text" : "decimal"}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder={
                    isNumberBaseCategory ? "Enter value" : "Enter a number"
                  }
                />
                <select
                  value={fromUnitId}
                  onChange={(event) => setFromUnitId(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-40"
                >
                  {renderUnitOptions(categoryUnits)}
                </select>
              </div>
            </label>
            {isNumberBaseCategory && numberBaseErrorMessage && (
              <p className="text-[11px] text-amber-700">
                {numberBaseErrorMessage}
              </p>
            )}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwapUnits}
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
            >
              Swap units
            </button>
          </div>
          <div className="space-y-2">
            <label className="flex flex-col gap-1 text-xs text-slate-700">
              <span className="font-semibold">To</span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  readOnly
                  value={conversionResult}
                  className="w-full cursor-default rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm"
                  placeholder="Result"
                />
                <select
                  value={toUnitId}
                  onChange={(event) => setToUnitId(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-40"
                >
                  {renderUnitOptions(categoryUnits)}
                </select>
              </div>
            </label>
            {!isNumberBaseCategory && !numericValid && inputValue.trim() !== "" && (
              <p className="text-[11px] text-amber-700">
                Enter a valid number using digits, an optional minus sign, and
                at most one decimal point.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <button
              type="button"
              onClick={handleSaveFavorite}
              className="inline-flex items-center rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
            >
              Save this pair
            </button>
            <p className="text-[11px] text-slate-500">
              Conversions update automatically as you type or change units.
            </p>
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-900 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Convert to all units in this category
            </h3>
            {inputValue.trim() === "" ? (
              <p className="text-[11px] text-slate-500">
                Enter a value above to see how it looks in every unit for this
                category.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-slate-50">
                <table className="min-w-full border-separate border-spacing-0 text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-[11px]">
                    <tr>
                      <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">
                        Unit
                      </th>
                      <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">
                        Symbol
                      </th>
                      <th className="border-b border-slate-200 px-2 py-1 text-right font-semibold text-slate-700">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allConversions.map((entry) => (
                      <tr key={entry.unit.id} className="odd:bg-white even:bg-slate-50">
                        <td className="border-b border-slate-200 px-2 py-1">
                          {entry.unit.label}
                        </td>
                        <td className="border-b border-slate-200 px-2 py-1">
                          {entry.unit.symbol}
                        </td>
                        <td className="border-b border-slate-200 px-2 py-1 text-right font-mono text-slate-900">
                          {entry.value || "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Favorite pairs
            </h3>
            {favorites.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                Save frequently used conversions here, such as miles ↔
                kilometers or Fahrenheit ↔ Celsius.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {favorites.map((favorite) => {
                  const from = UNIT_MAP[favorite.fromUnitId];
                  const to = UNIT_MAP[favorite.toUnitId];
                  const label =
                    favorite.label ??
                    `${from?.symbol ?? favorite.fromUnitId} → ${
                      to?.symbol ?? favorite.toUnitId
                    }`;
                  return (
                    <button
                      key={favorite.id}
                      type="button"
                      onClick={() => handleApplyFavorite(favorite)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] text-slate-800 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
                    >
                      <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-50">
                        {
                          CATEGORY_CONFIG.find(
                            (category) => category.id === favorite.category
                          )?.emoji
                        }
                      </span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnitConverterApp;


