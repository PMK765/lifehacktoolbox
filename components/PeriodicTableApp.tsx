"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ElementCategory, PeriodicElement } from "@/data/periodicElements";
import { periodicElements } from "@/data/periodicElements";

type StateFilter = "all" | "solid" | "liquid" | "gas";

type PropertyColorMode =
  | "none"
  | "electronegativity"
  | "atomicRadius"
  | "ionizationEnergy"
  | "meltingPoint"
  | "boilingPoint";

type HoverCoords = {
  group: number | null;
  period: number | null;
};

const allCategories: ElementCategory[] = [
  "alkali metal",
  "alkaline earth metal",
  "transition metal",
  "post-transition metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble gas",
  "lanthanide",
  "actinide",
  "unknown"
];

const mainElements = periodicElements.filter(
  (element) => element.category !== "lanthanide" && element.category !== "actinide"
);

const lanthanides = periodicElements.filter(
  (element) => element.category === "lanthanide"
);

const actinides = periodicElements.filter(
  (element) => element.category === "actinide"
);

const periods = [1, 2, 3, 4, 5, 6, 7];
const groups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const elementGrid: (PeriodicElement | null)[][] = periods.map((period) => {
  const row: (PeriodicElement | null)[] = groups.map(() => null);
  mainElements.forEach((element) => {
    if (element.period === period && typeof element.group === "number") {
      const index = element.group - 1;
      if (index >= 0 && index < groups.length) {
        row[index] = element;
      }
    }
  });
  return row;
});

const categoryBaseClasses: Record<ElementCategory, string> = {
  "alkali metal":
    "border-red-500/70 bg-red-500/70 text-slate-50 hover:border-red-300",
  "alkaline earth metal":
    "border-orange-400/70 bg-orange-400/70 text-slate-900 hover:border-orange-200",
  "transition metal":
    "border-amber-400/70 bg-amber-400/70 text-slate-900 hover:border-amber-200",
  "post-transition metal":
    "border-slate-500/80 bg-slate-500/80 text-slate-50 hover:border-slate-300",
  metalloid:
    "border-emerald-400/70 bg-emerald-400/70 text-slate-900 hover:border-emerald-200",
  nonmetal:
    "border-lime-400/80 bg-lime-400/80 text-slate-900 hover:border-lime-200",
  halogen:
    "border-purple-400/80 bg-purple-500/80 text-slate-50 hover:border-purple-300",
  "noble gas":
    "border-sky-400/80 bg-sky-500/80 text-slate-50 hover:border-sky-300",
  lanthanide:
    "border-pink-400/80 bg-pink-500/80 text-slate-50 hover:border-pink-300",
  actinide:
    "border-fuchsia-400/80 bg-fuchsia-500/80 text-slate-50 hover:border-fuchsia-300",
  unknown:
    "border-slate-500/70 bg-slate-600/80 text-slate-50 hover:border-slate-300"
};

const propertyFieldMap: Record<
  Exclude<PropertyColorMode, "none" | "atomicRadius">,
  keyof PeriodicElement
> = {
  electronegativity: "electronegativity",
  ionizationEnergy: "ionizationEnergy",
  meltingPoint: "meltingPointK",
  boilingPoint: "boilingPointK"
};

const getAtomicRadiusProxy = (element: PeriodicElement) => {
  const base = element.atomicNumber;
  const scaled = Math.pow(base, 1 / 3);
  return scaled;
};

const buildPropertyExtent = (mode: PropertyColorMode) => {
  if (mode === "none") {
    return null;
  }
  if (mode === "atomicRadius") {
    let min: number | null = null;
    let max: number | null = null;
    periodicElements.forEach((element) => {
      const value = getAtomicRadiusProxy(element);
      if (!Number.isFinite(value)) {
        return;
      }
      if (min == null || value < min) {
        min = value;
      }
      if (max == null || value > max) {
        max = value;
      }
    });
    if (min == null || max == null || min === max) {
      return null;
    }
    return { min, max };
  }
  const key = propertyFieldMap[mode];
  let min: number | null = null;
  let max: number | null = null;
  periodicElements.forEach((element) => {
    const raw = element[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return;
    }
    if (min == null || raw < min) {
      min = raw;
    }
    if (max == null || raw > max) {
      max = raw;
    }
  });
  if (min == null || max == null || min === max) {
    return null;
  }
  return { min, max };
};

const formatElectronConfiguration = (config: string) => {
  if (!config.trim()) {
    return "Not available";
  }
  return config.replace(/\s+/g, " ");
};

const formatTemperature = (kelvin?: number) => {
  if (typeof kelvin !== "number" || !Number.isFinite(kelvin)) {
    return "–";
  }
  const celsius = kelvin - 273.15;
  return `${Math.round(kelvin)} K (${Math.round(celsius)} °C)`;
};

const formatDensity = (density?: number) => {
  if (typeof density !== "number" || !Number.isFinite(density)) {
    return "–";
  }
  return `${density.toFixed(2)} g/cm³`;
};

const formatElectronegativity = (value?: number) => {
  if (typeof value !== "number" || value <= 0) {
    return "–";
  }
  return value.toFixed(2);
};

const formatIonizationEnergy = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "–";
  }
  return `${Math.round(value)} kJ/mol`;
};

const getShellDistribution = (atomicNumber: number) => {
  const capacities = [2, 8, 18, 32, 32, 18, 8];
  const shells: number[] = [];
  let remaining = atomicNumber;
  for (let index = 0; index < capacities.length; index += 1) {
    if (remaining <= 0) {
      break;
    }
    const capacity = capacities[index];
    const count = remaining > capacity ? capacity : remaining;
    shells.push(count);
    remaining -= count;
  }
  return shells;
};

type ElectronShellDiagramProps = {
  atomicNumber: number;
};

const ElectronShellDiagram = (props: ElectronShellDiagramProps) => {
  const { atomicNumber } = props;
  if (atomicNumber > 40) {
    return (
      <p className="text-xs text-slate-400">
        Electron shell diagrams are simplified here and shown for lighter
        elements (atomic number 40 and below).
      </p>
    );
  }
  const shells = getShellDistribution(atomicNumber);
  if (shells.length === 0) {
    return null;
  }
  const size = 180;
  const center = size / 2;
  const shellCount = shells.length;
  const maxRadius = center - 14;
  return (
    <svg
      width={size}
      height={size}
      className="mx-auto block text-slate-100"
      aria-hidden="true"
    >
      <circle
        cx={center}
        cy={center}
        r={10}
        fill="#facc15"
        className="drop-shadow"
      />
      {shells.map((count, index) => {
        const radius = ((index + 1) / shellCount) * maxRadius;
        const electrons: JSX.Element[] = [];
        if (count > 0) {
          for (let electronIndex = 0; electronIndex < count; electronIndex += 1) {
            const angle = (2 * Math.PI * electronIndex) / count;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            electrons.push(
              <circle
                key={electronIndex}
                cx={x}
                cy={y}
                r={3}
                fill="#e5e7eb"
                stroke="#020617"
                strokeWidth={0.7}
              />
            );
          }
        }
        return (
          <g key={index}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#4b5563"
              strokeWidth={0.7}
              strokeDasharray="3 2"
            />
            {electrons}
          </g>
        );
      })}
    </svg>
  );
};

const PeriodicTableApp = () => {
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | "all">(
    "all"
  );
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [propertyMode, setPropertyMode] = useState<PropertyColorMode>("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(
    null
  );
  const [hoverCoords, setHoverCoords] = useState<HoverCoords>({
    group: null,
    period: null
  });
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedElement) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedElement(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElement]);

  const propertyExtent = useMemo(
    () => buildPropertyExtent(propertyMode),
    [propertyMode]
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const getPropertyValue = (element: PeriodicElement): number | null => {
    if (propertyMode === "none") {
      return null;
    }
    if (propertyMode === "atomicRadius") {
      const value = getAtomicRadiusProxy(element);
      if (!Number.isFinite(value)) {
        return null;
      }
      return value;
    }
    const key = propertyFieldMap[propertyMode];
    const raw = element[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return null;
    }
    return raw;
  };

  const getPropertyColorStyle = (element: PeriodicElement) => {
    if (!propertyExtent) {
      return undefined;
    }
    const value = getPropertyValue(element);
    if (value == null) {
      return {
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.7))"
      };
    }
    const range = propertyExtent.max - propertyExtent.min;
    const ratio =
      range <= 0 ? 0.5 : (value - propertyExtent.min) / (propertyExtent.max - propertyExtent.min);
    const clamped = ratio < 0 ? 0 : ratio > 1 ? 1 : ratio;
    const startHue = 210;
    const endHue = 10;
    const hue = startHue + (endHue - startHue) * clamped;
    const lightness = 60 - 10 * clamped;
    const backgroundColor = `hsl(${hue}deg 85% ${lightness}%)`;
    return {
      background: backgroundColor
    } as const;
  };

  const passesStateFilter = (element: PeriodicElement) => {
    if (stateFilter === "all") {
      return true;
    }
    const state = element.standardState ?? "";
    if (!state) {
      return false;
    }
    if (stateFilter === "solid") {
      return state === "solid";
    }
    if (stateFilter === "liquid") {
      return state === "liquid";
    }
    if (stateFilter === "gas") {
      return state === "gas";
    }
    return true;
  };

  const passesCategoryFilter = (element: PeriodicElement) => {
    if (selectedCategory === "all") {
      return true;
    }
    return element.category === selectedCategory;
  };

  const matchesSearch = (element: PeriodicElement) => {
    if (!normalizedSearch) {
      return true;
    }
    if (element.symbol.toLowerCase() === normalizedSearch) {
      return true;
    }
    if (element.name.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    const numeric = Number.parseInt(normalizedSearch, 10);
    if (!Number.isNaN(numeric) && numeric === element.atomicNumber) {
      return true;
    }
    return false;
  };

  const handleElementClick = (element: PeriodicElement) => {
    setSelectedElement(element);
  };

  const handleExportPng = async () => {
    if (!tableRef.current) {
      return;
    }
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(tableRef.current, {
      backgroundColor: "#020617",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = "lifehacktoolbox-periodic-table.png";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportMessage("PNG downloaded.");
      window.setTimeout(() => {
        setExportMessage(null);
      }, 2000);
    });
  };

  const propertyModeLabel =
    propertyMode === "none"
      ? "Category colors"
      : propertyMode === "electronegativity"
      ? "Electronegativity trend"
      : propertyMode === "atomicRadius"
      ? "Atomic radius trend"
      : propertyMode === "ionizationEnergy"
      ? "Ionization energy trend"
      : propertyMode === "meltingPoint"
      ? "Melting point trend"
      : "Boiling point trend";

  const detailCategoryClass =
    selectedElement != null
      ? categoryBaseClasses[selectedElement.category]
      : categoryBaseClasses["unknown"];

  return (
    <div className="space-y-6 text-slate-100">
      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Interactive Periodic Table
            </h1>
            <p className="max-w-2xl text-sm text-slate-700">
              Hover over any element to see its neighbors, click for detailed
              atomic data, and use filters and property maps to explore trends
              across the table.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm md:items-end">
            <label className="flex items-center gap-2">
              <span className="whitespace-nowrap text-xs font-medium text-slate-700">
                Search by name, symbol, or atomic #
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="e.g. O, oxygen, 8"
                className="w-48 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
            <p className="text-[11px] text-slate-500">
              Hover highlights rows and columns on desktop. Click an element for
              full details.
            </p>
          </div>
        </div>
        <div className="grid gap-3 text-xs md:grid-cols-[2.2fr,1.3fr]">
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-900/95 p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Category
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-2 py-1 text-[11px] ${
                  selectedCategory === "all"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "border border-slate-600 bg-slate-800/70 text-slate-200 hover:border-emerald-400"
                }`}
              >
                All
              </button>
              {allCategories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      isActive
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "border border-slate-600 bg-slate-800/70 text-slate-200 hover:border-emerald-400"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                State
              </span>
              {["all", "solid", "liquid", "gas"].map((state) => {
                const typed = state as StateFilter;
                const isActive = stateFilter === typed;
                const label =
                  state === "all"
                    ? "All"
                    : state === "solid"
                    ? "Solid"
                    : state === "liquid"
                    ? "Liquid"
                    : "Gas";
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setStateFilter(typed)}
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      isActive
                        ? "bg-sky-500 text-slate-950 shadow-sm"
                        : "border border-slate-600 bg-slate-800/70 text-slate-200 hover:border-sky-400"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                  Property map
                </span>
                {(
                  [
                    "none",
                    "electronegativity",
                    "atomicRadius",
                    "ionizationEnergy",
                    "meltingPoint",
                    "boilingPoint"
                  ] as PropertyColorMode[]
                ).map((mode) => {
                  const isActive = propertyMode === mode;
                  const label =
                    mode === "none"
                      ? "Category"
                      : mode === "electronegativity"
                      ? "Electronegativity"
                      : mode === "atomicRadius"
                      ? "Atomic radius"
                      : mode === "ionizationEnergy"
                      ? "Ionization energy"
                      : mode === "meltingPoint"
                      ? "Melting point"
                      : "Boiling point";
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPropertyMode(mode)}
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        isActive
                          ? "bg-violet-500 text-slate-950 shadow-sm"
                          : "border border-slate-600 bg-slate-800/70 text-slate-200 hover:border-violet-400"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                {propertyModeLabel}. Higher values shift tiles toward warmer
                colors.
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-900/95 p-3 text-xs shadow-sm">
            <h2 className="text-[13px] font-semibold text-slate-100">
              Category legend
            </h2>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {allCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800/80 px-2 py-1"
                >
                  <span
                    className={`inline-block h-3 w-3 rounded ${categoryBaseClasses[category]}`}
                  />
                  <span className="text-[11px] text-slate-100">{category}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Darker borders highlight the hovered group and period on desktop.
              Search will emphasize matching tiles without hiding the rest of the
              table.
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-3">
        <div
          ref={tableRef}
          className="relative overflow-x-auto rounded-2xl border border-slate-800 bg-gradient-radial from-slate-950 via-slate-900 to-black p-4 shadow-[0_0_40px_rgba(15,23,42,0.9)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.16),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(129,140,248,0.18),transparent_45%),radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.9),transparent_55%)]" />
          <div className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300 ring-1 ring-slate-600/70">
            <img
              src="/icon.png"
              alt="LifeHackToolbox icon"
              className="h-4 w-4 rounded-full"
            />
            <span>lifehacktoolbox.com</span>
          </div>
          <div className="relative min-w-[920px] space-y-2">
            <div className="grid grid-cols-[auto_repeat(18,minmax(0,1fr))] gap-1 text-[11px] text-slate-300">
              <div className="flex items-end justify-center text-[10px] text-slate-500">
                Period
              </div>
              {groups.map((group) => {
                const isHoveredColumn =
                  hoverCoords.group != null && hoverCoords.group === group;
                return (
                  <div
                    key={group}
                    className={`flex items-end justify-center rounded-sm border border-transparent pb-0.5 text-[10px] ${
                      isHoveredColumn
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-100"
                        : "text-slate-300"
                    }`}
                  >
                    {group}
                  </div>
                );
              })}
            </div>
            {periods.map((period, periodIndex) => {
              const row = elementGrid[periodIndex];
              const isHoveredRow =
                hoverCoords.period != null && hoverCoords.period === period;
              return (
                <div
                  key={period}
                  className="grid grid-cols-[auto_repeat(18,minmax(0,1fr))] gap-1"
                >
                  <div
                    className={`flex items-center justify-center rounded-sm border border-transparent text-[10px] ${
                      isHoveredRow
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-100"
                        : "text-slate-300"
                    }`}
                  >
                    {period}
                  </div>
                  {row.map((element, index) => {
                    if (!element) {
                      return (
                        <div
                          key={index}
                          className="h-16 sm:h-20 lg:h-24 xl:h-24"
                        />
                      );
                    }
                    const passesCategory = passesCategoryFilter(element);
                    const passesState = passesStateFilter(element);
                    const matches = matchesSearch(element);
                    const isDimmedByFilter = !passesCategory || !passesState;
                    const isDimmedBySearch =
                      !!normalizedSearch && !matches && !isDimmedByFilter;
                    const isHighlighted =
                      hoverCoords.group === element.group ||
                      hoverCoords.period === element.period;
                    const categoryClasses = categoryBaseClasses[element.category];
                    const propertyStyle =
                      propertyMode === "none"
                        ? undefined
                        : getPropertyColorStyle(element);
                    const borderHighlightClass = isHighlighted
                      ? "ring-1 ring-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                      : "shadow-sm";
                    const opacityClass = isDimmedByFilter
                      ? "opacity-20"
                      : isDimmedBySearch
                      ? "opacity-50"
                      : "opacity-100";
                    const textColorClass =
                      propertyMode === "none"
                        ? ""
                        : "text-slate-900 border-slate-800/70";
                    return (
                      <button
                        key={element.atomicNumber}
                        type="button"
                        onClick={() => handleElementClick(element)}
                        onMouseEnter={() =>
                          setHoverCoords({
                            group: element.group ?? null,
                            period: element.period
                          })
                        }
                        onMouseLeave={() =>
                          setHoverCoords({ group: null, period: null })
                        }
                        className={`relative flex h-16 flex-col items-stretch rounded-md border px-1.5 py-1 text-left text-[11px] transition-all duration-150 sm:h-20 lg:h-24 ${categoryClasses} ${borderHighlightClass} ${opacityClass} ${textColorClass}`}
                        style={propertyStyle}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-semibold">
                            {element.atomicNumber}
                          </span>
                          {matches && normalizedSearch && (
                            <span className="rounded-full bg-emerald-500/90 px-1 text-[9px] font-semibold text-slate-950">
                              Match
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-col items-stretch gap-0.5">
                          <span className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                            {element.symbol}
                          </span>
                          <span className="text-[10px] font-mono text-slate-900">
                            {element.atomicMass.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-auto space-y-0.5 text-[8px] leading-tight text-slate-900">
                          <div className="truncate">{element.name}</div>
                          <div className="truncate opacity-80">
                            {element.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            <div className="mt-3 grid gap-2 text-[11px] text-slate-200 sm:grid-cols-[auto,1fr]">
              <div className="flex items-start justify-center pt-1 text-[10px] text-slate-400">
                f-block
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-pink-500/80 text-[10px] font-semibold text-slate-950">
                    La
                  </span>
                  <span>Lanthanides (57–71)</span>
                </div>
                <div className="grid auto-cols-[minmax(2.75rem,1fr)] grid-flow-col gap-1 overflow-x-auto rounded-md border border-slate-700 bg-slate-900/80 p-1">
                  {lanthanides.map((element) => {
                    const passesCategory = passesCategoryFilter(element);
                    const passesState = passesStateFilter(element);
                    const matches = matchesSearch(element);
                    const isDimmedByFilter = !passesCategory || !passesState;
                    const isDimmedBySearch =
                      !!normalizedSearch && !matches && !isDimmedByFilter;
                    const opacityClass = isDimmedByFilter
                      ? "opacity-20"
                      : isDimmedBySearch
                      ? "opacity-50"
                      : "opacity-100";
                    return (
                      <button
                        key={element.atomicNumber}
                        type="button"
                        onClick={() => handleElementClick(element)}
                        className={`flex h-16 flex-col items-stretch rounded-md border px-1.5 py-1 text-left text-[11px] transition-all duration-150 ${categoryBaseClasses[element.category]} ${opacityClass}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-semibold">
                            {element.atomicNumber}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-baseline justify-between gap-1">
                          <span className="text-base font-semibold tracking-tight">
                            {element.symbol}
                          </span>
                          <span className="text-[10px]">
                            {element.atomicMass.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-1 text-[9px] text-slate-900/90">
                          <span className="truncate">
                            {element.name.length > 9
                              ? `${element.name.slice(0, 9)}…`
                              : element.name}
                          </span>
                          <span className="truncate text-right">
                            {element.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-fuchsia-500/80 text-[10px] font-semibold text-slate-950">
                    Ac
                  </span>
                  <span>Actinides (89–103)</span>
                </div>
                <div className="grid auto-cols-[minmax(2.75rem,1fr)] grid-flow-col gap-1 overflow-x-auto rounded-md border border-slate-700 bg-slate-900/80 p-1">
                  {actinides.map((element) => {
                    const passesCategory = passesCategoryFilter(element);
                    const passesState = passesStateFilter(element);
                    const matches = matchesSearch(element);
                    const isDimmedByFilter = !passesCategory || !passesState;
                    const isDimmedBySearch =
                      !!normalizedSearch && !matches && !isDimmedByFilter;
                    const opacityClass = isDimmedByFilter
                      ? "opacity-20"
                      : isDimmedBySearch
                      ? "opacity-50"
                      : "opacity-100";
                    return (
                      <button
                        key={element.atomicNumber}
                        type="button"
                        onClick={() => handleElementClick(element)}
                        className={`flex h-16 flex-col items-stretch rounded-md border px-1.5 py-1 text-left text-[11px] transition-all duration-150 ${categoryBaseClasses[element.category]} ${opacityClass}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-semibold">
                            {element.atomicNumber}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-baseline justify-between gap-1">
                          <span className="text-base font-semibold tracking-tight">
                            {element.symbol}
                          </span>
                          <span className="text-[10px]">
                            {element.atomicMass.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-1 text-[9px] text-slate-900/90">
                          <span className="truncate">
                            {element.name.length > 9
                              ? `${element.name.slice(0, 9)}…`
                              : element.name}
                          </span>
                          <span className="truncate text-right">
                            {element.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 text-sm text-slate-700">
            <button
              type="button"
              onClick={handleExportPng}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 hover:shadow-md"
            >
              <span>Download table as PNG</span>
            </button>
            {exportMessage && (
              <p className="text-xs text-emerald-600">{exportMessage}</p>
            )}
          </div>
          <div className="text-xs text-slate-500">
            View is optimized for desktop and tablet. On small screens, scroll
            horizontally to see the full table.
          </div>
        </div>
      </section>
      {selectedElement && (
        <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-black/40 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close element details"
            className="h-full w-full cursor-default"
            onClick={() => setSelectedElement(null)}
          />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-800 bg-slate-950/95 px-4 py-5 text-sm shadow-[0_0_40px_rgba(15,23,42,0.9)] sm:max-w-lg">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                    Atomic #{selectedElement.atomicNumber}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                    Period {selectedElement.period}
                    {selectedElement.group ? ` · Group ${selectedElement.group}` : ""}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold tracking-tight text-white">
                    {selectedElement.symbol}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-100">
                      {selectedElement.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Atomic mass {selectedElement.atomicMass.toFixed(3)} u
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedElement(null)}
                className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-200 shadow-sm hover:border-emerald-400 hover:text-emerald-400"
              >
                Close
              </button>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shadow-sm ${detailCategoryClass}`}
              >
                {selectedElement.category}
              </span>
              {selectedElement.standardState && (
                <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                  Standard state: {selectedElement.standardState}
                </span>
              )}
              {selectedElement.discovered && (
                <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                  Discovered: {selectedElement.discovered}
                </span>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Core properties
                </h2>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-100">
                  <div>
                    <dt className="text-slate-400">Melting point</dt>
                    <dd className="font-medium">
                      {formatTemperature(selectedElement.meltingPointK)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Boiling point</dt>
                    <dd className="font-medium">
                      {formatTemperature(selectedElement.boilingPointK)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Density</dt>
                    <dd className="font-medium">
                      {formatDensity(selectedElement.density)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Electronegativity (Pauling)</dt>
                    <dd className="font-medium">
                      {formatElectronegativity(selectedElement.electronegativity)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">1st ionization energy</dt>
                    <dd className="font-medium">
                      {formatIonizationEnergy(selectedElement.ionizationEnergy)}
                    </dd>
                  </div>
                </dl>
                <div className="space-y-1 pt-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Electron configuration
                  </h3>
                  <p className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-mono text-slate-100">
                    {formatElectronConfiguration(
                      selectedElement.electronConfiguration
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Electron shells
                </h2>
                <ElectronShellDiagram atomicNumber={selectedElement.atomicNumber} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Overview
              </h2>
              <p className="text-sm leading-relaxed text-slate-100">
                {selectedElement.summary}
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default PeriodicTableApp;


