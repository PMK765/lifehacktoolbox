"use client";

import { useEffect, useMemo, useState } from "react";
import type { BaseId } from "@/lib/numberBase";
import {
  clampToBitWidth,
  formatToBase,
  parseFromBase
} from "@/lib/numberBase";

type ActiveInput = "decimal" | "binary" | "hex" | "octal";

type BitWidth = 8 | 16 | 32;

type PlaceValueRow = {
  position: number;
  digit: string;
  placeValue: number;
  contribution: number;
};

type PlaceValueBase = BaseId;

const LAST_VALUE_KEY = "lht_number_base_last_value_v1";
const LAST_BIT_WIDTH_KEY = "lht_number_base_bit_width_v1";

const examples: number[] = [42, 255, 1024, 4095, 65535];

const formatDecimal = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "–";
  }
  return value.toString();
};

const NumberBaseConverterApp = () => {
  const [decimalValue, setDecimalValue] = useState<string>("");
  const [binaryValue, setBinaryValue] = useState<string>("");
  const [hexValue, setHexValue] = useState<string>("");
  const [octalValue, setOctalValue] = useState<string>("");
  const [activeInput, setActiveInput] =
    useState<ActiveInput>("decimal");
  const [bitWidth, setBitWidth] = useState<BitWidth>(8);
  const [canonicalValue, setCanonicalValue] = useState<number | null>(
    null
  );
  const [placeValueBase, setPlaceValueBase] =
    useState<PlaceValueBase>("binary");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(LAST_VALUE_KEY);
    const storedBitWidth =
      window.localStorage.getItem(LAST_BIT_WIDTH_KEY);
    if (stored) {
      const parsed = parseFromBase(stored, "decimal");
      if (parsed != null) {
        const canonical = parsed;
        setCanonicalValue(canonical);
        setDecimalValue(formatToBase(canonical, "decimal"));
        setBinaryValue(formatToBase(canonical, "binary"));
        setHexValue(formatToBase(canonical, "hex"));
        setOctalValue(formatToBase(canonical, "octal"));
      }
    }
    if (storedBitWidth === "8" || storedBitWidth === "16" || storedBitWidth === "32") {
      setBitWidth(Number(storedBitWidth) as BitWidth);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (canonicalValue == null) {
      window.localStorage.removeItem(LAST_VALUE_KEY);
    } else {
      const serialized = formatToBase(canonicalValue, "decimal");
      window.localStorage.setItem(LAST_VALUE_KEY, serialized);
    }
    window.localStorage.setItem(LAST_BIT_WIDTH_KEY, String(bitWidth));
  }, [canonicalValue, bitWidth]);

  const applyCanonical = (value: number) => {
    setCanonicalValue(value);
    setDecimalValue(formatToBase(value, "decimal"));
    setBinaryValue(formatToBase(value, "binary"));
    setHexValue(formatToBase(value, "hex"));
    setOctalValue(formatToBase(value, "octal"));
  };

  const handleInputChange = (base: ActiveInput, text: string) => {
    setActiveInput(base);
    if (base === "decimal") {
      setDecimalValue(text);
    } else if (base === "binary") {
      setBinaryValue(text);
    } else if (base === "hex") {
      setHexValue(text);
    } else if (base === "octal") {
      setOctalValue(text);
    }
    const parsed = parseFromBase(
      text,
      base === "decimal"
        ? "decimal"
        : base === "binary"
        ? "binary"
        : base === "hex"
        ? "hex"
        : "octal"
    );
    if (parsed == null) {
      return;
    }
    applyCanonical(parsed);
  };

  const decimalError =
    activeInput === "decimal" &&
    decimalValue.trim() !== "" &&
    parseFromBase(decimalValue, "decimal") == null
      ? "Decimal uses digits 0–9 only."
      : "";
  const binaryError =
    activeInput === "binary" &&
    binaryValue.trim() !== "" &&
    parseFromBase(binaryValue, "binary") == null
      ? "Binary uses digits 0 and 1 only."
      : "";
  const hexError =
    activeInput === "hex" &&
    hexValue.trim() !== "" &&
    parseFromBase(hexValue, "hex") == null
      ? "Hex uses digits 0–9 and letters A–F."
      : "";
  const octalError =
    activeInput === "octal" &&
    octalValue.trim() !== "" &&
    parseFromBase(octalValue, "octal") == null
      ? "Octal uses digits 0–7 only."
      : "";

  const valueForVisualization = canonicalValue ?? 0;
  const clampedForBits = clampToBitWidth(
    valueForVisualization,
    bitWidth
  );
  const clampedBinary = formatToBase(
    clampedForBits,
    "binary"
  ).padStart(bitWidth, "0");

  type BitInfo = {
    index: number;
    bit: number;
    power: number;
    placeValue: number;
  };

  const bits: BitInfo[] = useMemo(() => {
    const result: BitInfo[] = [];
    for (let index = 0; index < bitWidth; index += 1) {
      const char = clampedBinary[index];
      const bit = char === "1" ? 1 : 0;
      const power = bitWidth - 1 - index;
      const placeValue = 2 ** power;
      result.push({ index, bit, power, placeValue });
    }
    return result;
  }, [bitWidth, clampedBinary]);

  const contributingBits = bits.filter((entry) => entry.bit === 1);

  const [hoveredBitIndex, setHoveredBitIndex] = useState<number | null>(
    null
  );

  const hoveredBit = hoveredBitIndex != null
    ? bits.find((entry) => entry.index === hoveredBitIndex) ?? null
    : null;

  const currentPlaceValueBase: PlaceValueBase = placeValueBase;
  const placeValueRadix: number =
    currentPlaceValueBase === "binary"
      ? 2
      : currentPlaceValueBase === "octal"
      ? 8
      : currentPlaceValueBase === "decimal"
      ? 10
      : 16;

  const placeValueDigits = formatToBase(
    canonicalValue ?? 0,
    currentPlaceValueBase
  );

  const placeValueRows: PlaceValueRow[] = useMemo(() => {
    const rows: PlaceValueRow[] = [];
    const digits = placeValueDigits;
    const length = digits.length;
    for (let index = 0; index < length; index += 1) {
      const position = index;
      const char = digits[length - 1 - index];
      let digitValue = 0;
      if (char >= "0" && char <= "9") {
        digitValue = char.charCodeAt(0) - "0".charCodeAt(0);
      } else {
        const upper = char.toUpperCase();
        digitValue = 10 + (upper.charCodeAt(0) - "A".charCodeAt(0));
      }
      const placeValue = placeValueRadix ** position;
      const contribution = digitValue * placeValue;
      rows.push({
        position,
        digit: char,
        placeValue,
        contribution
      });
    }
    return rows;
  }, [placeValueDigits, placeValueRadix]);

  const handleExampleClick = (value: number) => {
    applyCanonical(value);
    setActiveInput("decimal");
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-slate-100 shadow-sm md:p-6">
        <header className="space-y-2">
          <h2 className="text-base font-semibold tracking-tight text-slate-50 md:text-lg">
            Binary / Decimal / Hex / Octal Converter
          </h2>
          <p className="max-w-2xl text-xs text-slate-300 md:text-sm">
            Enter a value in any base to see it update instantly in binary,
            decimal, hexadecimal, and octal. Everything runs locally in your
            browser and is designed for computer science students learning
            number systems.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Decimal</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                Base 10
              </span>
            </label>
            <input
              type="text"
              value={decimalValue}
              onChange={(event) =>
                handleInputChange("decimal", event.target.value)
              }
              inputMode="numeric"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="e.g. 42"
            />
            <p className="text-[11px] text-slate-400">
              Digits 0–9 only.
            </p>
            {decimalError && (
              <p className="text-[11px] text-amber-400">
                {decimalError}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Binary</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                Base 2
              </span>
            </label>
            <input
              type="text"
              value={binaryValue}
              onChange={(event) =>
                handleInputChange("binary", event.target.value)
              }
              inputMode="numeric"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="e.g. 101010"
            />
            <p className="text-[11px] text-slate-400">
              Digits 0–1 only.
            </p>
            {binaryError && (
              <p className="text-[11px] text-amber-400">
                {binaryError}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Hexadecimal</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                Base 16
              </span>
            </label>
            <input
              type="text"
              value={hexValue}
              onChange={(event) =>
                handleInputChange("hex", event.target.value)
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="e.g. 2A"
            />
            <p className="text-[11px] text-slate-400">
              Digits 0–9 and letters A–F.
            </p>
            {hexError && (
              <p className="text-[11px] text-amber-400">
                {hexError}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Octal</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                Base 8
              </span>
            </label>
            <input
              type="text"
              value={octalValue}
              onChange={(event) =>
                handleInputChange("octal", event.target.value)
              }
              inputMode="numeric"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="e.g. 52"
            />
            <p className="text-[11px] text-slate-400">
              Digits 0–7 only.
            </p>
            {octalError && (
              <p className="text-[11px] text-amber-400">
                {octalError}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-200">
            Quick examples
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-slate-100 shadow-sm hover:border-emerald-400 hover:text-emerald-300"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-sm md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-100">
              Bit visualizer
            </h3>
            <p className="text-xs text-slate-300">
              View how this value fits into 8, 16, or 32 bits. Each highlighted
              bit contributes a power of two to the total.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <span className="text-slate-300">Bit width:</span>
            {[8, 16, 32].map((width) => {
              const typed = width as BitWidth;
              const isActive = bitWidth === typed;
              return (
                <button
                  key={width}
                  type="button"
                  onClick={() => setBitWidth(typed)}
                  className={`rounded-full px-2.5 py-1 ${
                    isActive
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {width} bit
                </button>
              );
            })}
          </div>
        </header>
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 px-3 py-3">
            <div className="mb-1 flex items-end justify-between text-[11px] text-slate-400">
              <span>
                Value (clamped):{" "}
                <span className="font-mono text-slate-100">
                  {formatDecimal(clampedForBits)}
                </span>
              </span>
              <span>
                Binary ({bitWidth} bits):{" "}
                <span className="font-mono text-slate-100">
                  {clampedBinary}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-2 text-[11px]">
              <div className="flex gap-1">
                {bits.map((bitInfo, index) => {
                  const isNibbleBoundary =
                    index > 0 && (bitWidth - index) % 4 === 0;
                  const isActive = bitInfo.bit === 1;
                  const isHovered =
                    hoveredBitIndex === bitInfo.index;
                  return (
                    <div
                      key={bitInfo.index}
                      className={`relative flex flex-col items-center ${
                        isNibbleBoundary ? "ml-2" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onMouseEnter={() =>
                          setHoveredBitIndex(bitInfo.index)
                        }
                        onMouseLeave={() =>
                          setHoveredBitIndex(null)
                        }
                        onFocus={() =>
                          setHoveredBitIndex(bitInfo.index)
                        }
                        onBlur={() =>
                          setHoveredBitIndex(null)
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-mono transition-colors ${
                          isActive
                            ? "border-emerald-400 bg-emerald-500 text-slate-950"
                            : "border-slate-700 bg-slate-900 text-slate-200"
                        } ${
                          isHovered
                            ? "ring-2 ring-emerald-300 ring-offset-2 ring-offset-slate-950"
                            : ""
                        }`}
                      >
                        {bitInfo.bit}
                      </button>
                      <span className="mt-1 text-[10px] text-slate-500">
                        2
                        <span className="align-super text-[9px]">
                          {bitInfo.power}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              {contributingBits.length > 0 && (
                <p className="text-[11px] text-slate-300">
                  Sum of set bits:{" "}
                  <span className="font-mono">
                    {contributingBits
                      .map((entry) => entry.placeValue)
                      .join(" + ")}{" "}
                    = {formatDecimal(clampedForBits)}
                  </span>
                </p>
              )}
            </div>
          </div>
          {hoveredBit && (
            <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">
              <p>
                Bit index {hoveredBit.index} (from left) represents{" "}
                <span className="font-mono">
                  2
                  <span className="align-super text-[10px]">
                    {hoveredBit.power}
                  </span>
                </span>{" "}
                ={" "}
                <span className="font-mono">
                  {formatDecimal(hoveredBit.placeValue)}
                </span>
                .
              </p>
              <p>
                This bit is{" "}
                <span className="font-mono">
                  {hoveredBit.bit}
                </span>
                , so it{" "}
                {hoveredBit.bit === 1
                  ? "does"
                  : "does not"}{" "}
                contribute to the total.
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-sm md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-100">
              Place value table
            </h3>
            <p className="text-xs text-slate-300">
              See how each digit in binary, decimal, hex, or octal expands into
              powers of its base and contributes to the total value.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
            <span className="text-slate-300">Base:</span>
            {(["binary", "decimal", "hex", "octal"] as PlaceValueBase[]).map(
              (base) => {
                const isActive = placeValueBase === base;
                const label =
                  base === "binary"
                    ? "Binary"
                    : base === "decimal"
                    ? "Decimal"
                    : base === "hex"
                    ? "Hex"
                    : "Octal";
                return (
                  <button
                    key={base}
                    type="button"
                    onClick={() => setPlaceValueBase(base)}
                    className={`rounded-full px-2.5 py-1 ${
                      isActive
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              }
            )}
          </div>
        </header>
        <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-950">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
            <thead className="sticky top-0 bg-slate-900 text-[11px] text-slate-200">
              <tr>
                <th className="border-b border-slate-700 px-2 py-1 text-left font-semibold">
                  Position (from right)
                </th>
                <th className="border-b border-slate-700 px-2 py-1 text-left font-semibold">
                  Digit
                </th>
                <th className="border-b border-slate-700 px-2 py-1 text-left font-semibold">
                  Place value
                </th>
                <th className="border-b border-slate-700 px-2 py-1 text-left font-semibold">
                  Contribution
                </th>
              </tr>
            </thead>
            <tbody>
              {placeValueRows.map((row) => (
                <tr
                  key={row.position}
                  className="odd:bg-slate-950 even:bg-slate-900"
                >
                  <td className="border-b border-slate-800 px-2 py-1">
                    {row.position}
                  </td>
                  <td className="border-b border-slate-800 px-2 py-1 font-mono">
                    {row.digit}
                  </td>
                  <td className="border-b border-slate-800 px-2 py-1">
                    {placeValueRadix}
                    <span className="align-super text-[10px]">
                      {row.position}
                    </span>{" "}
                    ={" "}
                    <span className="font-mono">
                      {formatDecimal(row.placeValue)}
                    </span>
                  </td>
                  <td className="border-b border-slate-800 px-2 py-1">
                    <span className="font-mono">
                      {formatDecimal(row.contribution)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default NumberBaseConverterApp;


