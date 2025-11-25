"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ExportableImageFrame from "@/components/ExportableImageFrame";

type WorkoutSet = {
  id: string;
  reps: number | null;
  weight: number | null;
  distance?: number | null;
  durationSeconds?: number | null;
  notes?: string;
};

type ExerciseType = "strength" | "cardio" | "bodyweight" | "custom";

type WorkoutExerciseInstance = {
  id: string;
  exerciseId: string;
  customName?: string;
  type: ExerciseType;
  sets: WorkoutSet[];
};

type WorkoutEntry = {
  id: string;
  date: string;
  dayOfWeek: string;
  workoutName: string;
  notes?: string;
  exercises: WorkoutExerciseInstance[];
};

type ExerciseGroup =
  | "Powerlifting"
  | "Bodybuilding"
  | "Cardio"
  | "Other";

type ExercisePreset = {
  id: string;
  name: string;
  type: ExerciseType;
  group: ExerciseGroup;
};

const EXERCISE_PRESETS: ExercisePreset[] = [
  // Powerlifting
  {
    id: "squat",
    name: "Squat",
    type: "strength",
    group: "Powerlifting"
  },
  {
    id: "bench",
    name: "Bench Press",
    type: "strength",
    group: "Powerlifting"
  },
  {
    id: "deadlift",
    name: "Deadlift",
    type: "strength",
    group: "Powerlifting"
  },
  {
    id: "ohp",
    name: "Overhead Press",
    type: "strength",
    group: "Powerlifting"
  },
  {
    id: "row",
    name: "Barbell Row",
    type: "strength",
    group: "Powerlifting"
  },
  // Bodybuilding
  {
    id: "incline-db-press",
    name: "Incline DB Press",
    type: "strength",
    group: "Bodybuilding"
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    type: "strength",
    group: "Bodybuilding"
  },
  {
    id: "leg-press",
    name: "Leg Press",
    type: "strength",
    group: "Bodybuilding"
  },
  {
    id: "bicep-curl",
    name: "Bicep Curl",
    type: "strength",
    group: "Bodybuilding"
  },
  {
    id: "tricep-pushdown",
    name: "Tricep Pushdown",
    type: "strength",
    group: "Bodybuilding"
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    type: "strength",
    group: "Bodybuilding"
  },
  {
    id: "leg-curl",
    name: "Leg Curl",
    type: "strength",
    group: "Bodybuilding"
  },
  {
    id: "lateral-raise",
    name: "Shoulder Lateral Raise",
    type: "strength",
    group: "Bodybuilding"
  },
  // Cardio
  {
    id: "treadmill",
    name: "Treadmill",
    type: "cardio",
    group: "Cardio"
  },
  {
    id: "bike",
    name: "Bike",
    type: "cardio",
    group: "Cardio"
  },
  {
    id: "rower",
    name: "Rowing Machine",
    type: "cardio",
    group: "Cardio"
  },
  {
    id: "elliptical",
    name: "Elliptical",
    type: "cardio",
    group: "Cardio"
  },
  {
    id: "run-outdoor",
    name: "Outdoor Run",
    type: "cardio",
    group: "Cardio"
  },
  {
    id: "walk-outdoor",
    name: "Outdoor Walk",
    type: "cardio",
    group: "Cardio"
  }
];

type WorkoutTrackerState = {
  workouts: WorkoutEntry[];
  selectedWorkoutId: string | null;
};

type WorkoutEditorState = {
  id: string | null;
  date: string;
  workoutName: string;
  notes: string;
  exercises: WorkoutExerciseInstance[];
};

const STORAGE_KEY = "lht_workout_tracker_v1";

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const createTodayInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDayOfWeek = (isoDate: string) => {
  const parts = isoDate.split("-");
  if (parts.length !== 3) {
    return "";
  }
  const year = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  const day = Number.parseInt(parts[2], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "";
  }
  const date = new Date(year, month - 1, day);
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long"
  });
  return formatter.format(date);
};

const parsePositive = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return NaN;
  }
  const numeric = Number.parseFloat(trimmed);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : NaN;
};

const estimateOneRm = (weight: number, reps: number) =>
  weight * (1 + reps / 30);

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
};

const WorkoutTracker = () => {
  const [state, setState] = useState<WorkoutTrackerState>({
    workouts: [],
    selectedWorkoutId: null
  });

  const [editor, setEditor] = useState<WorkoutEditorState>({
    id: null,
    date: createTodayInput(),
    workoutName: "",
    notes: "",
    exercises: []
  });

  const [exercisePickerOpen, setExercisePickerOpen] =
    useState(false);
  const [customExerciseName, setCustomExerciseName] =
    useState("");
  const [customExerciseType, setCustomExerciseType] =
    useState<ExerciseType>("strength");
  const [saveMessage, setSaveMessage] = useState<string | null>(
    null
  );
  const [selectedExerciseName, setSelectedExerciseName] =
    useState<string>("");

  const summaryFrameRef = useRef<HTMLDivElement | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(
    null
  );
  const [importError, setImportError] = useState<string | null>(
    null
  );

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkoutEntry[];
      if (Array.isArray(parsed)) {
        setState({
          workouts: parsed,
          selectedWorkoutId:
            parsed.length > 0 ? parsed[parsed.length - 1].id : null
        });
      }
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
    const serialized = JSON.stringify(state.workouts);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [hasHydrated, state.workouts]);

  const sortedWorkouts = useMemo(
    () =>
      [...state.workouts].sort((first, second) =>
        first.date.localeCompare(second.date)
      ),
    [state.workouts]
  );

  const selectedWorkout =
    state.selectedWorkoutId &&
    sortedWorkouts.find(
      (workout) => workout.id === state.selectedWorkoutId
    );

  useEffect(() => {
    if (selectedWorkout) {
      setEditor({
        id: selectedWorkout.id,
        date: selectedWorkout.date,
        workoutName: selectedWorkout.workoutName,
        notes: selectedWorkout.notes ?? "",
        exercises: selectedWorkout.exercises
      });
    }
  }, [selectedWorkout]);

  const handleEditorChange = <Key extends keyof WorkoutEditorState>(
    key: Key,
    value: WorkoutEditorState[Key]
  ) => {
    setEditor((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const addExerciseInstance = (preset: ExercisePreset) => {
    const instance: WorkoutExerciseInstance = {
      id: createId(),
      exerciseId: preset.id,
      customName: undefined,
      type: preset.type,
      sets: [
        {
          id: createId(),
          reps: null,
          weight: null
        }
      ]
    };
    setEditor((previous) => ({
      ...previous,
      exercises: [...previous.exercises, instance]
    }));
    setExercisePickerOpen(false);
  };

  const addCustomExercise = () => {
    const name = customExerciseName.trim();
    if (!name) {
      return;
    }
    const instance: WorkoutExerciseInstance = {
      id: createId(),
      exerciseId: `custom-${createId()}`,
      customName: name,
      type: customExerciseType,
      sets: [
        {
          id: createId(),
          reps: null,
          weight: null
        }
      ]
    };
    setEditor((previous) => ({
      ...previous,
      exercises: [...previous.exercises, instance]
    }));
    setCustomExerciseName("");
    setCustomExerciseType("strength");
    setExercisePickerOpen(false);
  };

  const updateExercise = (
    exerciseId: string,
    updater: (exercise: WorkoutExerciseInstance) => WorkoutExerciseInstance
  ) => {
    setEditor((previous) => ({
      ...previous,
      exercises: previous.exercises.map((exercise) =>
        exercise.id === exerciseId ? updater(exercise) : exercise
      )
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setEditor((previous) => ({
      ...previous,
      exercises: previous.exercises.filter(
        (exercise) => exercise.id !== exerciseId
      )
    }));
  };

  const addSet = (exerciseId: string) => {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          id: createId(),
          reps: null,
          weight: null
        }
      ]
    }));
  };

  const duplicateLastSet = (exerciseId: string) => {
    updateExercise(exerciseId, (exercise) => {
      if (exercise.sets.length === 0) {
        return {
          ...exercise,
          sets: [
            {
              id: createId(),
              reps: null,
              weight: null
            }
          ]
        };
      }
      const last = exercise.sets[exercise.sets.length - 1];
      return {
        ...exercise,
        sets: [
          ...exercise.sets,
          {
            id: createId(),
            reps: last.reps,
            weight: last.weight,
            distance: last.distance,
            durationSeconds: last.durationSeconds,
            notes: last.notes
          }
        ]
      };
    });
  };

  const updateSetField = (
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string
  ) => {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === setId
          ? {
              ...set,
              [field]:
                field === "notes"
                  ? value
                  : Number.isFinite(parsePositive(value))
                  ? parsePositive(value)
                  : null
            }
          : set
      )
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.filter((set) => set.id !== setId)
    }));
  };

  const canSaveWorkout = () => {
    if (!editor.date || !editor.workoutName.trim()) {
      return false;
    }
    if (editor.exercises.length === 0) {
      return false;
    }
    const hasAnySet = editor.exercises.some(
      (exercise) => exercise.sets.length > 0
    );
    return hasAnySet;
  };

  const handleSaveWorkout = () => {
    if (!canSaveWorkout()) {
      return;
    }
    const dayOfWeek = formatDayOfWeek(editor.date);
    const entry: WorkoutEntry = {
      id: editor.id ?? createId(),
      date: editor.date,
      dayOfWeek,
      workoutName: editor.workoutName.trim(),
      notes: editor.notes.trim() || undefined,
      exercises: editor.exercises
    };

    setState((previous) => {
      const existingIndex = previous.workouts.findIndex(
        (workout) => workout.id === entry.id
      );
      let nextWorkouts: WorkoutEntry[];
      if (existingIndex >= 0) {
        const copy = [...previous.workouts];
        copy[existingIndex] = entry;
        nextWorkouts = copy;
      } else {
        nextWorkouts = [...previous.workouts, entry];
      }
      return {
        workouts: nextWorkouts,
        selectedWorkoutId: entry.id
      };
    });

    setSaveMessage("Workout saved locally.");
    window.setTimeout(() => {
      setSaveMessage(null);
    }, 2500);
  };

  const handleNewWorkout = () => {
    setEditor({
      id: null,
      date: createTodayInput(),
      workoutName: "",
      notes: "",
      exercises: []
    });
    setState((previous) => ({
      ...previous,
      selectedWorkoutId: null
    }));
  };

  const handleSelectWorkout = (workoutId: string) => {
    setState((previous) => ({
      ...previous,
      selectedWorkoutId: workoutId
    }));
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setState((previous) => {
      const remaining = previous.workouts.filter(
        (workout) => workout.id !== workoutId
      );
      return {
        workouts: remaining,
        selectedWorkoutId:
          previous.selectedWorkoutId === workoutId
            ? remaining.length > 0
              ? remaining[remaining.length - 1].id
              : null
            : previous.selectedWorkoutId
      };
    });
  };

  const allExerciseNames = useMemo(() => {
    const names = new Set<string>();
    state.workouts.forEach((workout) =>
      workout.exercises.forEach((exercise) => {
        const preset = EXERCISE_PRESETS.find(
          (presetEntry) =>
            presetEntry.id === exercise.exerciseId
        );
        const name =
          exercise.customName ?? preset?.name ?? "Custom exercise";
        if (exercise.type === "strength" || exercise.type === "bodyweight") {
          names.add(name);
        }
      })
    );
    return Array.from(names).sort((first, second) =>
      first.localeCompare(second)
    );
  }, [state.workouts]);

  useEffect(() => {
    if (!selectedExerciseName && allExerciseNames.length > 0) {
      setSelectedExerciseName(allExerciseNames[0]);
    }
  }, [allExerciseNames, selectedExerciseName]);

  type ProgressPoint = {
    date: string;
    workoutName: string;
    estimatedOneRm: number;
    topWeight: number;
    topReps: number;
    volume: number;
  };

  const progressData: ProgressPoint[] = useMemo(() => {
    if (!selectedExerciseName) {
      return [];
    }
    const points: ProgressPoint[] = [];
    sortedWorkouts.forEach((workout) => {
      const matchingExercises = workout.exercises.filter(
        (exercise) => {
          const preset = EXERCISE_PRESETS.find(
            (presetEntry) =>
              presetEntry.id === exercise.exerciseId
          );
          const name =
            exercise.customName ?? preset?.name ?? "Custom exercise";
          return (
            name.toLowerCase() ===
            selectedExerciseName.toLowerCase()
          );
        }
      );
      if (matchingExercises.length === 0) {
        return;
      }
      let bestEstimated = 0;
      let bestWeight = 0;
      let bestReps = 0;
      let volume = 0;
      matchingExercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (
            set.weight !== null &&
            set.reps !== null &&
            set.weight > 0 &&
            set.reps > 0
          ) {
            const estimated = estimateOneRm(
              set.weight,
              set.reps
            );
            if (estimated > bestEstimated) {
              bestEstimated = estimated;
              bestWeight = set.weight;
              bestReps = set.reps;
            }
            volume += set.weight * set.reps;
          }
        });
      });
      if (bestEstimated > 0) {
        points.push({
          date: workout.date,
          workoutName: workout.workoutName,
          estimatedOneRm: bestEstimated,
          topWeight: bestWeight,
          topReps: bestReps,
          volume
        });
      }
    });
    return points;
  }, [selectedExerciseName, sortedWorkouts]);

  const handleExportCsv = () => {
    if (state.workouts.length === 0) {
      return;
    }
    const header =
      "date,day_of_week,workout_name,exercise_name,exercise_type,set_number,weight,reps,distance,duration_seconds,notes,workout_notes";
    const lines: string[] = [];
    state.workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const preset = EXERCISE_PRESETS.find(
          (presetEntry) =>
            presetEntry.id === exercise.exerciseId
        );
        const name =
          exercise.customName ?? preset?.name ?? "Custom exercise";
        exercise.sets.forEach((set, index) => {
          const values = [
            workout.date,
            workout.dayOfWeek,
            `"${workout.workoutName.replace(/"/g, '""')}"`,
            `"${name.replace(/"/g, '""')}"`,
            exercise.type,
            String(index + 1),
            set.weight !== null ? String(set.weight) : "",
            set.reps !== null ? String(set.reps) : "",
            set.distance !== null && set.distance !== undefined
              ? String(set.distance)
              : "",
            set.durationSeconds !== null &&
            set.durationSeconds !== undefined
              ? String(set.durationSeconds)
              : "",
            set.notes
              ? `"${set.notes.replace(/"/g, '""')}"`
              : "",
            workout.notes
              ? `"${workout.notes.replace(/"/g, '""')}"`
              : ""
          ];
          lines.push(values.join(","));
        });
      });
    });
    const csvContent = [header, ...lines].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = createTodayInput();
    link.href = url;
    link.download = `lifehacktoolbox-workouts-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImportMessage(null);
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result !== "string") {
        setImportError("Could not read file contents.");
        return;
      }
      const text = result.replace(/\r\n/g, "\n");
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      if (lines.length === 0) {
        setImportError("File was empty.");
        return;
      }
      const header = lines[0];
      const expectedHeader =
        "date,day_of_week,workout_name,exercise_name,exercise_type,set_number,weight,reps,distance,duration_seconds,notes,workout_notes";
      if (header !== expectedHeader) {
        setImportError(
          "This file does not match the workout CSV format exported from LifeHackToolbox."
        );
        return;
      }
      type WorkoutKey = string;
      const workoutMap = new Map<
        WorkoutKey,
        {
          date: string;
          dayOfWeek: string;
          workoutName: string;
          notes?: string;
          exercises: Map<
            string,
            {
              name: string;
              type: ExerciseType;
              sets: WorkoutSet[];
            }
          >;
        }
      >();

      for (let index = 1; index < lines.length; index += 1) {
        const line = lines[index];
        if (!line) {
          continue;
        }
        const fields = parseCsvLine(line);
        if (fields.length < 12) {
          setImportError(
            "One of the rows in this file is missing fields. Only CSVs exported from this workout tracker can be imported."
          );
          return;
        }
        const [
          date,
          dayOfWeek,
          workoutNameRaw,
          exerciseNameRaw,
          exerciseTypeRaw,
          setNumberRaw,
          weightRaw,
          repsRaw,
          distanceRaw,
          durationRaw,
          notesRaw,
          workoutNotesRaw
        ] = fields;
        const workoutName = workoutNameRaw.replace(/""/g, '"').replace(/^"|"$/g, "");
        const exerciseName = exerciseNameRaw.replace(/""/g, '"').replace(/^"|"$/g, "");
        const notes = notesRaw
          ? notesRaw.replace(/""/g, '"').replace(/^"|"$/g, "")
          : "";
        const workoutNotes = workoutNotesRaw
          ? workoutNotesRaw.replace(/""/g, '"').replace(/^"|"$/g, "")
          : "";
        const workoutKey: WorkoutKey = `${date}|||${workoutName}`;
        const exerciseKey = `${exerciseName}|||${exerciseTypeRaw}`;

        if (!workoutMap.has(workoutKey)) {
          workoutMap.set(workoutKey, {
            date,
            dayOfWeek,
            workoutName,
            notes: workoutNotes || undefined,
            exercises: new Map()
          });
        }
        const workoutEntry = workoutMap.get(workoutKey);
        if (!workoutEntry) {
          continue;
        }
        if (!workoutEntry.exercises.has(exerciseKey)) {
          workoutEntry.exercises.set(exerciseKey, {
            name: exerciseName,
            type: (exerciseTypeRaw as ExerciseType) ?? "strength",
            sets: []
          });
        }
        const exerciseEntry = workoutEntry.exercises.get(
          exerciseKey
        );
        if (!exerciseEntry) {
          continue;
        }
        const weightNumeric = parsePositive(weightRaw);
        const repsNumeric = parsePositive(repsRaw);
        const distanceNumeric = parsePositive(distanceRaw);
        const durationNumeric = parsePositive(durationRaw);
        const set: WorkoutSet = {
          id: createId(),
          weight: Number.isFinite(weightNumeric)
            ? weightNumeric
            : null,
          reps: Number.isFinite(repsNumeric)
            ? repsNumeric
            : null,
          distance: Number.isFinite(distanceNumeric)
            ? distanceNumeric
            : null,
          durationSeconds: Number.isFinite(durationNumeric)
            ? durationNumeric
            : null,
          notes: notes || undefined
        };
        exerciseEntry.sets.push(set);
      }

      const importedWorkouts: WorkoutEntry[] = [];
      workoutMap.forEach((value) => {
        const exercises: WorkoutExerciseInstance[] = [];
        value.exercises.forEach((exerciseValue) => {
          const preset = EXERCISE_PRESETS.find(
            (presetEntry) =>
              presetEntry.name.toLowerCase() ===
              exerciseValue.name.toLowerCase()
          );
          exercises.push({
            id: createId(),
            exerciseId: preset ? preset.id : `custom-${createId()}`,
            customName: preset ? undefined : exerciseValue.name,
            type: exerciseValue.type,
            sets: exerciseValue.sets
          });
        });
        importedWorkouts.push({
          id: createId(),
          date: value.date,
          dayOfWeek: value.dayOfWeek,
          workoutName: value.workoutName,
          notes: value.notes,
          exercises
        });
      });

      if (importedWorkouts.length === 0) {
        setImportError(
          "No workout rows were found in this file. Make sure you selected a CSV exported from this workout tracker."
        );
        return;
      }

      setState({
        workouts: importedWorkouts,
        selectedWorkoutId:
          importedWorkouts[importedWorkouts.length - 1].id
      });
      setImportMessage(
        "Imported workouts from CSV. This replaced any workouts that were previously saved in this browser."
      );
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleExportImage = async () => {
    if (!summaryFrameRef.current || !selectedWorkout) {
      return;
    }
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(summaryFrameRef.current, {
      backgroundColor: "#ffffff",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lifehacktoolbox-workout-summary.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const exerciseNameForInstance = (
    exercise: WorkoutExerciseInstance
  ) => {
    const preset = EXERCISE_PRESETS.find(
      (presetEntry) => presetEntry.id === exercise.exerciseId
    );
    return exercise.customName ?? preset?.name ?? "Custom exercise";
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Workouts are stored only in this browser.
        </p>
        <p>
          Your workout history is saved only in this browser using local
          storage. If you clear your browser data or use another device, your
          history may be lost. Export a CSV periodically to keep your own
          backup.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Workout editor
            </h2>
            <button
              type="button"
              onClick={handleNewWorkout}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              New workout
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={editor.date}
                onChange={(event) =>
                  handleEditorChange("date", event.target.value)
                }
                className={inputBaseClasses}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Workout name
              </label>
              <input
                type="text"
                value={editor.workoutName}
                onChange={(event) =>
                  handleEditorChange(
                    "workoutName",
                    event.target.value
                  )
                }
                className={inputBaseClasses}
                placeholder="e.g. Push Day, Legs, Upper Body"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Workout notes (optional)
            </label>
            <textarea
              value={editor.notes}
              onChange={(event) =>
                handleEditorChange("notes", event.target.value)
              }
              className={`${inputBaseClasses} min-h-[64px]`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
            <p className="text-xs font-medium text-slate-700">
              Exercises
            </p>
            <button
              type="button"
              onClick={() => setExercisePickerOpen((open) => !open)}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Add exercise
            </button>
          </div>
          {exercisePickerOpen && (
            <div className="space-y-3 rounded-md bg-slate-50 p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Powerlifting
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXERCISE_PRESETS.filter(
                      (preset) => preset.group === "Powerlifting"
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => addExerciseInstance(preset)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Bodybuilding
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXERCISE_PRESETS.filter(
                      (preset) => preset.group === "Bodybuilding"
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => addExerciseInstance(preset)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Cardio
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXERCISE_PRESETS.filter(
                      (preset) => preset.group === "Cardio"
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => addExerciseInstance(preset)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Custom exercise
                </p>
                <div className="grid gap-2 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto]">
                  <input
                    type="text"
                    value={customExerciseName}
                    onChange={(event) =>
                      setCustomExerciseName(event.target.value)
                    }
                    className={inputBaseClasses}
                    placeholder="Exercise name"
                  />
                  <select
                    value={customExerciseType}
                    onChange={(event) =>
                      setCustomExerciseType(
                        event.target.value as ExerciseType
                      )
                    }
                    className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="strength">Strength</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="cardio">Cardio</option>
                    <option value="custom">Custom / mixed</option>
                  </select>
                  <button
                    type="button"
                    onClick={addCustomExercise}
                    className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {editor.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {exerciseNameForInstance(exercise)}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      {exercise.type === "strength"
                        ? "Strength"
                        : exercise.type === "cardio"
                        ? "Cardio"
                        : exercise.type === "bodyweight"
                        ? "Bodyweight"
                        : "Custom"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="inline-flex items-center rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-700">
                      Sets
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => addSet(exercise.id)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        Add set
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateLastSet(exercise.id)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
                      >
                        Duplicate last
                      </button>
                    </div>
                  </div>
                  <div className="overflow-auto rounded-md border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">
                            #
                          </th>
                          {exercise.type === "cardio" ? (
                            <>
                              <th className="px-3 py-2 text-right font-semibold text-slate-700">
                                Distance
                              </th>
                              <th className="px-3 py-2 text-right font-semibold text-slate-700">
                                Duration (min)
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="px-3 py-2 text-right font-semibold text-slate-700">
                                Weight
                              </th>
                              <th className="px-3 py-2 text-right font-semibold text-slate-700">
                                Reps
                              </th>
                            </>
                          )}
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">
                            Notes
                          </th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-700">
                            Remove
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {exercise.sets.map((set, index) => (
                          <tr key={set.id}>
                            <td className="whitespace-nowrap px-3 py-1 text-slate-800">
                              {index + 1}
                            </td>
                            {exercise.type === "cardio" ? (
                              <>
                                <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.1"
                                    value={
                                      set.distance ?? ""
                                    }
                                    onChange={(event) =>
                                      updateSetField(
                                        exercise.id,
                                        set.id,
                                        "distance",
                                        event.target.value
                                      )
                                    }
                                    className={`${inputBaseClasses} h-7 text-right text-xs`}
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.1"
                                    value={
                                      set.durationSeconds
                                        ? set.durationSeconds /
                                          60
                                        : ""
                                    }
                                    onChange={(event) => {
                                      const numeric =
                                        parsePositive(
                                          event.target.value
                                        );
                                      updateSetField(
                                        exercise.id,
                                        set.id,
                                        "durationSeconds",
                                        Number.isFinite(
                                          numeric
                                        )
                                          ? String(
                                              numeric *
                                                60
                                            )
                                          : ""
                                      );
                                    }}
                                    className={`${inputBaseClasses} h-7 text-right text-xs`}
                                  />
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.5"
                                    value={set.weight ?? ""}
                                    onChange={(event) =>
                                      updateSetField(
                                        exercise.id,
                                        set.id,
                                        "weight",
                                        event.target.value
                                      )
                                    }
                                    className={`${inputBaseClasses} h-7 text-right text-xs`}
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                                  <input
                                    type="number"
                                    min={0}
                                    step="1"
                                    value={set.reps ?? ""}
                                    onChange={(event) =>
                                      updateSetField(
                                        exercise.id,
                                        set.id,
                                        "reps",
                                        event.target.value
                                      )
                                    }
                                    className={`${inputBaseClasses} h-7 text-right text-xs`}
                                  />
                                </td>
                              </>
                            )}
                            <td className="whitespace-nowrap px-3 py-1 text-slate-800">
                              <input
                                type="text"
                                value={set.notes ?? ""}
                                onChange={(event) =>
                                  updateSetField(
                                    exercise.id,
                                    set.id,
                                    "notes",
                                    event.target.value
                                  )
                                }
                                className={`${inputBaseClasses} h-7 text-xs`}
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-1 text-right text-slate-800">
                              <button
                                type="button"
                                onClick={() =>
                                  removeSet(exercise.id, set.id)
                                }
                                className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        ))}
                        {exercise.sets.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-3 py-2 text-center text-[11px] text-slate-500"
                            >
                              No sets yet. Add at least one set to
                              log this exercise.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
            {editor.exercises.length === 0 && (
              <p className="text-xs text-slate-500">
                No exercises added yet. Use &quot;Add exercise&quot; to start
                building this workout.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={handleSaveWorkout}
              disabled={!canSaveWorkout()}
              className={`inline-flex items-center rounded-md px-4 py-2 text-xs font-semibold shadow-sm ${
                canSaveWorkout()
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Save workout
            </button>
            {saveMessage && (
              <p className="text-xs text-emerald-700">
                {saveMessage}
              </p>
            )}
          </div>
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              History &amp; progress
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col gap-1 text-[10px] text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
                    Import workouts from CSV
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportCsv}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Export all workouts as CSV
              </button>
              <button
                type="button"
                onClick={handleExportImage}
                disabled={!selectedWorkout}
                className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm ${
                  selectedWorkout
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                Download workout summary image
              </button>
            </div>
          </div>
          {importMessage && (
            <p className="text-[11px] text-emerald-700">
              {importMessage}
            </p>
          )}
          {importError && (
            <p className="text-[11px] text-red-600">
              {importError}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.4fr)]">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Workout history
              </h3>
              <div className="max-h-72 overflow-auto rounded-md border border-slate-200">
                <ul className="divide-y divide-slate-200 text-xs">
                  {sortedWorkouts
                    .slice()
                    .reverse()
                    .map((workout) => {
                      const date = new Date(workout.date);
                      const formatter =
                        new Intl.DateTimeFormat(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        });
                      const formattedDate = formatter.format(date);
                      const isSelected =
                        state.selectedWorkoutId === workout.id;
                      return (
                        <li
                          key={workout.id}
                          className={`flex items-center justify-between gap-2 px-3 py-2 ${
                            isSelected
                              ? "bg-emerald-50"
                              : "bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectWorkout(workout.id)
                            }
                            className="flex flex-1 flex-col items-start text-left"
                          >
                            <span className="text-[11px] font-semibold text-slate-900">
                              {workout.workoutName}
                            </span>
                            <span className="text-[11px] text-slate-600">
                              {formattedDate} · {workout.dayOfWeek}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteWorkout(workout.id)
                            }
                            className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </li>
                      );
                    })}
                  {sortedWorkouts.length === 0 && (
                    <li className="px-3 py-3 text-center text-[11px] text-slate-500">
                      No workouts saved yet. Save a workout to see it here.
                    </li>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Selected workout summary
                </h3>
                {selectedWorkout ? (
                  <ExportableImageFrame
                    ref={summaryFrameRef}
                    title={`${selectedWorkout.workoutName}`}
                    className="text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {selectedWorkout.date} ·{" "}
                        {selectedWorkout.dayOfWeek}
                      </p>
                      {selectedWorkout.notes && (
                        <p className="text-slate-700">
                          {selectedWorkout.notes}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      {selectedWorkout.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="space-y-1"
                        >
                          <p className="font-semibold text-slate-900">
                            {exerciseNameForInstance(exercise)}
                          </p>
                          <ul className="space-y-0.5 text-slate-700">
                            {exercise.sets.map((set, index) => (
                              <li key={set.id}>
                                Set {index + 1}:{" "}
                                {exercise.type === "cardio" ? (
                                  <>
                                    {set.distance !==
                                    null
                                      ? `${set.distance} distance`
                                      : ""}
                                    {set.durationSeconds !==
                                      null &&
                                    set.durationSeconds !==
                                      undefined
                                      ? `, ${(set.durationSeconds / 60).toFixed(
                                          1
                                        )} min`
                                      : ""}
                                  </>
                                ) : (
                                  <>
                                    {set.weight !== null
                                      ? `${set.weight} x `
                                      : ""}
                                    {set.reps !== null
                                      ? `${set.reps} reps`
                                      : ""}
                                  </>
                                )}
                                {set.notes
                                  ? ` – ${set.notes}`
                                  : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ExportableImageFrame>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Select a workout from the list to see a summary here and
                    export it as an image.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Exercise progress
                </h3>
                <div className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <select
                    value={selectedExerciseName}
                    onChange={(event) =>
                      setSelectedExerciseName(
                        event.target.value
                      )
                    }
                    className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {allExerciseNames.length === 0 && (
                      <option value="">
                        Add workouts to see exercise trends
                      </option>
                    )}
                    {allExerciseNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-600">
                    Charts use your heaviest working set for each session and an
                    estimated 1RM using the Epley formula.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Estimated 1RM over time
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value: number) =>
                          value.toFixed(0)
                        }
                      />
                      <Tooltip
                        formatter={(value: number | string) =>
                          typeof value === "number"
                            ? value.toFixed(1)
                            : value
                        }
                        labelFormatter={(
                          label: string | number,
                          payload
                        ) => {
                          if (
                            !payload ||
                            payload.length === 0
                          ) {
                            return String(label);
                          }
                          const first = payload[0];
                          const point =
                            first && first.payload
                              ? (first.payload as ProgressPoint)
                              : null;
                          if (!point) {
                            return String(label);
                          }
                          return `${label} · ${point.workoutName}`;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="estimatedOneRm"
                        name="Estimated 1RM"
                        stroke="#0f766e"
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Volume per session
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value: number) =>
                          value.toFixed(0)
                        }
                      />
                      <Tooltip
                        formatter={(value: number | string) =>
                          typeof value === "number"
                            ? value.toFixed(0)
                            : value
                        }
                        labelFormatter={(
                          label: string | number,
                          payload
                        ) => {
                          if (
                            !payload ||
                            payload.length === 0
                          ) {
                            return String(label);
                          }
                          const first = payload[0];
                          const point =
                            first && first.payload
                              ? (first.payload as ProgressPoint)
                              : null;
                          if (!point) {
                            return String(label);
                          }
                          return `${label} · ${point.workoutName}`;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        name="Volume (weight × reps)"
                        stroke="#6366f1"
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Remember to keep your own backups.
        </p>
        <p>
          Your workouts are stored locally in this browser only. If you wipe
          browser storage or switch devices, this history may not be available.
          Use the CSV export to keep a long-term copy of your training log.
        </p>
      </div>
    </div>
  );
};

export default WorkoutTracker;


