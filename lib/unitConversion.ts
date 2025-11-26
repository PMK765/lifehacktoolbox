export type UnitCategoryId =
  | "length"
  | "weight"
  | "volume"
  | "energy"
  | "temperature"
  | "speed"
  | "area"
  | "pressure"
  | "data"
  | "number-base";

export type UnitDefinition = {
  id: string;
  symbol: string;
  label: string;
  category: UnitCategoryId;
  toBase?: (value: number) => number;
  fromBase?: (value: number) => number;
};

const unitDefinitions: UnitDefinition[] = [
  // Length (base: meter)
  {
    id: "meter",
    symbol: "m",
    label: "Meter",
    category: "length",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "kilometer",
    symbol: "km",
    label: "Kilometer",
    category: "length",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: "centimeter",
    symbol: "cm",
    label: "Centimeter",
    category: "length",
    toBase: (value) => value / 100,
    fromBase: (value) => value * 100
  },
  {
    id: "millimeter",
    symbol: "mm",
    label: "Millimeter",
    category: "length",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000
  },
  {
    id: "inch",
    symbol: "in",
    label: "Inch",
    category: "length",
    toBase: (value) => value * 0.0254,
    fromBase: (value) => value / 0.0254
  },
  {
    id: "foot",
    symbol: "ft",
    label: "Foot",
    category: "length",
    toBase: (value) => value * 0.3048,
    fromBase: (value) => value / 0.3048
  },
  {
    id: "yard",
    symbol: "yd",
    label: "Yard",
    category: "length",
    toBase: (value) => value * 0.9144,
    fromBase: (value) => value / 0.9144
  },
  {
    id: "mile",
    symbol: "mi",
    label: "Mile",
    category: "length",
    toBase: (value) => value * 1609.344,
    fromBase: (value) => value / 1609.344
  },

  // Weight / Mass (base: kilogram)
  {
    id: "kilogram",
    symbol: "kg",
    label: "Kilogram",
    category: "weight",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "gram",
    symbol: "g",
    label: "Gram",
    category: "weight",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000
  },
  {
    id: "milligram",
    symbol: "mg",
    label: "Milligram",
    category: "weight",
    toBase: (value) => value / 1_000_000,
    fromBase: (value) => value * 1_000_000
  },
  {
    id: "metric-ton",
    symbol: "t",
    label: "Metric ton",
    category: "weight",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: "pound",
    symbol: "lb",
    label: "Pound",
    category: "weight",
    toBase: (value) => value * 0.45359237,
    fromBase: (value) => value / 0.45359237
  },
  {
    id: "ounce",
    symbol: "oz",
    label: "Ounce",
    category: "weight",
    toBase: (value) => value * 0.028349523125,
    fromBase: (value) => value / 0.028349523125
  },

  // Volume (base: liter)
  {
    id: "liter",
    symbol: "L",
    label: "Liter",
    category: "volume",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "milliliter",
    symbol: "mL",
    label: "Milliliter",
    category: "volume",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000
  },
  {
    id: "cubic-meter",
    symbol: "m³",
    label: "Cubic meter",
    category: "volume",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: "teaspoon",
    symbol: "tsp",
    label: "Teaspoon (US)",
    category: "volume",
    toBase: (value) => value * 0.00492892159375,
    fromBase: (value) => value / 0.00492892159375
  },
  {
    id: "tablespoon",
    symbol: "tbsp",
    label: "Tablespoon (US)",
    category: "volume",
    toBase: (value) => value * 0.01478676478125,
    fromBase: (value) => value / 0.01478676478125
  },
  {
    id: "cup",
    symbol: "cup",
    label: "Cup (US)",
    category: "volume",
    toBase: (value) => value * 0.24,
    fromBase: (value) => value / 0.24
  },
  {
    id: "fluid-ounce",
    symbol: "fl oz",
    label: "Fluid ounce (US)",
    category: "volume",
    toBase: (value) => value * 0.0295735295625,
    fromBase: (value) => value / 0.0295735295625
  },
  {
    id: "gallon-us",
    symbol: "gal",
    label: "Gallon (US)",
    category: "volume",
    toBase: (value) => value * 3.785411784,
    fromBase: (value) => value / 3.785411784
  },

  // Energy (base: joule)
  {
    id: "joule",
    symbol: "J",
    label: "Joule",
    category: "energy",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "kilojoule",
    symbol: "kJ",
    label: "Kilojoule",
    category: "energy",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: "calorie",
    symbol: "cal",
    label: "Calorie (small)",
    category: "energy",
    toBase: (value) => value * 4.184,
    fromBase: (value) => value / 4.184
  },
  {
    id: "kilocalorie",
    symbol: "kcal",
    label: "Kilocalorie (food Calorie)",
    category: "energy",
    toBase: (value) => value * 4184,
    fromBase: (value) => value / 4184
  },
  {
    id: "watt-hour",
    symbol: "Wh",
    label: "Watt-hour",
    category: "energy",
    toBase: (value) => value * 3600,
    fromBase: (value) => value / 3600
  },
  {
    id: "kilowatt-hour",
    symbol: "kWh",
    label: "Kilowatt-hour",
    category: "energy",
    toBase: (value) => value * 3_600_000,
    fromBase: (value) => value / 3_600_000
  },

  // Speed (base: meter per second)
  {
    id: "meter-per-second",
    symbol: "m/s",
    label: "Meter per second",
    category: "speed",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "kilometer-per-hour",
    symbol: "km/h",
    label: "Kilometer per hour",
    category: "speed",
    toBase: (value) => (value * 1000) / 3600,
    fromBase: (value) => (value * 3600) / 1000
  },
  {
    id: "mile-per-hour",
    symbol: "mph",
    label: "Mile per hour",
    category: "speed",
    toBase: (value) => (value * 1609.344) / 3600,
    fromBase: (value) => (value * 3600) / 1609.344
  },
  {
    id: "knot",
    symbol: "kn",
    label: "Knot",
    category: "speed",
    toBase: (value) => (value * 1852) / 3600,
    fromBase: (value) => (value * 3600) / 1852
  },

  // Area (base: square meter)
  {
    id: "square-meter",
    symbol: "m²",
    label: "Square meter",
    category: "area",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "square-kilometer",
    symbol: "km²",
    label: "Square kilometer",
    category: "area",
    toBase: (value) => value * 1_000_000,
    fromBase: (value) => value / 1_000_000
  },
  {
    id: "square-centimeter",
    symbol: "cm²",
    label: "Square centimeter",
    category: "area",
    toBase: (value) => value / 10_000,
    fromBase: (value) => value * 10_000
  },
  {
    id: "hectare",
    symbol: "ha",
    label: "Hectare",
    category: "area",
    toBase: (value) => value * 10_000,
    fromBase: (value) => value / 10_000
  },
  {
    id: "acre",
    symbol: "ac",
    label: "Acre",
    category: "area",
    toBase: (value) => value * 4046.8564224,
    fromBase: (value) => value / 4046.8564224
  },
  {
    id: "square-foot",
    symbol: "ft²",
    label: "Square foot",
    category: "area",
    toBase: (value) => value * 0.09290304,
    fromBase: (value) => value / 0.09290304
  },

  // Pressure (base: pascal)
  {
    id: "pascal",
    symbol: "Pa",
    label: "Pascal",
    category: "pressure",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "kilopascal",
    symbol: "kPa",
    label: "Kilopascal",
    category: "pressure",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: "bar",
    symbol: "bar",
    label: "Bar",
    category: "pressure",
    toBase: (value) => value * 100_000,
    fromBase: (value) => value / 100_000
  },
  {
    id: "atmosphere",
    symbol: "atm",
    label: "Atmosphere",
    category: "pressure",
    toBase: (value) => value * 101_325,
    fromBase: (value) => value / 101_325
  },
  {
    id: "psi",
    symbol: "psi",
    label: "Pound per square inch",
    category: "pressure",
    toBase: (value) => value * 6894.757293168,
    fromBase: (value) => value / 6894.757293168
  },

  // Data (base: byte, decimal and binary units)
  {
    id: "byte",
    symbol: "B",
    label: "Byte",
    category: "data",
    toBase: (value) => value,
    fromBase: (value) => value
  },
  {
    id: "bit",
    symbol: "b",
    label: "Bit",
    category: "data",
    toBase: (value) => value / 8,
    fromBase: (value) => value * 8
  },
  {
    id: "kilobyte",
    symbol: "kB",
    label: "Kilobyte (10³)",
    category: "data",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000
  },
  {
    id: "megabyte",
    symbol: "MB",
    label: "Megabyte (10⁶)",
    category: "data",
    toBase: (value) => value * 1_000_000,
    fromBase: (value) => value / 1_000_000
  },
  {
    id: "gigabyte",
    symbol: "GB",
    label: "Gigabyte (10⁹)",
    category: "data",
    toBase: (value) => value * 1_000_000_000,
    fromBase: (value) => value / 1_000_000_000
  },
  {
    id: "terabyte",
    symbol: "TB",
    label: "Terabyte (10¹²)",
    category: "data",
    toBase: (value) => value * 1_000_000_000_000,
    fromBase: (value) => value / 1_000_000_000_000
  },
  {
    id: "kibibyte",
    symbol: "KiB",
    label: "Kibibyte (2¹⁰)",
    category: "data",
    toBase: (value) => value * 1024,
    fromBase: (value) => value / 1024
  },
  {
    id: "mebibyte",
    symbol: "MiB",
    label: "Mebibyte (2²⁰)",
    category: "data",
    toBase: (value) => value * 1_048_576,
    fromBase: (value) => value / 1_048_576
  },
  {
    id: "gibibyte",
    symbol: "GiB",
    label: "Gibibyte (2³⁰)",
    category: "data",
    toBase: (value) => value * 1_073_741_824,
    fromBase: (value) => value / 1_073_741_824
  },

  // Number bases (handled separately for conversion)
  {
    id: "binary",
    symbol: "bin",
    label: "Binary (base 2)",
    category: "number-base"
  },
  {
    id: "octal",
    symbol: "oct",
    label: "Octal (base 8)",
    category: "number-base"
  },
  {
    id: "decimal",
    symbol: "dec",
    label: "Decimal (base 10)",
    category: "number-base"
  },
  {
    id: "hexadecimal",
    symbol: "hex",
    label: "Hexadecimal (base 16)",
    category: "number-base"
  }
];

export const UNITS: UnitDefinition[] = unitDefinitions;

export const UNITS_BY_CATEGORY: Record<UnitCategoryId, UnitDefinition[]> =
  UNITS.reduce(
    (accumulator, unit) => {
      const current = accumulator[unit.category] ?? [];
      current.push(unit);
      accumulator[unit.category] = current;
      return accumulator;
    },
    {
      length: [],
      weight: [],
      volume: [],
      energy: [],
      temperature: [],
      speed: [],
      area: [],
      pressure: [],
      data: [],
      "number-base": []
    } as Record<UnitCategoryId, UnitDefinition[]>
  );

export const UNIT_MAP: Record<string, UnitDefinition> = UNITS.reduce(
  (accumulator, unit) => {
    accumulator[unit.id] = unit;
    return accumulator;
  },
  {} as Record<string, UnitDefinition>
);

const celsiusToFahrenheit = (temperatureCelsius: number) =>
  (temperatureCelsius * 9) / 5 + 32;

const fahrenheitToCelsius = (temperatureFahrenheit: number) =>
  ((temperatureFahrenheit - 32) * 5) / 9;

const celsiusToKelvin = (temperatureCelsius: number) =>
  temperatureCelsius + 273.15;

const kelvinToCelsius = (temperatureKelvin: number) =>
  temperatureKelvin - 273.15;

const convertTemperature = (
  value: number,
  fromUnitId: string,
  toUnitId: string
): number | null => {
  let celsiusValue: number | null = null;
  if (fromUnitId === "celsius") {
    celsiusValue = value;
  } else if (fromUnitId === "fahrenheit") {
    celsiusValue = fahrenheitToCelsius(value);
  } else if (fromUnitId === "kelvin") {
    celsiusValue = kelvinToCelsius(value);
  }
  if (celsiusValue == null) {
    return null;
  }
  if (toUnitId === "celsius") {
    return celsiusValue;
  }
  if (toUnitId === "fahrenheit") {
    return celsiusToFahrenheit(celsiusValue);
  }
  if (toUnitId === "kelvin") {
    return celsiusToKelvin(celsiusValue);
  }
  return null;
};

export const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "–";
  }
  if (value === 0) {
    return "0";
  }
  const absolute = Math.abs(value);
  if (absolute >= 1e7 || absolute < 1e-4) {
    return value.toExponential(3);
  }
  const fixed = value.toFixed(4);
  const trimmedTrailingZeros = fixed.replace(/(\.\d*?[1-9])0+$/, "$1");
  const trimmedDot = trimmedTrailingZeros.replace(/\.0+$/, "");
  return trimmedDot;
};

export const convertValue = (
  category: UnitCategoryId,
  value: number,
  fromUnitId: string,
  toUnitId: string
): number | null => {
  if (!Number.isFinite(value)) {
    return null;
  }
  if (category === "temperature") {
    return convertTemperature(value, fromUnitId, toUnitId);
  }
  if (category === "number-base") {
    return null;
  }
  const fromUnit = UNIT_MAP[fromUnitId];
  const toUnit = UNIT_MAP[toUnitId];
  if (!fromUnit || !toUnit) {
    return null;
  }
  if (!fromUnit.toBase || !toUnit.fromBase) {
    return null;
  }
  const baseValue = fromUnit.toBase(value);
  if (!Number.isFinite(baseValue)) {
    return null;
  }
  const result = toUnit.fromBase(baseValue);
  if (!Number.isFinite(result)) {
    return null;
  }
  return result;
};

export type NumberBaseId = "binary" | "octal" | "decimal" | "hexadecimal";

export const baseForId = (id: NumberBaseId): number => {
  if (id === "binary") return 2;
  if (id === "octal") return 8;
  if (id === "decimal") return 10;
  return 16;
};

export const allowedDigitPatternForBase = (base: NumberBaseId): RegExp => {
  if (base === "binary") {
    return /^[+-]?[01]+$/u;
  }
  if (base === "octal") {
    return /^[+-]?[0-7]+$/u;
  }
  if (base === "decimal") {
    return /^[+-]?[0-9]+$/u;
  }
  return /^[+-]?[0-9A-F]+$/u;
};

export const convertNumberBase = (
  input: string,
  fromId: NumberBaseId,
  toId: NumberBaseId
): string | null => {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }
  const pattern = allowedDigitPatternForBase(fromId);
  const upper = trimmed.toUpperCase();
  if (!pattern.test(upper)) {
    return null;
  }
  const fromBase = baseForId(fromId);
  const toBase = baseForId(toId);
  const isNegative = upper[0] === "-";
  const numericPart = isNegative || upper[0] === "+" ? upper.slice(1) : upper;
  const parsed = parseInt(numericPart, fromBase);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  const converted = parsed.toString(toBase).toUpperCase();
  return isNegative ? `-${converted}` : converted;
};


