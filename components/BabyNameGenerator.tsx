"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  BabyNameEntry,
  BabyNameGender,
  BabyNameRegion,
  BabyNameCountryCode
} from "@/types/babyName";

type GenderTab = "boy" | "girl" | "neutral" | "all";

type FavoriteCombo = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  summary: string;
};

type StoredState = {
  selectedGenderTab: GenderTab;
  selectedRegion: BabyNameRegion | "any";
  selectedCountryCode: BabyNameCountryCode | "any";
  searchQuery: string;
  lastName: string;
  favoriteCombos: FavoriteCombo[];
};

const STORAGE_KEY = "lht_baby_name_generator_v1";

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const COUNTRY_NAME_MAP: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  PE: "Peru",
  CO: "Colombia",
  VE: "Venezuela",
  GB: "United Kingdom",
  EN: "England",
  IE: "Ireland",
  FR: "France",
  DE: "Germany",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  ES: "Spain",
  PT: "Portugal",
  IT: "Italy",
  GR: "Greece",
  NO: "Norway",
  SE: "Sweden",
  DK: "Denmark",
  FI: "Finland",
  IS: "Iceland",
  PL: "Poland",
  CZ: "Czech Republic",
  SK: "Slovakia",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  UA: "Ukraine",
  RU: "Russia",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  MA: "Morocco",
  DZ: "Algeria",
  TN: "Tunisia",
  LY: "Libya",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",
  GH: "Ghana",
  ET: "Ethiopia",
  ZA: "South Africa",
  TZ: "Tanzania",
  UG: "Uganda",
  IN: "India",
  PK: "Pakistan",
  BD: "Bangladesh",
  LK: "Sri Lanka",
  NP: "Nepal",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  TW: "Taiwan",
  TH: "Thailand",
  VN: "Vietnam",
  MY: "Malaysia",
  PH: "Philippines",
  ID: "Indonesia",
  SG: "Singapore",
  KH: "Cambodia",
  LA: "Laos",
  AU: "Australia",
  NZ: "New Zealand",
  FJ: "Fiji",
  PG: "Papua New Guinea",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  IR: "Iran",
  IQ: "Iraq",
  IL: "Israel",
  JO: "Jordan",
  LB: "Lebanon",
  SY: "Syria",
  YE: "Yemen",
  KW: "Kuwait",
  QA: "Qatar",
  OM: "Oman",
  BH: "Bahrain"
};

const labelForCountry = (code: BabyNameCountryCode) => {
  const upper = code.toUpperCase();
  const name = COUNTRY_NAME_MAP[upper];
  return name ? `${name} (${upper})` : upper;
};

const matchesGenderTab = (
  entry: BabyNameEntry,
  tab: GenderTab
) => {
  if (tab === "all") {
    return true;
  }
  if (tab === "boy") {
    return (
      entry.gender === "boy" ||
      entry.gender === "boy/girl"
    );
  }
  if (tab === "girl") {
    return (
      entry.gender === "girl" ||
      entry.gender === "boy/girl"
    );
  }
  if (tab === "neutral") {
    return (
      entry.gender === "neutral" ||
      entry.gender === "boy/girl"
    );
  }
  return true;
};

const BabyNameGenerator = () => {
  const [allNames, setAllNames] =
    useState<BabyNameEntry[]>([]);
  const [selectedGenderTab, setSelectedGenderTab] =
    useState<GenderTab>("all");
  const [selectedRegion, setSelectedRegion] = useState<
    BabyNameRegion | "any"
  >("any");
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<BabyNameCountryCode | "any">("any");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastName, setLastName] = useState("");
  const [favoriteCombos, setFavoriteCombos] = useState<
    FavoriteCombo[]
  >([]);

  const [selectedFirstName, setSelectedFirstName] =
    useState<BabyNameEntry | null>(null);
  const [selectedMiddleName, setSelectedMiddleName] =
    useState<BabyNameEntry | null>(null);
  const [lockedFirst, setLockedFirst] = useState(false);
  const [lockedMiddle, setLockedMiddle] = useState(false);
  const [noMatchMessage, setNoMatchMessage] = useState<
    string | null
  >(null);

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    void import("../data/babyNames.fromFirstNames.json").then(
      (module) => {
        const loaded = module.default as BabyNameEntry[] | undefined;
        if (loaded && Array.isArray(loaded) && loaded.length > 0) {
          setAllNames(loaded);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setHasHydrated(true);
      return;
    }
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed) {
      setSelectedGenderTab(parsed.selectedGenderTab ?? "all");
      setSelectedRegion(parsed.selectedRegion ?? "any");
      setSelectedCountryCode(
        parsed.selectedCountryCode ?? "any"
      );
      setSearchQuery(parsed.searchQuery ?? "");
      setLastName(parsed.lastName ?? "");
      setFavoriteCombos(parsed.favoriteCombos ?? []);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const toStore: StoredState = {
      selectedGenderTab,
      selectedRegion,
      selectedCountryCode,
      searchQuery,
      lastName,
      favoriteCombos
    };
    const serialized = JSON.stringify(toStore);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [
    favoriteCombos,
    hasHydrated,
    lastName,
    searchQuery,
    selectedCountryCode,
    selectedGenderTab,
    selectedRegion
  ]);

  const allRegions: (BabyNameRegion | "any")[] = [
    "any",
    "North America",
    "Latin America",
    "Western Europe",
    "Eastern Europe",
    "Northern Europe",
    "Southern Europe",
    "Middle East",
    "North Africa",
    "Sub-Saharan Africa",
    "South Asia",
    "East Asia",
    "Southeast Asia",
    "Oceania",
    "Other"
  ];

  const allCountryCodes = useMemo(() => {
    const codes = new Set<BabyNameCountryCode>();
    allNames.forEach((entry) => {
      entry.originCountryCodes.forEach((code) =>
        codes.add(code)
      );
    });
    return Array.from(codes).sort((first, second) =>
      first.localeCompare(second)
    );
  }, []);

  const availableCountryCodes = useMemo(() => {
    if (selectedRegion === "any") {
      return allCountryCodes;
    }
    const codes = new Set<BabyNameCountryCode>();
    allNames.forEach((entry) => {
      if (
        entry.originRegions.includes(selectedRegion)
      ) {
        entry.originCountryCodes.forEach((code) =>
          codes.add(code)
        );
      }
    });
    return Array.from(codes).sort((first, second) =>
      first.localeCompare(second)
    );
  }, [allCountryCodes, selectedRegion]);

  const filteredNames = useMemo(
    () =>
      allNames.filter((entry) => {
        if (!matchesGenderTab(entry, selectedGenderTab)) {
          return false;
        }
        if (
          selectedRegion !== "any" &&
          !entry.originRegions.includes(
            selectedRegion as BabyNameRegion
          )
        ) {
          return false;
        }
        if (
          selectedCountryCode !== "any" &&
          !entry.originCountryCodes.includes(
            selectedCountryCode
          )
        ) {
          return false;
        }
        if (!searchQuery.trim()) {
          return true;
        }
        const query = searchQuery.toLowerCase();
        const inName = entry.name
          .toLowerCase()
          .includes(query);
        const inMeanings = entry.meanings.some((meaning) =>
          meaning.toLowerCase().includes(query)
        );
        return inName || inMeanings;
      }),
    [
      searchQuery,
      selectedCountryCode,
      selectedGenderTab,
      selectedRegion
    ]
  );

  const randomFrom = (names: BabyNameEntry[]) => {
    if (names.length === 0) {
      return null;
    }
    const index = Math.floor(Math.random() * names.length);
    return names[index];
  };

  const handleRandomize = () => {
    if (filteredNames.length === 0) {
      setNoMatchMessage(
        "No names match the current filters. Try broadening your search."
      );
      return;
    }
    setNoMatchMessage(null);
    if (!lockedFirst) {
      const first = randomFrom(filteredNames);
      setSelectedFirstName(first);
    }
    if (!lockedMiddle) {
      const middle = randomFrom(filteredNames);
      setSelectedMiddleName(middle);
    }
  };

  const fullNamePreview = useMemo(() => {
    const pieces: string[] = [];
    if (selectedFirstName) {
      pieces.push(selectedFirstName.name);
    }
    if (selectedMiddleName) {
      pieces.push(selectedMiddleName.name);
    }
    if (lastName.trim()) {
      pieces.push(lastName.trim());
    }
    if (pieces.length === 0) {
      return "Add a first and last name to see a full preview.";
    }
    return pieces.join(" ");
  }, [lastName, selectedFirstName, selectedMiddleName]);

  const addFavoriteCombo = () => {
    if (!selectedFirstName && !selectedMiddleName) {
      return;
      }
    if (!lastName.trim()) {
      return;
    }
    const first = selectedFirstName
      ? selectedFirstName.name
      : "";
    const middle = selectedMiddleName
      ? selectedMiddleName.name
      : null;
    if (!first && !middle) {
      return;
    }
    const meaningParts: string[] = [];
    if (selectedFirstName?.meanings[0]) {
      meaningParts.push(selectedFirstName.meanings[0]);
    }
    if (
      selectedMiddleName &&
      selectedMiddleName.meanings[0] &&
      selectedMiddleName.meanings[0] !==
        selectedFirstName?.meanings[0]
    ) {
      meaningParts.push(selectedMiddleName.meanings[0]);
    }
    const summary =
      meaningParts.length > 0
        ? meaningParts.join(", ")
        : "Saved combination";
    const combo: FavoriteCombo = {
      id: createId(),
      firstName: first,
      middleName: middle,
      lastName: lastName.trim(),
      summary
    };
    setFavoriteCombos((previous) => [
      combo,
      ...previous
    ]);
  };

  const handleApplyFavorite = (combo: FavoriteCombo) => {
    const first = allNames.find(
      (entry) =>
        entry.name.toLowerCase() ===
        combo.firstName.toLowerCase()
    );
    const middle =
      combo.middleName !== null && combo.middleName !== ""
        ? allNames.find(
            (entry) =>
              entry.name.toLowerCase() ===
              (combo.middleName ?? "").toLowerCase()
          ) ?? null
        : null;
    setSelectedFirstName(first ?? null);
    setSelectedMiddleName(middle);
    setLastName(combo.lastName);
  };

  const handleRemoveFavorite = (id: string) => {
    setFavoriteCombos((previous) =>
      previous.filter((combo) => combo.id !== id)
    );
  };

  const filteredNamesForList = filteredNames.slice(
    0,
    150
  );

  const genderChip = (gender: BabyNameGender | "boy/girl") => {
    if (gender === "boy") {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-800">
          Boy
        </span>
      );
    }
    if (gender === "girl") {
      return (
        <span className="inline-flex items-center rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-800">
          Girl
        </span>
      );
    }
    if (gender === "neutral") {
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-800">
          Neutral
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
        Boy / Girl
      </span>
    );
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Names and favorites stay only in this browser.
        </p>
        <p>
          Your filters and saved combinations are stored with local storage on
          this device. Clearing browser data or switching devices will remove
          them, so keep separate notes if you want a permanent record.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
          {(
            [
              ["boy", "Boy"],
              ["girl", "Girl"],
              ["neutral", "Neutral"],
              ["all", "All"]
            ] as [GenderTab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedGenderTab(value)}
              className={`px-3 py-1 ${
                selectedGenderTab === value
                  ? "bg-white font-semibold text-slate-900"
                  : "text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            className={inputBaseClasses}
            placeholder="Search by name or meaning…"
          />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Filter by origin
              </h2>
              <p className="text-[11px] text-slate-600">
                Click a region or choose from the dropdowns to narrow the list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion("any");
                setSelectedCountryCode("any");
              }}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
            >
              Clear filters
            </button>
          </div>
          <div className="hidden rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700 md:block">
            <svg
              viewBox="0 0 1000 380"
              className="h-60 w-full"
            >
              {(
                [
                  ["North America", { x: 80, y: 90, w: 180, h: 80 }],
                  ["Latin America", { x: 160, y: 190, w: 160, h: 110 }],
                  ["Western Europe", { x: 420, y: 110, w: 120, h: 70 }],
                  ["Northern Europe", { x: 430, y: 50, w: 140, h: 50 }],
                  ["Southern Europe", { x: 430, y: 190, w: 140, h: 60 }],
                  ["Eastern Europe", { x: 560, y: 110, w: 130, h: 80 }],
                  ["Middle East", { x: 640, y: 180, w: 130, h: 70 }],
                  ["North Africa", { x: 520, y: 220, w: 140, h: 70 }],
                  ["Sub-Saharan Africa", { x: 540, y: 290, w: 140, h: 70 }],
                  ["South Asia", { x: 720, y: 220, w: 130, h: 70 }],
                  ["East Asia", { x: 820, y: 150, w: 130, h: 80 }],
                  ["Southeast Asia", { x: 820, y: 250, w: 130, h: 80 }],
                  ["Oceania", { x: 870, y: 310, w: 100, h: 60 }]
                ] as [BabyNameRegion, { x: number; y: number; w: number; h: number }][]
              ).map(([region, rect]) => {
                const isSelected = selectedRegion === region;
                return (
                  <g
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.w}
                      height={rect.h}
                      rx={12}
                      ry={12}
                      fill={
                        isSelected ? "#dcfce7" : "#e5e7eb"
                      }
                      stroke={
                        isSelected ? "#22c55e" : "#cbd5f5"
                      }
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={rect.x + rect.w / 2}
                      y={rect.y + rect.h / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="select-none"
                      fill="#1f2937"
                      fontSize={12}
                    >
                      {region}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(event) =>
                  setSelectedRegion(
                    event.target.value as BabyNameRegion | "any"
                  )
                }
                className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {allRegions.map((region) => (
                  <option key={region} value={region}>
                    {region === "any" ? "Any region" : region}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Country code
              </label>
              <select
                value={selectedCountryCode}
                onChange={(event) =>
                  setSelectedCountryCode(
                    event.target.value as BabyNameCountryCode | "any"
                  )
                }
                className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="any">Any country</option>
                {availableCountryCodes.map((code) => (
                  <option key={code} value={code}>
                    {labelForCountry(code)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Matching names
            </h3>
            <div className="max-h-80 overflow-auto rounded-md border border-slate-200">
              <ul className="divide-y divide-slate-200 text-xs">
                {filteredNamesForList.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 bg-white px-3 py-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {entry.name}
                        </p>
                        {genderChip(entry.gender)}
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {entry.originRegions.join(", ")}
                      </p>
                      {entry.meanings[0] && (
                        <p className="text-[11px] text-slate-700">
                          {entry.meanings[0]}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFirstName(entry)
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        Use as first
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMiddleName(entry)
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        Use as middle
                      </button>
                    </div>
                  </li>
                ))}
                {filteredNamesForList.length === 0 && (
                  <li className="px-3 py-3 text-center text-[11px] text-slate-500">
                    No names match these filters yet. Try another region,
                    country, or search term.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Randomizer &amp; full name preview
            </h2>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                className={inputBaseClasses}
                placeholder="Your family name"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  First name
                </p>
                <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {selectedFirstName
                      ? selectedFirstName.name
                      : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLockedFirst((previous) => !previous)
                    }
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium shadow-sm ${
                      lockedFirst
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {lockedFirst ? "Locked" : "Lock"}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  Middle name
                </p>
                <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {selectedMiddleName
                      ? selectedMiddleName.name
                      : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLockedMiddle(
                        (previous) => !previous
                      )
                    }
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium shadow-sm ${
                      lockedMiddle
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {lockedMiddle ? "Locked" : "Lock"}
                  </button>
                </div>
              </div>
            </div>
            {noMatchMessage && (
              <p className="text-[11px] text-red-600">
                {noMatchMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Randomize names
            </button>
            <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Full name preview
              </p>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {fullNamePreview}
              </p>
            </div>
            <button
              type="button"
              onClick={addFavoriteCombo}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Save this combo
            </button>
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Saved favorites
            </h3>
            <div className="max-h-64 overflow-auto rounded-md border border-slate-200">
              <ul className="divide-y divide-slate-200 text-xs">
                {favoriteCombos.map((combo) => (
                  <li
                    key={combo.id}
                    className="flex items-start justify-between gap-3 bg-white px-3 py-2"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {combo.firstName}{" "}
                        {combo.middleName
                          ? `${combo.middleName} `
                          : ""}
                        {combo.lastName}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {combo.summary}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyFavorite(combo)
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        Use
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFavorite(combo.id)
                        }
                        className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
                {favoriteCombos.length === 0 && (
                  <li className="px-3 py-3 text-center text-[11px] text-slate-500">
                    Save combinations here to compare your top choices.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BabyNameGenerator;


