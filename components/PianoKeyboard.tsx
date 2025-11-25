"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PianoKey = {
  id: string;
  midi: number;
  frequency: number;
  isSharp: boolean;
  label: string;
};

type LayoutStyle = "horizontal" | "vertical" | "compact";

type Waveform = "sine" | "triangle" | "square" | "sawtooth";

type ActiveVoice = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];

const KEYBOARD_BINDINGS: { key: string; noteId: string }[] = [
  { key: "a", noteId: "C4" },
  { key: "w", noteId: "C#4" },
  { key: "s", noteId: "D4" },
  { key: "e", noteId: "D#4" },
  { key: "d", noteId: "E4" },
  { key: "f", noteId: "F4" },
  { key: "t", noteId: "F#4" },
  { key: "g", noteId: "G4" },
  { key: "y", noteId: "G#4" },
  { key: "h", noteId: "A4" },
  { key: "u", noteId: "A#4" },
  { key: "j", noteId: "B4" },
  { key: "k", noteId: "C5" }
];

const buildKeysForRange = (startMidi: number, endMidi: number): PianoKey[] => {
  const keys: PianoKey[] = [];
  for (let midi = startMidi; midi <= endMidi; midi += 1) {
    const semitone = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const baseName = NOTE_NAMES[semaphoreToIndex(semitone)];
    const label = `${baseName}${octave}`;
    const isSharp = baseName.includes("#");
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    keys.push({
      id: label,
      midi,
      frequency,
      isSharp,
      label
    });
  }
  return keys;
};

const semaphoreToIndex = (semitone: number) => {
  const normalized = semitone % 12;
  if (normalized < 0) {
    return 12 + normalized;
  }
  return normalized;
};

const PianoKeyboard = () => {
  const [baseOctave, setBaseOctave] = useState<3 | 4>(4);
  const [layout, setLayout] = useState<LayoutStyle>("horizontal");
  const [waveform, setWaveform] = useState<Waveform>("sine");
  const [volume, setVolume] = useState(0.7);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(
    () => new Set<string>()
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const voicesRef = useRef<Map<string, ActiveVoice>>(
    new Map<string, ActiveVoice>()
  );

  const keys: PianoKey[] = useMemo(() => {
    const startMidi = 12 * (baseOctave + 1);
    const endMidi = 12 * (baseOctave + 3);
    return buildKeysForRange(startMidi, endMidi);
  }, [baseOctave]);

  const keyById = useMemo(() => {
    const map = new Map<string, PianoKey>();
    keys.forEach((key) => {
      map.set(key.id, key);
    });
    return map;
  }, [keys]);

  const startNote = (noteId: string) => {
    if (!noteId) {
      return;
    }
    const ctx =
      audioContextRef.current ??
      (typeof window !== "undefined"
        ? new (window.AudioContext as typeof AudioContext)()
        : null);
    if (!ctx) {
      return;
    }
    if (!audioContextRef.current) {
      audioContextRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      masterGainRef.current = master;
    }
    if (voicesRef.current.has(noteId)) {
      return;
    }
    const key = keyById.get(noteId);
    if (!key) {
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const master = masterGainRef.current;
    if (!master) {
      return;
    }
    osc.type = waveform;
    osc.frequency.value = key.frequency;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(master);
    osc.start();

    const voice: ActiveVoice = {
      oscillator: osc,
      gain
    };
    const next = new Map(voicesRef.current);
    next.set(noteId, voice);
    voicesRef.current = next;
    setActiveKeys((previous) => {
      const updated = new Set(previous);
      updated.add(noteId);
      return updated;
    });
  };

  const stopNote = (noteId: string) => {
    const ctx = audioContextRef.current;
    if (!ctx) {
      return;
    }
    const voice = voicesRef.current.get(noteId);
    if (!voice) {
      return;
    }
    const now = ctx.currentTime;
    const gainParam = voice.gain.gain;
    const current = gainParam.value;
    gainParam.cancelScheduledValues(now);
    gainParam.setValueAtTime(current, now);
    const releaseTime = 0.15;
    const targetTime = now + releaseTime;
    gainParam.linearRampToValueAtTime(0, targetTime);
    voice.oscillator.stop(targetTime + 0.02);
    window.setTimeout(() => {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }, 400);
    const next = new Map(voicesRef.current);
    next.delete(noteId);
    voicesRef.current = next;
    setActiveKeys((previous) => {
      const updated = new Set(previous);
      updated.delete(noteId);
      return updated;
    });
  };

  const stopAll = () => {
    const ctx = audioContextRef.current;
    if (!ctx) {
      return;
    }
    voicesRef.current.forEach((voice, id) => {
      const now = ctx.currentTime;
      const gainParam = voice.gain.gain;
      const current = gainParam.value;
      gainParam.cancelScheduledValues(now);
      gainParam.setValueAtTime(current, now);
      const targetTime = now + 0.15;
      gainParam.linearRampToValueAtTime(0, targetTime);
      voice.oscillator.stop(targetTime + 0.02);
      window.setTimeout(() => {
        voice.oscillator.disconnect();
        voice.gain.disconnect();
      }, 400);
    });
    voicesRef.current = new Map();
    setActiveKeys(new Set());
  };

  useEffect(() => {
    if (!audioContextRef.current || !masterGainRef.current) {
      return;
    }
    masterGainRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const binding = KEYBOARD_BINDINGS.find(
        (entry) => entry.key === key
      );
      if (!binding) {
        return;
      }
      if (event.repeat) {
        return;
      }
      event.preventDefault();
      startNote(binding.noteId);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const binding = KEYBOARD_BINDINGS.find(
        (entry) => entry.key === key
      );
      if (!binding) {
        return;
      }
      event.preventDefault();
      stopNote(binding.noteId);
    };

    if (typeof window === "undefined") {
      return;
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      stopAll();
      const ctx = audioContextRef.current;
      if (ctx) {
        ctx.close();
      }
    };
  }, []);

  const handleMouseDown = (noteId: string) => {
    startNote(noteId);
  };

  const handleMouseUp = (noteId: string) => {
    stopNote(noteId);
  };

  const renderWhiteAndBlackKeys = () => {
    const whiteKeys = keys.filter((key) => !key.isSharp);
    const blackKeys: (PianoKey | null)[] = [];
    for (let index = 0; index < whiteKeys.length; index += 1) {
      const current = whiteKeys[index];
      const next = whiteKeys[index + 1];
      if (!next) {
        blackKeys.push(null);
      } else if (next.midi - current.midi === 2) {
        const blackMidi = current.midi + 1;
        const blackKey = keys.find((key) => key.midi === blackMidi);
        if (blackKey) {
          blackKeys.push(blackKey);
        } else {
          blackKeys.push(null);
        }
      } else {
        blackKeys.push(null);
      }
    }

    const whiteWidth = 40;

    return (
      <div className="relative flex select-none">
        {whiteKeys.map((white, index) => {
          const isActive = activeKeys.has(white.id);
          const black = blackKeys[index];
          const left = index * whiteWidth;
          return (
            <div
              key={white.id}
              className="relative"
              style={{ width: `${whiteWidth}px` }}
            >
              <button
                type="button"
                role="button"
                aria-label={`Play note ${white.label}`}
                onMouseDown={() => handleMouseDown(white.id)}
                onMouseUp={() => handleMouseUp(white.id)}
                onMouseLeave={() => handleMouseUp(white.id)}
                onTouchStart={(event) => {
                  event.preventDefault();
                  handleMouseDown(white.id);
                }}
                onTouchEnd={() => handleMouseUp(white.id)}
                onTouchCancel={() => handleMouseUp(white.id)}
                className={`flex h-40 w-full items-end justify-center border border-slate-400 bg-white text-[10px] font-medium text-slate-900 ${
                  isActive ? "bg-emerald-100" : "hover:bg-slate-100"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <span className="pb-1">{white.label}</span>
              </button>
              {black && (
                <button
                  type="button"
                  role="button"
                  aria-label={`Play note ${black.label}`}
                  onMouseDown={() => handleMouseDown(black.id)}
                  onMouseUp={() => handleMouseUp(black.id)}
                  onMouseLeave={() => handleMouseUp(black.id)}
                  onTouchStart={(event) => {
                    event.preventDefault();
                    handleMouseDown(black.id);
                  }}
                  onTouchEnd={() => handleMouseUp(black.id)}
                  onTouchCancel={() => handleMouseUp(black.id)}
                  className={`absolute left-1/2 top-0 z-10 h-24 w-6 -translate-x-1/2 rounded-b-md border border-slate-700 bg-slate-800 ${
                    activeKeys.has(black.id)
                      ? "bg-emerald-700"
                      : "bg-slate-800"
                  }`}
                  style={{
                    transform: "translateX(-50%)"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderKeyboard = () => {
    if (layout === "horizontal") {
      return (
        <div className="overflow-auto rounded-lg border border-slate-300 bg-slate-200 p-3">
          <div className="inline-block">{renderWhiteAndBlackKeys()}</div>
        </div>
      );
    }
    if (layout === "vertical") {
      const whiteKeys = keys.filter((key) => !key.isSharp);
      const blackKeys = keys.filter((key) => key.isSharp);
      return (
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-white p-3">
            {whiteKeys.map((key) => {
              const isActive = activeKeys.has(key.id);
              return (
                <button
                  key={key.id}
                  type="button"
                  role="button"
                  aria-label={`Play note ${key.label}`}
                  onMouseDown={() => handleMouseDown(key.id)}
                  onMouseUp={() => handleMouseUp(key.id)}
                  onMouseLeave={() => handleMouseUp(key.id)}
                  onTouchStart={(event) => {
                    event.preventDefault();
                    handleMouseDown(key.id);
                  }}
                  onTouchEnd={() => handleMouseUp(key.id)}
                  onTouchCancel={() => handleMouseUp(key.id)}
                  className={`mb-1 flex h-8 w-28 items-center justify-center rounded-md border border-slate-300 ${
                    isActive
                      ? "bg-emerald-100"
                      : "bg-white hover:bg-slate-100"
                  } text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                >
                  {key.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-slate-50 p-3">
            {blackKeys.map((key) => {
              const isActive = activeKeys.has(key.id);
              return (
                <button
                  key={key.id}
                  type="button"
                  role="button"
                  aria-label={`Play note ${key.label}`}
                  onMouseDown={() => handleMouseDown(key.id)}
                  onMouseUp={() => handleMouseUp(key.id)}
                  onMouseLeave={() => handleMouseUp(key.id)}
                  onTouchStart={(event) => {
                    event.preventDefault();
                    handleMouseDown(key.id);
                  }}
                  onTouchEnd={() => handleMouseUp(key.id)}
                  onTouchCancel={() => handleMouseUp(key.id)}
                  className={`mb-1 flex h-6 w-20 items-center justify-center rounded-md ${
                    isActive ? "bg-emerald-700" : "bg-slate-800"
                  } text-[10px] font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                >
                  {key.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className="overflow-auto rounded-lg border border-slate-300 bg-slate-200 p-2">
        <div className="inline-flex">
          {keys.map((key) => {
            const isSharp = key.isSharp;
            const isActive = activeKeys.has(key.id);
            const baseClasses = isSharp
              ? "h-24 w-6 -mx-1 bg-slate-800 text-[9px] text-white flex items-end justify-center rounded-b-md border border-slate-900"
              : "h-32 w-8 bg-white text-[9px] text-slate-900 flex items-end justify-center border border-slate-400";
            return (
              <button
                key={key.id}
                type="button"
                role="button"
                aria-label={`Play note ${key.label}`}
                onMouseDown={() => handleMouseDown(key.id)}
                onMouseUp={() => handleMouseUp(key.id)}
                onMouseLeave={() => handleMouseUp(key.id)}
                onTouchStart={(event) => {
                  event.preventDefault();
                  handleMouseDown(key.id);
                }}
                onTouchEnd={() => handleMouseUp(key.id)}
                onTouchCancel={() => handleMouseUp(key.id)}
                className={`${baseClasses} ${
                  isActive
                    ? isSharp
                      ? "bg-emerald-700"
                      : "bg-emerald-100"
                    : ""
                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <span className="pb-1">{key.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Play piano directly in your browser using Web Audio.
        </p>
        <p>
          Sound is generated locally in your browser using the Web Audio API.
          There are no external audio files or network calls, so you can
          experiment freely without sending any data to a server.
        </p>
      </div>
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Controls
            </h2>
            <div className="flex flex-wrap gap-3 text-xs text-slate-700">
              <div className="space-y-1">
                <span className="block font-medium">Octave range</span>
                <div className="inline-flex rounded-md border border-slate-300 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setBaseOctave(3)}
                    className={`px-3 py-1 ${
                      baseOctave === 3
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700"
                    } rounded-l-md`}
                  >
                    C3–C5
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaseOctave(4)}
                    className={`px-3 py-1 ${
                      baseOctave === 4
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700"
                    } rounded-r-md`}
                  >
                    C4–C6
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <span className="block font-medium">Waveform</span>
                <select
                  value={waveform}
                  onChange={(event) =>
                    setWaveform(event.target.value as Waveform)
                  }
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="sine">Sine</option>
                  <option value="triangle">Triangle</option>
                  <option value="square">Square</option>
                  <option value="sawtooth">Sawtooth</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="block font-medium">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) =>
                    setVolume(Number.parseFloat(event.target.value) || 0)
                  }
                  className="w-32 accent-emerald-600"
                />
              </div>
              <div className="space-y-1">
                <span className="block font-medium">Layout</span>
                <div className="inline-flex rounded-md border border-slate-300 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setLayout("horizontal")}
                    className={`px-3 py-1 ${
                      layout === "horizontal"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700"
                    } rounded-l-md`}
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout("vertical")}
                    className={`px-3 py-1 ${
                      layout === "vertical"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700"
                    }`}
                  >
                    Vertical
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout("compact")}
                    className={`px-3 py-1 ${
                      layout === "compact"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700"
                    } rounded-r-md`}
                  >
                    Compact
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-medium">Keyboard shortcuts</p>
            <p>
              Use your computer keyboard to play notes: A–K for{" "}
              <span className="font-mono">C4–C5</span>, W E T Y U for the black
              keys. Focus the page and press keys to hear notes.
            </p>
          </div>
        </div>
        <div className="mt-4">{renderKeyboard()}</div>
      </section>
    </div>
  );
};

export default PianoKeyboard;


