"use client";

import { useEffect, useMemo, useState } from "react";

type KickSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  totalKicks: number;
  firstTenKicksReachedAt: string | null;
};

type BabyKickCounterState = {
  activeSession: KickSession | null;
  pastSessions: KickSession[];
};

const storageKey = "lht_baby_kick_sessions";

const createSession = (): KickSession => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Math.random()),
  startedAt: new Date().toISOString(),
  endedAt: null,
  totalKicks: 0,
  firstTenKicksReachedAt: null
});

const loadInitialSessions = (): KickSession[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(storageKey);

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
        typeof (item as { startedAt?: unknown }).startedAt === "string" &&
        typeof (item as { totalKicks?: unknown }).totalKicks === "number"
      ) {
        const endedAtValue = (item as { endedAt?: unknown }).endedAt;
        const firstTenValue = (item as { firstTenKicksReachedAt?: unknown })
          .firstTenKicksReachedAt;

        return {
          id: (item as { id: string }).id,
          startedAt: (item as { startedAt: string }).startedAt,
          endedAt:
            typeof endedAtValue === "string" || endedAtValue === null
              ? (endedAtValue as string | null)
              : null,
          totalKicks: (item as { totalKicks: number }).totalKicks,
          firstTenKicksReachedAt:
            typeof firstTenValue === "string" || firstTenValue === null
              ? (firstTenValue as string | null)
              : null
        } as KickSession;
      }
      return null;
    })
    .filter((session): session is KickSession => session !== null)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const formatDuration = (milliseconds: number) => {
  if (milliseconds <= 0) {
    return "0:00";
  }
  const totalSeconds = Math.floor(milliseconds / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const paddedSeconds = String(seconds).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
};

export default function BabyKickCounter() {
  const [state, setState] = useState<BabyKickCounterState>({
    activeSession: null,
    pastSessions: []
  });
  const [now, setNow] = useState<number | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessions = loadInitialSessions();
    if (sessions.length > 0) {
      setState((previous) => ({
        ...previous,
        pastSessions: sessions
      }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const serializable = state.pastSessions.map((session) => ({
      id: session.id,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      totalKicks: session.totalKicks,
      firstTenKicksReachedAt: session.firstTenKicksReachedAt
    }));
    window.localStorage.setItem(storageKey, JSON.stringify(serializable));
  }, [state.pastSessions]);

  useEffect(() => {
    if (!state.activeSession) {
      setNow(null);
      return;
    }

    setNow(Date.now());
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.activeSession?.id]);

  const elapsedMs = useMemo(() => {
    if (!state.activeSession) {
      return 0;
    }
    const startedAtMs = new Date(state.activeSession.startedAt).getTime();
    const reference = now ?? Date.now();
    return Math.max(0, reference - startedAtMs);
  }, [now, state.activeSession]);

  const elapsedMinutes = elapsedMs / 1000 / 60;

  const kicksPerHour =
    elapsedMinutes > 0 && state.activeSession && state.activeSession.totalKicks > 0
      ? (state.activeSession.totalKicks / elapsedMinutes) * 60
      : null;

  const timeToTen = useMemo(() => {
    if (!state.activeSession || !state.activeSession.firstTenKicksReachedAt) {
      return null;
    }
    const startedAtMs = new Date(state.activeSession.startedAt).getTime();
    const tenMs = new Date(
      state.activeSession.firstTenKicksReachedAt
    ).getTime();
    return Math.max(0, tenMs - startedAtMs);
  }, [state.activeSession]);

  const handleStartSession = () => {
    const newSession = createSession();
    setState((previous) => ({
      ...previous,
      activeSession: newSession
    }));
    setInfoMessage(null);
  };

  const handleAddKick = () => {
    setState((previous) => {
      if (!previous.activeSession) {
        return previous;
      }
      const nextTotal = previous.activeSession.totalKicks + 1;
      const firstTenKicksReachedAt =
        previous.activeSession.firstTenKicksReachedAt ||
        (nextTotal === 10 ? new Date().toISOString() : null);

      return {
        ...previous,
        activeSession: {
          ...previous.activeSession,
          totalKicks: nextTotal,
          firstTenKicksReachedAt
        }
      };
    });
  };

  const handleEndSession = () => {
    setState((previous) => {
      if (!previous.activeSession) {
        return previous;
      }
      const endedAt = new Date().toISOString();
      const finished: KickSession = {
        ...previous.activeSession,
        endedAt
      };
      return {
        activeSession: null,
        pastSessions: [finished, ...previous.pastSessions].slice(0, 20)
      };
    });
    setInfoMessage("Session ended. You can review it in your recent sessions below.");
  };

  const handleClearHistory = () => {
    setState((previous) => ({
      ...previous,
      pastSessions: []
    }));
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-8">
      <section
        aria-label="Disclaimer"
        className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      >
        <p className="font-semibold">Important</p>
        <p>
          This tool is for informational tracking only and is not medical advice. If you
          notice reduced baby movement, feel unwell, or have any concerns at all, contact
          your midwife, OB, or healthcare provider immediately rather than relying on this
          tool.
        </p>
      </section>
      <section
        aria-label="Active kick counting session"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Current session
        </h2>
        {!state.activeSession ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Start a session whenever you want to count kicks. Tap the button every time
              you feel a distinct movement.
            </p>
            <button
              type="button"
              onClick={handleStartSession}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
            >
              Start new session
            </button>
            {infoMessage && (
              <p className="text-xs text-slate-600">{infoMessage}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Session started
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {formatTime(state.activeSession.startedAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Elapsed
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDuration(elapsedMs)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kicks this session
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {state.activeSession.totalKicks}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estimated kicks per hour
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {kicksPerHour
                    ? `${kicksPerHour.toFixed(1)} kicks / hour`
                    : "Waiting for more time and kicks"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Time to 10 kicks
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {timeToTen
                    ? formatDuration(timeToTen)
                    : "Will appear once you reach 10 kicks"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAddKick}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-6 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Baby moved
              </button>
              <button
                type="button"
                onClick={handleEndSession}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
              >
                End session
              </button>
            </div>
            {infoMessage && (
              <p className="text-xs text-slate-600">{infoMessage}</p>
            )}
          </div>
        )}
      </section>
      <section
        aria-label="Recent kick counting sessions"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Recent sessions
          </h2>
          {state.pastSessions.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Clear history
            </button>
          )}
        </div>
        {state.pastSessions.length === 0 ? (
          <p className="text-sm text-slate-600">
            No past sessions saved yet. End a session to see it appear here.
          </p>
        ) : (
          <div className="space-y-2">
            <ul className="space-y-2 text-sm text-slate-800">
              {state.pastSessions.slice(0, 10).map((session) => {
                const started = new Date(session.startedAt).getTime();
                const ended = session.endedAt
                  ? new Date(session.endedAt).getTime()
                  : started;
                const durationMs = Math.max(0, ended - started);
                const timeToTenMs =
                  session.firstTenKicksReachedAt !== null
                    ? Math.max(
                        0,
                        new Date(session.firstTenKicksReachedAt).getTime() -
                          started
                      )
                    : null;

                return (
                  <li
                    key={session.id}
                    className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">
                        {formatTime(session.startedAt)}
                      </span>
                      <span className="text-xs text-slate-600">
                        {session.totalKicks}{" "}
                        {session.totalKicks === 1 ? "kick" : "kicks"}
                      </span>
                    </div>
                    <div className="grid gap-1 text-xs text-slate-700 sm:grid-cols-3">
                      <span>
                        Duration: {formatDuration(durationMs)}
                      </span>
                      <span>
                        Time to 10 kicks:{" "}
                        {timeToTenMs !== null
                          ? formatDuration(timeToTenMs)
                          : "Not reached"}
                      </span>
                      <span>
                        First 10 kicks:{" "}
                        {session.firstTenKicksReachedAt
                          ? formatTime(session.firstTenKicksReachedAt)
                          : "—"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}


