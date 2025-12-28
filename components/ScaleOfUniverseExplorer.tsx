"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { UniverseObjectId } from "@/data/scaleOfUniverse";
import {
  GUIDED_TOUR_IDS,
  UNIVERSE_OBJECTS_SORTED
} from "@/data/scaleOfUniverse";
import {
  buildComparisonText,
  clamp01,
  diameterMetersToZoom,
  findClosestObject,
  formatAstronomyLength,
  formatMetricLength,
  lerp,
  smoothstep,
  zoomToDiameterMeters
} from "@/lib/scaleOfUniverseLogic";

type StoredState = {
  zoom01: number;
  selectedId: UniverseObjectId | null;
  favorites: UniverseObjectId[];
};

const STORAGE_KEY = "lht_scale_universe_state_v1";

const normalizeText = (s: string): string =>
  s.trim().toLowerCase().replace(/\s+/g, " ");

const formatForScale = (meters: number): string => {
  if (meters >= 1e9) {
    return formatAstronomyLength(meters);
  }
  return formatMetricLength(meters);
};

const ScaleOfUniverseExplorer = () => {
  const [zoom01, setZoom01] = useState(0.45);
  const [targetZoom01, setTargetZoom01] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<UniverseObjectId | null>(null);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<UniverseObjectId[]>([]);
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (typeof parsed.zoom01 === "number") {
      setZoom01(clamp01(parsed.zoom01));
    }
    if (typeof parsed.selectedId === "string") {
      setSelectedId(parsed.selectedId as UniverseObjectId);
    }
    if (Array.isArray(parsed.favorites)) {
      setFavorites(
        parsed.favorites.filter((id): id is UniverseObjectId =>
          UNIVERSE_OBJECTS_SORTED.some((o) => o.id === id)
        )
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: StoredState = { zoom01, selectedId, favorites };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [zoom01, selectedId, favorites]);

  const diameterMeters = useMemo(() => zoomToDiameterMeters(zoom01), [zoom01]);

  const closest = useMemo(() => findClosestObject(diameterMeters), [diameterMeters]);

  const selected = useMemo(() => {
    if (selectedId) {
      const found = UNIVERSE_OBJECTS_SORTED.find((o) => o.id === selectedId);
      if (found) return found;
    }
    return closest;
  }, [selectedId, closest]);

  const nearby = useMemo(() => {
    const idx = UNIVERSE_OBJECTS_SORTED.findIndex((o) => o.id === selected.id);
    const prev = idx > 0 ? UNIVERSE_OBJECTS_SORTED[idx - 1] : null;
    const next = idx >= 0 && idx < UNIVERSE_OBJECTS_SORTED.length - 1 ? UNIVERSE_OBJECTS_SORTED[idx + 1] : null;
    return { prev, next };
  }, [selected.id]);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return UNIVERSE_OBJECTS_SORTED;
    return UNIVERSE_OBJECTS_SORTED.filter((o) => {
      const hay = normalizeText(`${o.name} ${o.category} ${o.description} ${o.comparisons.join(" ")}`);
      return hay.includes(q);
    });
  }, [query]);

  const isFavorite = (id: UniverseObjectId): boolean => favorites.includes(id);

  const toggleFavorite = (id: UniverseObjectId) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const selectObject = (id: UniverseObjectId) => {
    const o = UNIVERSE_OBJECTS_SORTED.find((x) => x.id === id);
    if (!o) return;
    setSelectedId(id);
    setTargetZoom01(diameterMetersToZoom(o.diameterMeters));
  };

  const startTour = () => {
    setTourActive(true);
    setTourIndex(0);
    const id = GUIDED_TOUR_IDS[0];
    selectObject(id);
  };

  const stopTour = () => {
    setTourActive(false);
  };

  const tourNext = () => {
    const nextIndex = Math.min(GUIDED_TOUR_IDS.length - 1, tourIndex + 1);
    setTourIndex(nextIndex);
    selectObject(GUIDED_TOUR_IDS[nextIndex]);
  };

  const tourPrev = () => {
    const nextIndex = Math.max(0, tourIndex - 1);
    setTourIndex(nextIndex);
    selectObject(GUIDED_TOUR_IDS[nextIndex]);
  };

  const animateZoomToTarget = () => {
    if (typeof targetZoom01 !== "number") return;
    const start = zoom01;
    const end = targetZoom01;
    const startTime = performance.now();
    const duration = 260;

    const step = (now: number) => {
      const t = clamp01((now - startTime) / duration);
      const eased = smoothstep(t);
      setZoom01(lerp(start, end, eased));
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        setTargetZoom01(null);
        rafRef.current = null;
      }
    };

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    rafRef.current = window.requestAnimationFrame(step);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof targetZoom01 !== "number") return;
    animateZoomToTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetZoom01]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (displayWidth <= 0 || displayHeight <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(displayWidth * dpr);
    const height = Math.round(displayHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#050914";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    const starCount = 120;
    for (let i = 0; i < starCount; i += 1) {
      const x = (i * 73) % displayWidth;
      const y = (i * 131) % displayHeight;
      const tw = ((i * 29) % 100) / 100;
      ctx.fillStyle = `rgba(226, 232, 240, ${0.15 + tw * 0.45})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }

    const cx = displayWidth / 2;
    const cy = displayHeight / 2;

    const selectedDiameter = selected.diameterMeters;
    const visibleDiameter = diameterMeters;
    const ratio = selectedDiameter / visibleDiameter;
    const baseRadius = Math.min(displayWidth, displayHeight) * 0.22;
    const radius = Math.max(3, Math.min(baseRadius * ratio, Math.min(displayWidth, displayHeight) * 0.44));

    const grad = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.25, radius * 0.1, cx, cy, radius);
    grad.addColorStop(0, "rgba(52, 211, 153, 0.95)");
    grad.addColorStop(1, "rgba(16, 185, 129, 0.25)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(52, 211, 153, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy + radius + 30);
    ctx.lineTo(cx + radius, cy + radius + 30);
    ctx.stroke();
    ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
    ctx.fillText(`${selected.name} diameter`, cx - radius, cy + radius + 22);

    ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
    ctx.font = "13px ui-sans-serif, system-ui, -apple-system, Segoe UI";
    ctx.fillText(`Zoom scale: ${formatForScale(visibleDiameter)}`, 14, 22);
    ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
    ctx.fillText(`Selected: ${formatForScale(selectedDiameter)}`, 14, 42);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom01, selected.id, selected.diameterMeters, diameterMeters]);

  const handleWheel = (event: React.WheelEvent) => {
    const delta = event.deltaY;
    const step = delta > 0 ? 0.02 : -0.02;
    setTargetZoom01(null);
    setZoom01((prev) => clamp01(prev + step));
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("zoom", zoom01.toFixed(4));
    params.set("id", selected.id);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(url)
        .then(() => setCopiedMessage("Copied link."))
        .catch(() => setCopiedMessage("Could not copy link."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedMessage("Copied link.");
    }
    window.setTimeout(() => setCopiedMessage(null), 1200);
  };

  const handleExportPng = async () => {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    const canvas = await html2canvas(exportRef.current, { backgroundColor: "#0b1220", scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `lifehacktoolbox-scale-of-universe-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const zoom = params.get("zoom");
    const id = params.get("id");
    if (zoom && Number.isFinite(Number(zoom))) {
      setZoom01(clamp01(Number(zoom)));
    }
    if (id && UNIVERSE_OBJECTS_SORTED.some((o) => o.id === id)) {
      setSelectedId(id as UniverseObjectId);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Zoom</h2>
            <p className="text-[11px] text-slate-600">
              Use the slider or scroll to zoom across orders of magnitude (log scale).
            </p>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-300">
                Current scale:{" "}
                <span className="font-mono text-emerald-300">
                  {formatForScale(diameterMeters)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-slate-800"
                >
                  Copy link
                </button>
                {copiedMessage && (
                  <span className="text-[11px] text-slate-300">{copiedMessage}</span>
                )}
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-[#050914]" onWheel={handleWheel}>
              <canvas ref={canvasRef} className="h-[360px] w-full sm:h-[430px]" />
            </div>

            <div className="mt-3 space-y-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.0005}
                value={zoom01}
                onChange={(e) => {
                  setTourActive(false);
                  setTargetZoom01(null);
                  setZoom01(clamp01(Number(e.target.value)));
                }}
                className="h-1 w-full cursor-pointer rounded-full bg-slate-800 accent-emerald-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Subatomic</span>
                <span>Human</span>
                <span>Cosmic</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900">Guided tour</p>
              {!tourActive ? (
                <button
                  type="button"
                  onClick={startTour}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Start tour
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopTour}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  End tour
                </button>
              )}
            </div>
            {tourActive && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={tourPrev}
                  disabled={tourIndex === 0}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={tourNext}
                  disabled={tourIndex >= GUIDED_TOUR_IDS.length - 1}
                  className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
                <span className="ml-auto text-[11px] text-slate-600">
                  Step <span className="font-mono">{tourIndex + 1}</span> /{" "}
                  <span className="font-mono">{GUIDED_TOUR_IDS.length}</span>
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Scale snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Scale of the Universe Explorer
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Selected:{" "}
                    <span className="font-semibold text-emerald-300">{selected.name}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? "Exporting…" : "Export PNG"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Size
                  </p>
                  <p className="font-mono text-sm text-slate-100">
                    {formatForScale(selected.diameterMeters)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-100">{selected.description}</p>
                <div className="mt-3 grid gap-2">
                  {selected.comparisons.slice(0, 2).map((c) => (
                    <div key={c} className="rounded-md border border-slate-800 bg-white/5 p-2 text-sm text-slate-200">
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Quick comparisons
                </p>
                <div className="mt-2 space-y-2 text-sm text-slate-200">
                  {nearby.prev && (
                    <div className="rounded-md border border-slate-800 bg-white/5 p-2">
                      {buildComparisonText(selected, nearby.prev)}
                    </div>
                  )}
                  {nearby.next && (
                    <div className="rounded-md border border-slate-800 bg-white/5 p-2">
                      {buildComparisonText(selected, nearby.next)}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Favorites
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selected.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                      isFavorite(selected.id)
                        ? "bg-amber-400 text-slate-900"
                        : "bg-slate-900 text-slate-100 hover:bg-slate-800"
                    }`}
                  >
                    {isFavorite(selected.id) ? "Starred" : "Star"}
                  </button>
                </div>
                {favorites.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No favorites yet.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {favorites
                      .map((id) => UNIVERSE_OBJECTS_SORTED.find((o) => o.id === id))
                      .filter((o): o is NonNullable<typeof o> => Boolean(o))
                      .map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => selectObject(o.id)}
                          className="rounded-full border border-slate-800 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10"
                        >
                          {o.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Privacy: favorites and last zoom are stored locally in your browser. Nothing is uploaded.
              </p>
            </div>
          </ExportableImageFrame>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Search objects</p>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="Search: atom, DNA, Earth, Milky Way…"
                spellCheck={false}
              />
              <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-slate-50">
                <ul className="divide-y divide-slate-200">
                  {filtered.map((o) => {
                    const active = o.id === selected.id;
                    return (
                      <li key={o.id} className="p-3">
                        <button
                          type="button"
                          onClick={() => selectObject(o.id)}
                          className={`w-full text-left ${
                            active ? "text-emerald-800" : "text-slate-900"
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-semibold">{o.name}</span>
                            <span className="font-mono text-xs text-slate-600">
                              {formatForScale(o.diameterMeters)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{o.category}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-[11px] text-slate-600">
                Tip: selecting an object jumps the zoom to its scale with a smooth transition.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScaleOfUniverseExplorer;


