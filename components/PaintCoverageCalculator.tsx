"use client";

import { useMemo, useState } from "react";

type CoveragePreset = 250 | 300 | 350 | 400;

type PaintCoverageState = {
  coveragePreset: CoveragePreset;
  customCoverage: string;
};

type Room = {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  paintWalls: boolean;
  paintCeiling: boolean;
  doors: number;
  windows: number;
  coats: number;
};

type RoomWithArea = Room & {
  effectiveArea: number;
};

const doorArea = 20;
const windowArea = 15;

const defaultRoom = (): Room => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()),
  name: "",
  length: 12,
  width: 10,
  height: 8,
  paintWalls: true,
  paintCeiling: false,
  doors: 1,
  windows: 1,
  coats: 1
});

const clampNonNegative = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

const clampNonNegativeInt = (value: number) =>
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

const clampAtLeastOneInt = (value: number) =>
  Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;

const computeRoomEffectiveArea = (room: Room): number => {
  const length = clampNonNegative(room.length);
  const width = clampNonNegative(room.width);
  const height = clampNonNegative(room.height);

  if (length <= 0 || width <= 0 || height <= 0) {
    return 0;
  }

  if (!room.paintWalls && !room.paintCeiling) {
    return 0;
  }

  const coats = clampAtLeastOneInt(room.coats);

  const wallArea = room.paintWalls ? 2 * (length + width) * height : 0;
  const ceilingArea = room.paintCeiling ? length * width : 0;

  const deductions =
    room.paintWalls &&
    (room.doors > 0 || room.windows > 0)
      ? clampNonNegativeInt(room.doors) * doorArea +
        clampNonNegativeInt(room.windows) * windowArea
      : 0;

  const baseArea = Math.max(0, wallArea + ceilingArea - deductions);

  return baseArea * coats;
};

const formatNumber = (value: number, fractionDigits: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });

export default function PaintCoverageCalculator() {
  const [coverageState, setCoverageState] = useState<PaintCoverageState>({
    coveragePreset: 350,
    customCoverage: ""
  });

  const [rooms, setRooms] = useState<Room[]>([defaultRoom()]);

  const numericCustomCoverage = useMemo(() => {
    const value = parseFloat(coverageState.customCoverage);
    if (!Number.isFinite(value) || value <= 0) {
      return undefined;
    }
    return value;
  }, [coverageState.customCoverage]);

  const coverageRate = useMemo(() => {
    if (numericCustomCoverage !== undefined && numericCustomCoverage > 0) {
      return numericCustomCoverage;
    }
    return coverageState.coveragePreset;
  }, [coverageState.coveragePreset, numericCustomCoverage]);

  const roomsWithArea: RoomWithArea[] = useMemo(
    () =>
      rooms.map((room) => ({
        ...room,
        effectiveArea: computeRoomEffectiveArea(room)
      })),
    [rooms]
  );

  const totalArea = useMemo(
    () => roomsWithArea.reduce((sum, room) => sum + room.effectiveArea, 0),
    [roomsWithArea]
  );

  const coverageIsValid = coverageRate > 0;

  const gallonsNeeded = coverageIsValid && totalArea > 0 ? totalArea / coverageRate : 0;
  const wholeGallonsRaw = Math.floor(gallonsNeeded);
  const fractionalGallons = gallonsNeeded - wholeGallonsRaw;
  let quarts = Math.ceil(fractionalGallons * 4);
  let wholeGallons = wholeGallonsRaw;

  if (quarts === 4 && gallonsNeeded > 0) {
    wholeGallons += 1;
    quarts = 0;
  }

  const hasAnyValidRoom = roomsWithArea.some((room) => room.effectiveArea > 0);

  const showResults = coverageIsValid && hasAnyValidRoom;

  const handleRoomChange = <Key extends keyof Room>(
    id: string,
    key: Key,
    value: Room[Key]
  ) => {
    setRooms((previous) =>
      previous.map((room) =>
        room.id === id
          ? {
              ...room,
              [key]: value
            }
          : room
      )
    );
  };

  const handleRoomNumberChange = (
    id: string,
    key: "length" | "width" | "height" | "doors" | "windows" | "coats",
    rawValue: string
  ) => {
    const numeric = parseFloat(rawValue);
    if (key === "doors" || key === "windows") {
      handleRoomChange(id, key, clampNonNegativeInt(numeric) as Room[typeof key]);
      return;
    }
    if (key === "coats") {
      handleRoomChange(id, key, clampAtLeastOneInt(numeric) as Room[typeof key]);
      return;
    }
    handleRoomChange(id, key, clampNonNegative(numeric) as Room[typeof key]);
  };

  const addRoom = () => {
    setRooms((previous) => [...previous, defaultRoom()]);
  };

  const removeRoom = (id: string) => {
    setRooms((previous) => {
      if (previous.length <= 1) {
        return previous;
      }
      return previous.filter((room) => room.id !== id);
    });
  };

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-8">
      <section aria-label="Paint settings" className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Paint settings
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="coveragePreset"
              className="text-sm font-medium text-slate-800"
            >
              Paint coverage (sq ft per gallon)
            </label>
            <div className="relative">
              <select
                id="coveragePreset"
                value={coverageState.coveragePreset}
                onChange={(event) =>
                  setCoverageState((previous) => ({
                    ...previous,
                    coveragePreset: Number(event.target.value) as CoveragePreset
                  }))
                }
                className={selectBaseClasses}
              >
                <option value={250}>250 sq ft/gal – Low coverage / rough surfaces</option>
                <option value={300}>300 sq ft/gal – Typical coverage</option>
                <option value={350}>350 sq ft/gal – Good quality paint</option>
                <option value={400}>400 sq ft/gal – Premium / smooth walls</option>
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
              htmlFor="customCoverage"
              className="text-sm font-medium text-slate-800"
            >
              Custom coverage (sq ft per gallon, optional)
            </label>
            <input
              id="customCoverage"
              type="number"
              min={0}
              step="10"
              value={coverageState.customCoverage}
              onChange={(event) =>
                setCoverageState((previous) => ({
                  ...previous,
                  customCoverage: event.target.value
                }))
              }
              className={inputBaseClasses}
              placeholder="Override preset, e.g. 325"
              inputMode="decimal"
            />
            <p className="text-xs text-slate-500">
              Most interior paints cover roughly 300–400 sq ft per gallon on smooth walls. Use
              a lower value for rough or previously unpainted surfaces.
            </p>
          </div>
        </div>
        {!coverageIsValid && (
          <p className="text-xs text-red-600">
            Enter a positive coverage rate or select a preset to see paint estimates.
          </p>
        )}
      </section>
      <section aria-label="Rooms" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Rooms
          </h2>
          <button
            type="button"
            onClick={addRoom}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Add room
          </button>
        </div>
        <div className="space-y-4">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {room.name || `Room ${index + 1}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    Length, width, and height are in feet. Doors and windows use typical sizes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeRoom(room.id)}
                  disabled={rooms.length === 1}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label
                    htmlFor={`room-name-${room.id}`}
                    className="text-sm font-medium text-slate-800"
                  >
                    Room name (optional)
                  </label>
                  <input
                    id={`room-name-${room.id}`}
                    type="text"
                    value={room.name}
                    onChange={(event) =>
                      handleRoomChange(room.id, "name", event.target.value)
                    }
                    className={inputBaseClasses}
                    placeholder="e.g. Living room"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`room-length-${room.id}`}
                    className="text-sm font-medium text-slate-800"
                  >
                    Length (ft)
                  </label>
                  <input
                    id={`room-length-${room.id}`}
                    type="number"
                    min={0}
                    step="0.5"
                    value={room.length}
                    onChange={(event) =>
                      handleRoomNumberChange(room.id, "length", event.target.value)
                    }
                    className={inputBaseClasses}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`room-width-${room.id}`}
                    className="text-sm font-medium text-slate-800"
                  >
                    Width (ft)
                  </label>
                  <input
                    id={`room-width-${room.id}`}
                    type="number"
                    min={0}
                    step="0.5"
                    value={room.width}
                    onChange={(event) =>
                      handleRoomNumberChange(room.id, "width", event.target.value)
                    }
                    className={inputBaseClasses}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`room-height-${room.id}`}
                    className="text-sm font-medium text-slate-800"
                  >
                    Height (ft)
                  </label>
                  <input
                    id={`room-height-${room.id}`}
                    type="number"
                    min={0}
                    step="0.5"
                    value={room.height}
                    onChange={(event) =>
                      handleRoomNumberChange(room.id, "height", event.target.value)
                    }
                    className={inputBaseClasses}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-800">
                    Surfaces to paint
                  </span>
                  <div className="flex flex-col gap-1 text-sm text-slate-800">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={room.paintWalls}
                        onChange={(event) =>
                          handleRoomChange(room.id, "paintWalls", event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Paint walls</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={room.paintCeiling}
                        onChange={(event) =>
                          handleRoomChange(room.id, "paintCeiling", event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Paint ceiling</span>
                    </label>
                  </div>
                  {!room.paintWalls && !room.paintCeiling && (
                    <p className="text-xs text-amber-700">
                      This room is set to paint nothing, so it will not count toward totals.
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`room-doors-${room.id}`}
                    className="text-sm font-medium text-slate-800"
                  >
                    Doors
                  </label>
                  <input
                    id={`room-doors-${room.id}`}
                    type="number"
                    min={0}
                    step="1"
                    value={room.doors}
                    onChange={(event) =>
                      handleRoomNumberChange(room.id, "doors", event.target.value)
                    }
                    className={inputBaseClasses}
                  />
                  <p className="text-xs text-slate-500">
                    Each door is approximated as {doorArea} sq ft and subtracted from wall area.
                  </p>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`room-windows-${room.id}`}
                    className="text-sm font-medium text-slate-800"
                  >
                    Windows
                  </label>
                  <input
                    id={`room-windows-${room.id}`}
                    type="number"
                    min={0}
                    step="1"
                    value={room.windows}
                    onChange={(event) =>
                      handleRoomNumberChange(room.id, "windows", event.target.value)
                    }
                    className={inputBaseClasses}
                  />
                  <p className="text-xs text-slate-500">
                    Each window is approximated as {windowArea} sq ft and subtracted from wall area.
                  </p>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`room-coats-${room.id}`}
                    className="text-sm font-medium text-slate-800"
                  >
                    Coats
                  </label>
                  <input
                    id={`room-coats-${room.id}`}
                    type="number"
                    min={1}
                    step="1"
                    value={room.coats}
                    onChange={(event) =>
                      handleRoomNumberChange(room.id, "coats", event.target.value)
                    }
                    className={inputBaseClasses}
                  />
                  <p className="text-xs text-slate-500">
                    Most rooms use at least 2 coats when changing colors or painting bare walls.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        aria-label="Paint coverage results"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Results
        </h2>
        {!hasAnyValidRoom && (
          <p className="text-sm text-slate-700">
            Add at least one room with positive length, width, and height to see paint
            estimates.
          </p>
        )}
        {hasAnyValidRoom && !coverageIsValid && (
          <p className="text-sm text-slate-700">
            Set a paint coverage rate above zero to calculate how many gallons you need.
          </p>
        )}
        {showResults && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total paintable area
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {Math.round(totalArea).toLocaleString("en-US")} sq ft
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Coverage used
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {coverageRate.toLocaleString("en-US")} sq ft/gal
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total gallons (approximate)
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(gallonsNeeded, 2)} gal
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recommended purchase
              </p>
              <p className="text-sm text-slate-800">
                {wholeGallons} {wholeGallons === 1 ? "gallon" : "gallons"}
                {quarts > 0 ? ` and ${quarts} ${quarts === 1 ? "quart" : "quarts"}` : ""}.
              </p>
              <p className="text-xs text-slate-600">
                It is usually safer to round up slightly so you have a bit of extra paint for
                touch-ups and future repairs.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Per-room estimated area
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-700">
                        Room
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-700">
                        Surfaces
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-slate-700">
                        Coats
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-slate-700">
                        Area (sq ft)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {roomsWithArea
                      .filter((room) => room.effectiveArea > 0)
                      .map((room, index) => (
                        <tr key={room.id}>
                          <td className="px-3 py-2">
                            {room.name || `Room ${index + 1}`}
                          </td>
                          <td className="px-3 py-2">
                            {room.paintWalls && room.paintCeiling
                              ? "Walls and ceiling"
                              : room.paintWalls
                              ? "Walls only"
                              : "Ceiling only"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {clampAtLeastOneInt(room.coats)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {Math.round(room.effectiveArea).toLocaleString("en-US")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


