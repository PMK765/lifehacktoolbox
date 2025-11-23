"use client";

import { useEffect, useMemo, useState } from "react";

type TeamMode = "teams" | "size";

type Preset = {
  id: string;
  name: string;
  names: string[];
};

type TeamRandomizerState = {
  namesText: string;
  names: string[];
  mode: TeamMode;
  teamsCountInput: string;
  teamSizeInput: string;
};

type TeamsResult = string[][];

const presetsStorageKey = "lht_team_randomizer_presets";

const parseNames = (raw: string): string[] =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const shuffle = <T,>(input: T[]): T[] => {
  const array = input.slice();
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temporary = array[index];
    array[index] = array[randomIndex];
    array[randomIndex] = temporary;
  }
  return array;
};

const buildTeamsByCount = (names: string[], teamsCount: number): TeamsResult => {
  const result: TeamsResult = Array.from({ length: teamsCount }, () => []);
  const shuffled = shuffle(names);

  shuffled.forEach((name, index) => {
    const teamIndex = index % teamsCount;
    result[teamIndex].push(name);
  });

  return result;
};

const buildTeamsBySize = (names: string[], teamSize: number): TeamsResult => {
  if (teamSize <= 0) {
    return [];
  }
  const total = names.length;
  const teamsCount = Math.max(1, Math.ceil(total / teamSize));
  return buildTeamsByCount(names, teamsCount);
};

const loadInitialPresets = (): Preset[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(presetsStorageKey);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as { id?: unknown }).id === "string" &&
        typeof (item as { name?: unknown }).name === "string" &&
        Array.isArray((item as { names?: unknown }).names)
      ) {
        const names = (item as { names: unknown[] }).names
          .filter((value) => typeof value === "string")
          .map((value) => (value as string).trim())
          .filter((value) => value.length > 0);

        return {
          id: (item as { id: string }).id,
          name: (item as { name: string }).name,
          names
        } as Preset;
      }
      return null;
    })
    .filter((value): value is Preset => value !== null);
};

export default function TeamRandomizer() {
  const [state, setState] = useState<TeamRandomizerState>({
    namesText: "",
    names: [],
    mode: "teams",
    teamsCountInput: "2",
    teamSizeInput: "2"
  });

  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [teams, setTeams] = useState<TeamsResult | null>(null);
  const [namesError, setNamesError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const initial = loadInitialPresets();
    if (initial.length > 0) {
      setPresets(initial);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const serializable = presets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      names: preset.names
    }));
    window.localStorage.setItem(presetsStorageKey, JSON.stringify(serializable));
  }, [presets]);

  const participantCount = state.names.length;

  const handleNamesChange = (value: string) => {
    const parsed = parseNames(value);
    setState((previous) => ({
      ...previous,
      namesText: value,
      names: parsed
    }));
    if (parsed.length >= 2 && namesError) {
      setNamesError(null);
    }
  };

  const handleSavePreset = () => {
    const trimmedName = presetNameInput.trim();
    if (!trimmedName) {
      return;
    }
    if (state.names.length === 0) {
      return;
    }
    setPresets((previous) => {
      const existingIndex = previous.findIndex(
        (preset) => preset.name.toLowerCase() === trimmedName.toLowerCase()
      );
      const id =
        existingIndex >= 0
          ? previous[existingIndex].id
          : typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Math.random());
      const updatedPreset: Preset = {
        id,
        name: trimmedName,
        names: state.names
      };
      if (existingIndex >= 0) {
        const copy = previous.slice();
        copy[existingIndex] = updatedPreset;
        return copy;
      }
      return [...previous, updatedPreset];
    });
  };

  const handleLoadPreset = (preset: Preset) => {
    const text = preset.names.join("\n");
    setState((previous) => ({
      ...previous,
      namesText: text,
      names: preset.names
    }));
    if (preset.names.length >= 2 && namesError) {
      setNamesError(null);
    }
  };

  const handleDeletePreset = (id: string) => {
    setPresets((previous) => previous.filter((preset) => preset.id !== id));
  };

  const parsedTeamsCount = useMemo(
    () => Number.parseInt(state.teamsCountInput, 10),
    [state.teamsCountInput]
  );

  const parsedTeamSize = useMemo(
    () => Number.parseInt(state.teamSizeInput, 10),
    [state.teamSizeInput]
  );

  const handleRandomize = () => {
    if (state.names.length < 2) {
      setNamesError("Enter at least 2 names to create teams.");
      setTeams(null);
      return;
    }

    let nextConfigError: string | null = null;
    let nextTeams: TeamsResult | null = null;

    if (state.mode === "teams") {
      if (!Number.isFinite(parsedTeamsCount) || parsedTeamsCount < 2) {
        nextConfigError =
          "Enter a number of teams of at least 2, or switch to team size mode.";
      } else {
        nextTeams = buildTeamsByCount(state.names, parsedTeamsCount);
      }
    } else if (state.mode === "size") {
      if (!Number.isFinite(parsedTeamSize) || parsedTeamSize < 2) {
        nextConfigError =
          "Enter a team size of at least 2, or switch to number of teams mode.";
      } else {
        nextTeams = buildTeamsBySize(state.names, parsedTeamSize);
      }
    }

    setConfigError(nextConfigError);
    if (nextTeams) {
      setTeams(nextTeams);
    } else {
      setTeams(null);
    }
  };

  const handleReroll = () => {
    if (teams && teams.length > 0) {
      handleRandomize();
    }
  };

  const selectMode = (mode: TeamMode) => {
    setState((previous) => ({
      ...previous,
      mode
    }));
    if (configError) {
      setConfigError(null);
    }
  };

  const hasTeams = teams !== null && teams.length > 0;

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="space-y-8">
      <section
        aria-label="Participant names"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Participant names
        </h2>
        <div className="space-y-2">
          <label
            htmlFor="participantNames"
            className="text-sm font-medium text-slate-800"
          >
            Participant names (one per line)
          </label>
          <textarea
            id="participantNames"
            value={state.namesText}
            onChange={(event) => handleNamesChange(event.target.value)}
            className="min-h-[160px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Paste a class list, roster, or any group of names.&#10;One name per line."
          />
          <p className="text-xs text-slate-600">
            Paste a class list, roster, or any group of names. Empty lines are ignored.
          </p>
          <p className="text-xs text-slate-700">
            Detected{" "}
            <span className="font-semibold">{participantCount}</span>{" "}
            {participantCount === 1 ? "participant" : "participants"}.
          </p>
          {namesError && (
            <p className="text-xs text-red-600">{namesError}</p>
          )}
        </div>
        <div
          aria-label="Presets"
          className="space-y-3 rounded-md border border-slate-100 bg-slate-50 p-3"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Presets (stored locally in this browser)
          </h3>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <input
              type="text"
              value={presetNameInput}
              onChange={(event) => setPresetNameInput(event.target.value)}
              className={inputBaseClasses}
              placeholder="Preset name, e.g. 'Period 3 Science'"
            />
            <button
              type="button"
              onClick={handleSavePreset}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Save preset
            </button>
          </div>
          {presets.length === 0 ? (
            <p className="text-xs text-slate-600">
              No presets saved yet. Create one by entering names above, giving it a name,
              and clicking Save preset.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700">Saved presets</p>
              <ul className="space-y-1 text-xs text-slate-800">
                {presets.map((preset) => (
                  <li
                    key={preset.id}
                    className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1"
                  >
                    <span className="truncate">{preset.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleLoadPreset(preset)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 hover:border-slate-400"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-red-300 hover:text-red-700"
                        aria-label={`Delete preset ${preset.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      <section
        aria-label="Team settings"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Team settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => selectMode("teams")}
            className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm shadow-sm transition ${
              state.mode === "teams"
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
            }`}
          >
            <span className="font-semibold">Choose number of teams</span>
            <span className="text-xs text-slate-600">
              Set how many teams you want, and the tool will distribute players across
              them.
            </span>
          </button>
          <button
            type="button"
            onClick={() => selectMode("size")}
            className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm shadow-sm transition ${
              state.mode === "size"
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
            }`}
          >
            <span className="font-semibold">Choose team size</span>
            <span className="text-xs text-slate-600">
              Set a target players-per-team, and the tool will create as many teams as
              needed.
            </span>
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          {state.mode === "teams" ? (
            <div className="space-y-1">
              <label
                htmlFor="teamsCount"
                className="text-sm font-medium text-slate-800"
              >
                Number of teams
              </label>
              <input
                id="teamsCount"
                type="number"
                min={2}
                step="1"
                value={state.teamsCountInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    teamsCountInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label
                htmlFor="teamSize"
                className="text-sm font-medium text-slate-800"
              >
                Team size
              </label>
              <input
                id="teamSize"
                type="number"
                min={2}
                step="1"
                value={state.teamSizeInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    teamSizeInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Randomize teams
            </button>
            {hasTeams && (
              <button
                type="button"
                onClick={handleReroll}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Re-roll teams
              </button>
            )}
          </div>
        </div>
        {configError && (
          <p className="text-xs text-red-600">{configError}</p>
        )}
      </section>
      <section aria-label="Teams result" className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Teams
        </h2>
        {!hasTeams && (
          <p className="text-sm text-slate-700">
            Enter names, choose a team setting, and click Randomize teams to see the
            results.
          </p>
        )}
        {hasTeams && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams!.map((team, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  Team {index + 1}
                </h3>
                {team.length === 0 ? (
                  <p className="text-xs text-slate-500">No participants in this team.</p>
                ) : (
                  <ul className="list-disc space-y-0.5 pl-4 text-sm text-slate-800">
                    {team.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


