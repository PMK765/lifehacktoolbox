"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ExportableImageFrame from "@/components/ExportableImageFrame";

export type DiceType = 4 | 6 | 8 | 10 | 12 | 20;

export type DicePoolItem = {
  id: string;
  sides: DiceType;
  count: number;
};

export type RollResultDie = {
  sides: DiceType;
  value: number;
};

export type RollResult = {
  id: string;
  timestamp: number;
  dice: RollResultDie[];
  modifier: number;
  total: number;
  label?: string;
};

type DiceColorKey = DiceType;

const DICE_COLORS: Record<DiceColorKey, string> = {
  4: "bg-sky-500 text-slate-900 border-sky-400",
  6: "bg-emerald-500 text-slate-900 border-emerald-400",
  8: "bg-indigo-500 text-slate-50 border-indigo-400",
  10: "bg-amber-500 text-slate-900 border-amber-400",
  12: "bg-rose-500 text-slate-50 border-rose-400",
  20: "bg-purple-500 text-slate-50 border-purple-400"
};

const STORAGE_POOL_KEY = "lht_dice_pool_v1";
const STORAGE_MODIFIER_KEY = "lht_dice_modifier_v1";
const STORAGE_HISTORY_KEY = "lht_dice_history_v1";

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const getRandomIntInclusive = (min: number, max: number) => {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  if (high < low) {
    return low;
  }
  const range = high - low + 1;
  const random =
    typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? (() => {
          const array = new Uint32Array(1);
          crypto.getRandomValues(array);
          return array[0] / 0xffffffff;
        })()
      : Math.random();
  return low + Math.floor(random * range);
};

const parseModifier = (input: string): number => {
  const trimmed = input.trim();
  if (!trimmed) {
    return 0;
  }
  const normalized =
    trimmed[0] === "+" || trimmed[0] === "-"
      ? trimmed
      : trimmed;
  const value = Number(normalized);
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.round(value);
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString();
};

const DiceRollerApp = () => {
  const [dicePool, setDicePool] = useState<DicePoolItem[]>([
    { id: createId(), sides: 20, count: 1 }
  ]);
  const [modifier, setModifier] = useState<string>("0");
  const [currentLabel, setCurrentLabel] = useState<string>("");
  const [currentRoll, setCurrentRoll] = useState<RollResult | null>(
    null
  );
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(
    null
  );

  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedPool = window.localStorage.getItem(STORAGE_POOL_KEY);
    const storedModifier =
      window.localStorage.getItem(STORAGE_MODIFIER_KEY);
    const storedHistory =
      window.localStorage.getItem(STORAGE_HISTORY_KEY);
    if (storedPool) {
      const parsed = JSON.parse(storedPool) as DicePoolItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDicePool(
          parsed.map((item) => ({
            ...item,
            count:
              typeof item.count === "number" && item.count > 0
                ? item.count
                : 1
          }))
        );
      }
    }
    if (storedModifier) {
      setModifier(storedModifier);
    }
    if (storedHistory) {
      const parsedHistory = JSON.parse(
        storedHistory
      ) as RollResult[];
      if (Array.isArray(parsedHistory)) {
        setRollHistory(parsedHistory.slice(0, 20));
        if (parsedHistory.length > 0) {
          setCurrentRoll(parsedHistory[0]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (dicePool.length > 0) {
      const serialized = JSON.stringify(dicePool);
      window.localStorage.setItem(STORAGE_POOL_KEY, serialized);
    } else {
      window.localStorage.removeItem(STORAGE_POOL_KEY);
    }
    window.localStorage.setItem(STORAGE_MODIFIER_KEY, modifier);
    if (rollHistory.length > 0) {
      const serializedHistory = JSON.stringify(rollHistory);
      window.localStorage.setItem(
        STORAGE_HISTORY_KEY,
        serializedHistory
      );
    } else {
      window.localStorage.removeItem(STORAGE_HISTORY_KEY);
    }
  }, [dicePool, modifier, rollHistory]);

  const totalDiceCount = dicePool.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const groupedDice = useMemo(() => {
    if (!currentRoll) {
      return new Map<DiceType, RollResultDie[]>();
    }
    const map = new Map<DiceType, RollResultDie[]>();
    currentRoll.dice.forEach((die) => {
      const existing = map.get(die.sides) ?? [];
      existing.push(die);
      map.set(die.sides, existing);
    });
    return map;
  }, [currentRoll]);

  const handleAddDiceRow = () => {
    setDicePool((previous) => [
      ...previous,
      { id: createId(), sides: 6, count: 1 }
    ]);
  };

  const handleUpdateDiceRow = (
    id: string,
    updates: Partial<DicePoolItem>
  ) => {
    setDicePool((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              count:
                typeof updates.count === "number"
                  ? Math.max(1, Math.min(20, updates.count))
                  : item.count
            }
          : item
      )
    );
  };

  const handleRemoveDiceRow = (id: string) => {
    setDicePool((previous) => {
      const filtered = previous.filter((item) => item.id !== id);
      if (filtered.length === 0) {
        return [{ id: createId(), sides: 6, count: 1 }];
      }
      return filtered;
    });
  };

  const handleRoll = () => {
    if (isRolling) {
      return;
    }
    if (dicePool.length === 0) {
      return;
    }
    const parsedModifier = parseModifier(modifier);
    const diceResults: RollResultDie[] = [];
    dicePool.forEach((item) => {
      const clampedCount = Math.max(1, Math.min(20, item.count));
      for (let index = 0; index < clampedCount; index += 1) {
        const value = getRandomIntInclusive(1, item.sides);
        diceResults.push({ sides: item.sides, value });
      }
    });
    const sum = diceResults.reduce(
      (accumulator, die) => accumulator + die.value,
      0
    );
    const total = sum + parsedModifier;
    const id = createId();
    const timestamp = Date.now();
    const roll: RollResult = {
      id,
      timestamp,
      dice: diceResults,
      modifier: parsedModifier,
      total,
      label: currentLabel.trim() || undefined
    };
    setIsRolling(true);
    setCurrentRoll(roll);
    setRollHistory((previous) => {
      const next = [roll, ...previous];
      if (next.length > 20) {
        return next.slice(0, 20);
      }
      return next;
    });
    window.setTimeout(() => {
      setIsRolling(false);
    }, 600);
  };

  const handleExportPng = async () => {
    if (!frameRef.current || !currentRoll) {
      return;
    }
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(frameRef.current, {
      backgroundColor: "#0f172a",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      const timestamp = new Date(currentRoll.timestamp)
        .toISOString()
        .replace(/[:.]/g, "-");
      link.href = url;
      link.download = `dice-roll-${timestamp}.png`;
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

  const handleClearHistory = () => {
    setRollHistory([]);
  };

  const totalSummary = useMemo(() => {
    if (!currentRoll) {
      return "";
    }
    const countsBySides = new Map<DiceType, number>();
    currentRoll.dice.forEach((die) => {
      const current = countsBySides.get(die.sides) ?? 0;
      countsBySides.set(die.sides, current + 1);
    });
    const parts: string[] = [];
    countsBySides.forEach((count, sides) => {
      parts.push(`${count}d${sides}`);
    });
    const dicePart = parts.join(" + ");
    const modifierPart =
      currentRoll.modifier === 0
        ? ""
        : currentRoll.modifier > 0
        ? ` + ${currentRoll.modifier}`
        : ` - ${Math.abs(currentRoll.modifier)}`;
    return `${dicePart}${modifierPart || ""} = ${
      currentRoll.total
    }`;
  }, [currentRoll]);

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-lg md:p-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-50 md:text-lg">
              Custom Dice Roller &amp; RPG Dice Simulator
            </h2>
            <p className="max-w-2xl text-xs text-slate-300 md:text-sm">
              Build a pool of d4, d6, d8, d10, d12, and d20 dice, add an
              optional modifier, and roll everything at once with satisfying
              animations and a detailed breakdown.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="rounded-full bg-slate-800 px-3 py-1">
              Dice in pool:{" "}
              <span className="font-semibold">{totalDiceCount}</span>
            </div>
          </div>
        </header>
        <div className="space-y-4 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)] md:gap-4">
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 md:p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold uppercase tracking-wide text-slate-400">
                  Dice pool
                </span>
                <button
                  type="button"
                  onClick={handleAddDiceRow}
                  className="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-600/10 px-2.5 py-1 text-xs font-medium text-emerald-300 shadow-sm hover:bg-emerald-600/20"
                >
                  Add dice
                </button>
              </div>
              <div className="space-y-2">
                {dicePool.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-xs md:gap-3"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-slate-300">Count</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateDiceRow(item.id, {
                            count: item.count - 1
                          })
                        }
                        className="h-6 w-6 rounded-md border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={item.count}
                        onChange={(event) =>
                          handleUpdateDiceRow(item.id, {
                            count:
                              Number(event.target.value) || item.count
                          })
                        }
                        className="h-8 w-14 rounded-md border border-slate-700 bg-slate-950 px-2 text-center text-xs text-slate-50 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateDiceRow(item.id, {
                            count: item.count + 1
                          })
                        }
                        className="h-6 w-6 rounded-md border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Die</span>
                      <select
                        value={item.sides}
                        onChange={(event) =>
                          handleUpdateDiceRow(item.id, {
                            sides: Number(
                              event.target.value
                            ) as DiceType
                          })
                        }
                        className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-50 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      >
                        {[4, 6, 8, 10, 12, 20].map((sides) => (
                          <option key={sides} value={sides}>
                            d{sides}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveDiceRow(item.id)}
                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:border-rose-500 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 text-xs text-slate-200 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Modifier
                  </label>
                  <input
                    type="text"
                    value={modifier}
                    onChange={(event) => setModifier(event.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="+3, -2, 0"
                  />
                  <p className="text-[11px] text-slate-400">
                    Applied once to the sum of all dice.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Roll label (optional)
                  </label>
                  <input
                    type="text"
                    value={currentLabel}
                    onChange={(event) =>
                      setCurrentLabel(event.target.value)
                    }
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="Attack roll, Stealth check, Fireball damage…"
                  />
                  <p className="text-[11px] text-slate-400">
                    Saved into history with each roll.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRoll}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
                  disabled={isRolling || totalDiceCount === 0}
                >
                  <span className={isRolling ? "animate-spin" : ""}>
                    🎲
                  </span>
                  <span>{isRolling ? "Rolling…" : "Roll dice"}</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  Uses secure randomness when available. All rolls stay in your
                  browser.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <ExportableImageFrame
              ref={frameRef}
              title="LifeHackToolbox Dice Roll"
              className="bg-slate-900/90 text-slate-100"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {currentRoll?.label
                        ? currentRoll.label
                        : "Current roll"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {currentRoll
                        ? formatTimestamp(currentRoll.timestamp)
                        : "No rolls yet. Build a dice pool and roll to see results."}
                    </p>
                  </div>
                  {currentRoll && (
                    <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                      Total:{" "}
                      <span className="font-mono text-base font-semibold text-emerald-300">
                        {currentRoll.total}
                      </span>
                    </div>
                  )}
                </div>
                {currentRoll && (
                  <div
                    className={`space-y-3 rounded-xl border border-slate-700 bg-slate-900/80 p-3 ${
                      isRolling ? "animate-pulse" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-200">
                        Total
                      </p>
                      <p className="text-3xl font-bold tracking-tight text-emerald-400">
                        {currentRoll.total}
                      </p>
                      {totalSummary && (
                        <p className="text-[11px] text-slate-300">
                          {totalSummary}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-200">
                        Dice breakdown
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(groupedDice.entries())
                          .sort(([a], [b]) => a - b)
                          .map(([sides, dice]) => (
                            <div
                              key={sides}
                              className="min-w-[7rem] rounded-lg border border-slate-700 bg-slate-950/80 p-2 text-xs"
                            >
                              <p className="mb-1 flex items-center justify-between text-[11px] text-slate-300">
                                <span className="font-semibold">
                                  d{sides}
                                </span>
                                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
                                  {dice.length} die
                                  {dice.length === 1 ? "" : "s"}
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {dice.map((die, index) => (
                                  <div
                                    key={`${sides}-${index}-${die.value}`}
                                    className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md border text-xs font-semibold shadow-sm ${
                                      DICE_COLORS[sides]
                                    } ${
                                      isRolling
                                        ? "animate-bounce"
                                        : ""
                                    }`}
                                  >
                                    {die.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ExportableImageFrame>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleExportPng}
                className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm hover:border-emerald-400 hover:text-emerald-300"
                disabled={!currentRoll}
              >
                <span>Download roll as image</span>
              </button>
              {exportMessage && (
                <span className="text-[11px] text-emerald-300">
                  {exportMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-lg md:p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">
            Roll history
          </h3>
          <button
            type="button"
            onClick={handleClearHistory}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-300 hover:border-rose-500 hover:text-rose-300"
          >
            Clear history
          </button>
        </div>
        {rollHistory.length === 0 ? (
          <p className="text-xs text-slate-300">
            No previous rolls yet. Your last few rolls will appear here with
            totals and quick summaries.
          </p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2 text-xs">
            {rollHistory.map((roll, index) => {
              const countsBySides = new Map<DiceType, number>();
              roll.dice.forEach((die) => {
                const count = countsBySides.get(die.sides) ?? 0;
                countsBySides.set(die.sides, count + 1);
              });
              const summaryParts: string[] = [];
              countsBySides.forEach((count, sides) => {
                summaryParts.push(`${count}d${sides}`);
              });
              const modifierPart =
                roll.modifier === 0
                  ? ""
                  : roll.modifier > 0
                  ? ` + ${roll.modifier}`
                  : ` - ${Math.abs(roll.modifier)}`;
              const label =
                roll.label && roll.label.trim().length > 0
                  ? roll.label
                  : `Roll #${rollHistory.length - index}`;
              return (
                <div
                  key={roll.id}
                  className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-slate-100">
                      {label}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-300">
                      {roll.total}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {summaryParts.join(" + ")}
                    {modifierPart}
                    {" = "}
                    {roll.total}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {Array.from(countsBySides.entries())
                      .sort(([a], [b]) => a - b)
                      .map(
                        ([sides, count]) =>
                          `d${sides}: ${count}`
                      )
                      .join(" | ")}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {formatTimestamp(roll.timestamp)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DiceRollerApp;


