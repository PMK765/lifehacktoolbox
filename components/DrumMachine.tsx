"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DrumMachineAudioContext,
  TrackId
} from "@/lib/drumMachineAudio";
import {
  createDrumMachineAudioContext,
  scheduleStepSequence,
  setMasterVolume,
  triggerTrackSound
} from "@/lib/drumMachineAudio";

export type StepGrid = Record<TrackId, boolean[]>;

export type DrumMachineState = {
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  grid: StepGrid;
  swingPercent: number;
  volume: number;
};

type DrumPreset = {
  name: string;
  bpm: number;
  swingPercent: number;
  grid: StepGrid;
  createdAt: string;
};

type StoredState = {
  bpm: number;
  swingPercent: number;
  volume: number;
  grid: StepGrid;
};

const LAST_STATE_KEY =
  "lht_drum_machine_last_state_v1";
const PRESETS_KEY =
  "lht_drum_machine_presets_v1";

const TRACK_LABELS: {
  id: TrackId;
  name: string;
}[] = [
  { id: "kick", name: "Kick" },
  { id: "snare", name: "Snare" },
  { id: "hihat", name: "Hi-hat" },
  { id: "bass", name: "Bass" }
];

const createEmptyGrid = (): StepGrid => ({
  kick: new Array(16).fill(false),
  snare: new Array(16).fill(false),
  hihat: new Array(16).fill(false),
  bass: new Array(16).fill(false)
});

const createDefaultGrid = (): StepGrid => {
  const grid = createEmptyGrid();
  for (let step = 0; step < 16; step += 4) {
    grid.kick[step] = true;
  }
  grid.snare[4] = true;
  grid.snare[12] = true;
  for (let step = 2; step < 16; step += 2) {
    grid.hihat[step] = true;
  }
  grid.bass[0] = true;
  grid.bass[7] = true;
  grid.bass[12] = true;
  return grid;
};

const DrumMachine = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [grid, setGrid] =
    useState<StepGrid>(createDefaultGrid);
  const [swingPercent, setSwingPercent] =
    useState(0);
  const [volume, setVolume] = useState(0.9);
  const [presets, setPresets] = useState<
    DrumPreset[]
  >([]);
  const [presetName, setPresetName] =
    useState("");
  const [selectedPresetName, setSelectedPresetName] =
    useState("");

  const audioRef =
    useRef<DrumMachineAudioContext | null>(null);
  const loopStartTimeRef = useRef<number | null>(
    null
  );
  const lastScheduledStepRef =
    useRef<number>(-1);
  const animationFrameRef =
    useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const rawState =
      window.localStorage.getItem(
        LAST_STATE_KEY
      );
    if (rawState) {
      const parsed = JSON.parse(
        rawState
      ) as StoredState;
      if (
        typeof parsed.bpm === "number" &&
        parsed.grid
      ) {
        setBpm(
          Math.max(
            60,
            Math.min(180, parsed.bpm)
          )
        );
        setSwingPercent(
          typeof parsed.swingPercent ===
            "number"
            ? Math.max(
                0,
                Math.min(
                  60,
                  parsed.swingPercent
                )
              )
            : 0
        );
        setVolume(
          typeof parsed.volume === "number"
            ? Math.max(
                0,
                Math.min(1, parsed.volume)
              )
            : 0.9
        );
        setGrid(parsed.grid);
      }
    }
    const rawPresets =
      window.localStorage.getItem(
        PRESETS_KEY
      );
    if (rawPresets) {
      const parsed = JSON.parse(
        rawPresets
      ) as DrumPreset[];
      if (Array.isArray(parsed)) {
        setPresets(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stateToStore: StoredState = {
      bpm,
      swingPercent,
      volume,
      grid
    };
    window.localStorage.setItem(
      LAST_STATE_KEY,
      JSON.stringify(stateToStore)
    );
  }, [bpm, swingPercent, volume, grid]);

  useEffect(() => {
    const ctx = audioRef.current;
    if (!ctx) {
      return;
    }
    setMasterVolume(ctx, volume);
  }, [volume]);

  const ensureAudioContext = async (): Promise<DrumMachineAudioContext | null> => {
    let ctx = audioRef.current;
    if (ctx) {
      return ctx;
    }
    const created =
      createDrumMachineAudioContext();
    if (!created) {
      return null;
    }
    audioRef.current = created;
    if (created.audioContext.state === "suspended") {
      await created.audioContext.resume();
    }
    setMasterVolume(created, volume);
    return created;
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    const ctx = await ensureAudioContext();
    if (!ctx) {
      return;
    }
    const now = ctx.audioContext.currentTime;
    const startTime = now + 0.05;
    loopStartTimeRef.current = startTime;
    lastScheduledStepRef.current = -1;
    setIsPlaying(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
        animationFrameRef.current = null;
      }
      return;
    }
    const ctx = audioRef.current;
    if (!ctx || !loopStartTimeRef.current) {
      return;
    }
    const stepDuration = 60 / bpm / 4;
    const totalSteps = 16;

    const tick = () => {
      const context = audioRef.current;
      const loopStart =
        loopStartTimeRef.current;
      if (
        !context ||
        !loopStart ||
        !isPlaying
      ) {
        return;
      }
      const currentTime =
        context.audioContext.currentTime;
      const elapsed = currentTime - loopStart;
      if (elapsed >= 0) {
        const stepFloat =
          elapsed / stepDuration;
        const stepIndex =
          ((Math.floor(stepFloat) %
            totalSteps) +
            totalSteps) %
          totalSteps;
        setCurrentStep((previous) =>
          previous === stepIndex
            ? previous
            : stepIndex
        );
        const lastScheduled =
          lastScheduledStepRef.current;
        const lookAheadSeconds = 0.15;
        const stepsAhead = Math.ceil(
          lookAheadSeconds / stepDuration
        );
        let nextStepToSchedule =
          lastScheduled < 0
            ? stepIndex
            : lastScheduled + 1;
        while (
          nextStepToSchedule <=
          stepIndex + stepsAhead
        ) {
          const events = scheduleStepSequence(
            bpm,
            loopStart +
              nextStepToSchedule *
                stepDuration,
            nextStepToSchedule,
            swingPercent
          );
          events.forEach((event) => {
            const step = event.stepIndex;
            TRACK_LABELS.forEach((track) => {
              if (grid[track.id][step]) {
                triggerTrackSound(
                  context,
                  track.id,
                  event.time
                );
              }
            });
          });
          lastScheduledStepRef.current =
            nextStepToSchedule;
          nextStepToSchedule += 1;
        }
      }
      animationFrameRef.current =
        requestAnimationFrame(tick);
    };
    animationFrameRef.current =
      requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
        animationFrameRef.current = null;
      }
    };
  }, [bpm, grid, isPlaying, swingPercent]);

  const toggleCell = (
    trackId: TrackId,
    index: number
  ) => {
    setGrid((previous) => {
      const updatedRow = [
        ...previous[trackId]
      ];
      updatedRow[index] = !updatedRow[index];
      return {
        ...previous,
        [trackId]: updatedRow
      };
    });
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) {
      return;
    }
    const preset: DrumPreset = {
      name,
      bpm,
      swingPercent,
      grid,
      createdAt: new Date().toISOString()
    };
    setPresets((previous) => {
      const filtered = previous.filter(
        (item) => item.name !== name
      );
      const next = [...filtered, preset];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PRESETS_KEY,
          JSON.stringify(next)
        );
      }
      return next;
    });
    setSelectedPresetName(name);
  };

  const handleLoadPreset = () => {
    if (!selectedPresetName) {
      return;
    }
    const preset = presets.find(
      (item) => item.name === selectedPresetName
    );
    if (!preset) {
      return;
    }
    setBpm(preset.bpm);
    setSwingPercent(preset.swingPercent);
    setGrid(preset.grid);
  };

  const handleClear = () => {
    setGrid(createEmptyGrid());
  };

  const patternJson = useMemo(() => {
    const payload = {
      name:
        presetName.trim() ||
        "Untitled pattern",
      bpm,
      swingPercent,
      grid,
      createdAt: new Date().toISOString()
    };
    return JSON.stringify(payload, null, 2);
  }, [bpm, grid, presetName, swingPercent]);

  const handleExportJson = () => {
    if (typeof window === "undefined") {
      return;
    }
    const blob = new Blob([patternJson], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const timestamp =
      new Date().toISOString().slice(0, 19);
    const link = document.createElement("a");
    link.href = url;
    link.download = `drum-pattern-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const patternText = useMemo(() => {
    const buildLine = (trackId: TrackId) => {
      const row = grid[trackId];
      const chars = row.map(
        (active, index) =>
          active
            ? index % 4 === 0
              ? "X"
              : "x"
            : index % 4 === 0
            ? "|"
            : "-"
      );
      return `${TRACK_LABELS.find(
        (track) => track.id === trackId
      )?.name ?? trackId}: ${chars.join("")}`;
    };
    return [
      buildLine("kick"),
      buildLine("snare"),
      buildLine("hihat"),
      buildLine("bass")
    ].join("\n");
  }, [grid]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-1 shadow-xl ring-1 ring-slate-800/80">
        <div className="space-y-5 rounded-[1.6rem] bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                Creative &amp; fun
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
                Online Beat Maker – 16-Step Drum Machine
              </h2>
              <p className="max-w-xl text-sm text-slate-300">
                Tap out a pattern for kick, snare, hi-hats
                and bass, then loop it at any tempo using the
                Web Audio API. Everything runs locally in your
                browser.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1.5">
                <span className="font-medium text-slate-200">
                  BPM
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setBpm((value) =>
                      Math.max(60, value - 5)
                    )
                  }
                  className="h-6 w-6 rounded-full bg-slate-800 text-center text-sm text-slate-100 hover:bg-slate-700"
                >
                  –
                </button>
                <input
                  type="number"
                  value={bpm}
                  onChange={(event) =>
                    setBpm(
                      Number(event.target.value)
                    )
                  }
                  className="w-14 rounded-md border border-slate-700 bg-slate-950 px-1.5 py-1 text-center text-sm text-slate-50"
                />
                <button
                  type="button"
                  onClick={() =>
                    setBpm((value) =>
                      Math.min(200, value + 5)
                    )
                  }
                  className="h-6 w-6 rounded-full bg-slate-800 text-center text-sm text-slate-100 hover:bg-slate-700"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                  isPlaying
                    ? "bg-rose-500 text-slate-950 hover:bg-rose-400"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isPlaying
                      ? "bg-rose-900"
                      : "bg-emerald-900"
                  }`}
                />
                {isPlaying ? "Stop" : "Play"}
              </button>
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1.5">
                <span className="text-xs font-medium text-slate-200">
                  Volume
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) =>
                    setVolume(
                      Number(event.target.value)
                    )
                  }
                  className="h-1 w-24 cursor-pointer rounded-full bg-slate-700 accent-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1.5">
                <span className="text-xs font-medium text-slate-200">
                  Swing
                </span>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={swingPercent}
                  onChange={(event) =>
                    setSwingPercent(
                      Number(event.target.value)
                    )
                  }
                  className="h-1 w-24 cursor-pointer rounded-full bg-slate-700 accent-emerald-500"
                />
                <span className="w-8 text-right text-[11px] text-slate-200">
                  {swingPercent}%
                </span>
              </div>
            </div>
          </header>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Step sequencer</span>
                <span>Tap pads to toggle hits on or off.</span>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[640px] space-y-2">
                  <div className="ml-16 grid grid-cols-16 gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {Array.from({ length: 16 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="text-center"
                        >
                          {index + 1}
                        </div>
                      )
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {TRACK_LABELS.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-2"
                      >
                        <div className="w-16 text-right text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                          {track.name}
                        </div>
                        <div className="grid flex-1 grid-cols-16 gap-1">
                          {grid[track.id].map(
                            (active, index) => {
                              const isCurrent =
                                index ===
                                currentStep;
                              const isAccent =
                                index % 4 === 0;
                              const baseColor =
                                track.id === "kick"
                                  ? "bg-emerald-500/80"
                                  : track.id ===
                                    "snare"
                                  ? "bg-rose-500/80"
                                  : track.id ===
                                    "hihat"
                                  ? "bg-sky-400/80"
                                  : "bg-violet-400/80";
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() =>
                                    toggleCell(
                                      track.id,
                                      index
                                    )
                                  }
                                  className={`relative flex h-8 items-center justify-center rounded-md border text-xs transition-colors sm:h-10 ${
                                    active
                                      ? `${baseColor} border-slate-100 text-slate-950`
                                      : "border-slate-800 bg-slate-900 text-slate-400"
                                  } ${
                                    isCurrent
                                      ? "ring-2 ring-emerald-400"
                                      : ""
                                  } ${
                                    !active &&
                                    isAccent
                                      ? "bg-slate-900/60"
                                      : ""
                                  }`}
                                >
                                  <span className="sr-only">
                                    {track.name} step{" "}
                                    {index + 1}
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
              <h3 className="text-sm font-semibold text-slate-50">
                Patterns &amp; export
              </h3>
              <div className="space-y-3 text-xs">
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-200">
                    Pattern name
                  </span>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(event) =>
                      setPresetName(
                        event.target.value
                      )
                    }
                    placeholder="My beat"
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50 placeholder:text-slate-500"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm hover:bg-emerald-400"
                  >
                    Save pattern
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                  >
                    Clear pattern
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="space-y-1">
                    <span className="block text-[11px] font-medium text-slate-200">
                      Saved presets
                    </span>
                    <select
                      value={selectedPresetName}
                      onChange={(event) =>
                        setSelectedPresetName(
                          event.target.value
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-50"
                    >
                      <option value="">
                        Select a preset
                      </option>
                      {presets
                        .slice()
                        .sort((first, second) =>
                          first.name.localeCompare(
                            second.name
                          )
                        )
                        .map((preset) => (
                          <option
                            key={preset.name}
                            value={preset.name}
                          >
                            {preset.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadPreset}
                    className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                  >
                    Load pattern
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-200">
                      Export JSON preset
                    </span>
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400"
                    >
                      Download JSON
                    </button>
                  </div>
                  <pre className="max-h-40 overflow-auto rounded-md border border-slate-800 bg-slate-950 p-2 text-[10px] leading-snug text-emerald-100">
                    {patternJson}
                  </pre>
                </div>
                <div className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-200">
                    Pattern text
                  </span>
                  <pre className="max-h-32 overflow-auto rounded-md border border-slate-800 bg-slate-950 p-2 text-[10px] leading-snug text-slate-100">
                    {patternText}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-sm">
        <p className="font-semibold">
          Audio runs locally in your browser
        </p>
        <p className="mt-1">
          This web audio beat maker does not upload or
          record your patterns. Everything is synthesized on
          your device using the Web Audio API and saved
          locally in your browser&apos;s storage.
        </p>
      </div>
    </div>
  );
};

export default DrumMachine;


