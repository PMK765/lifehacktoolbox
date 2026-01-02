"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { GravityPresetId, ProjectileInputs, UnitSystem } from "@/lib/projectileMotionLogic";
import {
  computeProjectile,
  GRAVITY_PRESETS,
  gravityToOutput,
  lengthToOutput,
  mpsFromInput,
  pointsToCsv,
  speedToOutput
} from "@/lib/projectileMotionLogic";

type StoredState = {
  unitSystem: UnitSystem;
  speed: number;
  angleDeg: number;
  initialHeight: number;
  gravityPreset: GravityPresetId;
  customGravity: number;
  airResistanceEnabled: boolean;
  airResistanceStrength: number;
};

const STORAGE_KEY = "lht_projectile_motion_state_v1";

const formatNumber = (value: number, digits = 3): string => {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits).replace(/\.?0+$/, "");
};

type CanvasView = {
  padding: { left: number; right: number; top: number; bottom: number };
  xMax: number;
  yMax: number;
};

const ProjectileMotionSimulator = () => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [speed, setSpeed] = useState<number>(20);
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const [initialHeight, setInitialHeight] = useState<number>(0);
  const [gravityPreset, setGravityPreset] = useState<GravityPresetId>("earth");
  const [customGravity, setCustomGravity] = useState<number>(9.80665);
  const [airResistanceEnabled, setAirResistanceEnabled] = useState(false);
  const [airResistanceStrength, setAirResistanceStrength] = useState<number>(0.15);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animTime, setAnimTime] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const animTimeRef = useRef(0);
  const flightTimeRef = useRef(0);

  const exportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (parsed.unitSystem === "metric" || parsed.unitSystem === "imperial") setUnitSystem(parsed.unitSystem);
    if (typeof parsed.speed === "number") setSpeed(parsed.speed);
    if (typeof parsed.angleDeg === "number") setAngleDeg(parsed.angleDeg);
    if (typeof parsed.initialHeight === "number") setInitialHeight(parsed.initialHeight);
    if (parsed.gravityPreset === "earth" || parsed.gravityPreset === "moon" || parsed.gravityPreset === "mars" || parsed.gravityPreset === "custom") {
      setGravityPreset(parsed.gravityPreset);
    }
    if (typeof parsed.customGravity === "number") setCustomGravity(parsed.customGravity);
    if (typeof parsed.airResistanceEnabled === "boolean") setAirResistanceEnabled(parsed.airResistanceEnabled);
    if (typeof parsed.airResistanceStrength === "number") setAirResistanceStrength(parsed.airResistanceStrength);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: StoredState = {
      unitSystem,
      speed,
      angleDeg,
      initialHeight,
      gravityPreset,
      customGravity,
      airResistanceEnabled,
      airResistanceStrength
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [unitSystem, speed, angleDeg, initialHeight, gravityPreset, customGravity, airResistanceEnabled, airResistanceStrength]);

  const inputs: ProjectileInputs = useMemo(
    () => ({
      unitSystem,
      speed,
      angleDeg,
      initialHeight,
      gravityPreset,
      customGravity,
      airResistanceEnabled,
      airResistanceStrength
    }),
    [unitSystem, speed, angleDeg, initialHeight, gravityPreset, customGravity, airResistanceEnabled, airResistanceStrength]
  );

  const computed = useMemo(() => computeProjectile(inputs), [inputs]);

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  useEffect(() => {
    animTimeRef.current = animTime;
  }, [animTime]);

  useEffect(() => {
    flightTimeRef.current = computed.ok ? computed.outputs.timeOfFlight : 0;
  }, [computed]);

  useEffect(() => {
    setIsAnimating(false);
    setAnimTime(0);
    animTimeRef.current = 0;
    lastTsRef.current = null;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [speed, angleDeg, initialHeight, gravityPreset, customGravity, airResistanceEnabled, airResistanceStrength, unitSystem]);

  const view: CanvasView | null = useMemo(() => {
    if (!computed.ok) return null;
    const xMax = Math.max(1, computed.outputs.range);
    const yMax = Math.max(1, computed.outputs.maxHeight);
    return {
      padding: { left: 52, right: 16, top: 16, bottom: 40 },
      xMax: xMax * 1.06,
      yMax: yMax * 1.12
    };
  }, [computed]);

  const sampleAtTime = (t: number) => {
    if (!computed.ok) return null;
    const pts = computed.outputs.points;
    if (pts.length === 0) return null;
    if (t <= 0) return pts[0];
    if (t >= computed.outputs.timeOfFlight) return pts[pts.length - 1];
    let lo = 0;
    let hi = pts.length - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (pts[mid].t < t) lo = mid + 1;
      else hi = mid;
    }
    const right = pts[lo];
    const left = pts[Math.max(0, lo - 1)];
    const span = right.t - left.t;
    const alpha = span > 0 ? (t - left.t) / span : 0;
    return {
      t,
      x: left.x + (right.x - left.x) * alpha,
      y: left.y + (right.y - left.y) * alpha,
      vx: left.vx + (right.vx - left.vx) * alpha,
      vy: left.vy + (right.vy - left.vy) * alpha,
      speed: left.speed + (right.speed - left.speed) * alpha
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !computed.ok || !view) return;
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

    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    const { padding, xMax, yMax } = view;
    const plotW = displayWidth - padding.left - padding.right;
    const plotH = displayHeight - padding.top - padding.bottom;
    const xFor = (x: number) => padding.left + (x / xMax) * plotW;
    const yFor = (y: number) => padding.top + plotH - (y / yMax) * plotH;

    ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i += 1) {
      const y = padding.top + (i / 5) * plotH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i += 1) {
      const x = padding.left + (i / 6) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + plotH);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(226, 232, 240, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotH);
    ctx.lineTo(padding.left + plotW, padding.top + plotH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.stroke();

    const pts = computed.outputs.points;
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    pts.forEach((p, idx) => {
      const px = xFor(p.x);
      const py = yFor(p.y);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    const current = sampleAtTime(animTime);
    if (current) {
      const cx = xFor(current.x);
      const cy = yFor(current.y);
      ctx.fillStyle = "rgba(251, 146, 60, 0.95)";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(251, 146, 60, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    const lengthUnit = unitSystem === "imperial" ? "ft" : "m";
    ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
    ctx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI";
    ctx.fillText(`x ( ${lengthUnit} )`, padding.left + plotW - 44, padding.top + plotH + 30);
    ctx.fillText(`y ( ${lengthUnit} )`, 10, padding.top + 12);

    const xLabel = lengthToOutput(xMax, unitSystem);
    const yLabel = lengthToOutput(yMax, unitSystem);
    ctx.fillText(formatNumber(0, 0), padding.left - 8, padding.top + plotH + 26);
    ctx.fillText(formatNumber(xLabel, 1), padding.left + plotW - 40, padding.top + plotH + 26);
    ctx.fillText(formatNumber(yLabel, 1), 10, padding.top + 28);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed, view, animTime]);

  const animate = (ts: number) => {
    if (!isAnimatingRef.current) {
      rafRef.current = null;
      return;
    }
    const prev = lastTsRef.current;
    lastTsRef.current = ts;
    const dt = typeof prev === "number" ? (ts - prev) / 1000 : 0;
    if (!Number.isFinite(dt) || dt <= 0) {
      rafRef.current = window.requestAnimationFrame(animate);
      return;
    }
    const flightTime = flightTimeRef.current;
    const next = animTimeRef.current + dt;
    if (flightTime > 0 && next >= flightTime) {
      animTimeRef.current = flightTime;
      setAnimTime(flightTime);
      isAnimatingRef.current = false;
      setIsAnimating(false);
      rafRef.current = null;
      return;
    }
    animTimeRef.current = next;
    setAnimTime(next);
    rafRef.current = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAnimating) return;
    rafRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating]);

  const startAnimation = () => {
    if (!computed.ok) return;
    setAnimTime(0);
    animTimeRef.current = 0;
    lastTsRef.current = null;
    isAnimatingRef.current = true;
    setIsAnimating(true);
  };

  const pauseResume = () => {
    if (!computed.ok) return;
    if (isAnimating) {
      isAnimatingRef.current = false;
      setIsAnimating(false);
      return;
    }
    if (animTime >= computed.outputs.timeOfFlight) {
      setAnimTime(0);
      animTimeRef.current = 0;
    }
    lastTsRef.current = null;
    isAnimatingRef.current = true;
    setIsAnimating(true);
  };

  const handleExportPng = async () => {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    const canvas = await html2canvas(exportRef.current, { backgroundColor: "#0b1220", scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `lifehacktoolbox-projectile-motion-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  const handleDownloadCsv = () => {
    if (typeof window === "undefined") return;
    if (!computed.ok) return;
    const csv = pointsToCsv(computed.outputs.points, unitSystem);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `projectile-trajectory-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCsv = () => {
    if (typeof window === "undefined") return;
    if (!computed.ok) return;
    const csv = pointsToCsv(computed.outputs.points, unitSystem);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(csv)
        .then(() => setCopiedMessage("Copied CSV."))
        .catch(() => setCopiedMessage("Could not copy CSV."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = csv;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedMessage("Copied CSV.");
    }
    window.setTimeout(() => setCopiedMessage(null), 1200);
  };

  const speedUnit = unitSystem === "imperial" ? "ft/s" : "m/s";
  const lengthUnit = unitSystem === "imperial" ? "ft" : "m";
  const gravityUnit = unitSystem === "imperial" ? "ft/s²" : "m/s²";

  const usedGravity = useMemo(() => {
    const preset = GRAVITY_PRESETS.find((p) => p.id === gravityPreset);
    const g = gravityPreset === "custom" ? customGravity : preset?.g_m_s2 ?? 9.80665;
    return gravityToOutput(g, unitSystem);
  }, [gravityPreset, customGravity, unitSystem]);

  const currentPoint = useMemo(() => sampleAtTime(animTime), [animTime, computed.ok]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Inputs</h2>
            <p className="text-[11px] text-slate-600">
              Educational physics model. Air resistance uses a simple linear drag approximation.
            </p>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Units</span>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="metric">Metric (m, m/s)</option>
                <option value="imperial">Imperial (ft, ft/s)</option>
              </select>
            </label>
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Gravity preset</span>
              <select
                value={gravityPreset}
                onChange={(e) => setGravityPreset(e.target.value as GravityPresetId)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {GRAVITY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {gravityPreset === "custom" && (
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Custom gravity (m/s²)</span>
              <input
                value={String(customGravity)}
                onChange={(e) => setCustomGravity(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                inputMode="decimal"
              />
              <p className="text-[11px] text-slate-500">
                Displayed gravity: <span className="font-mono">{formatNumber(usedGravity, 3)} {gravityUnit}</span>
              </p>
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Launch speed ({speedUnit})</span>
              <input
                value={String(speed)}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                inputMode="decimal"
              />
            </label>
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Angle (degrees)</span>
              <input
                value={String(angleDeg)}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                inputMode="decimal"
              />
            </label>
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Initial height ({lengthUnit})</span>
              <input
                value={String(initialHeight)}
                onChange={(e) => setInitialHeight(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                inputMode="decimal"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={airResistanceEnabled}
                  onChange={(e) => setAirResistanceEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                Air resistance (simple)
              </label>
              <div className="ml-auto text-[11px] text-slate-600">
                Model: <span className="font-mono">a = -gŷ - k·v</span>
              </div>
            </div>
            {airResistanceEnabled && (
              <label className="mt-3 block space-y-1 text-xs text-slate-700">
                <span className="font-medium text-slate-700">Drag strength k</span>
                <input
                  type="range"
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  value={airResistanceStrength}
                  onChange={(e) => setAirResistanceStrength(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer rounded-full bg-slate-200 accent-emerald-600"
                />
                <p className="text-[11px] text-slate-500">
                  k = <span className="font-mono">{formatNumber(airResistanceStrength, 2)}</span>
                </p>
              </label>
            )}
          </div>

          {!computed.ok ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {computed.message}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Results
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-600">Time of flight</p>
                  <p className="mt-1 font-mono text-lg text-slate-900">
                    {formatNumber(computed.outputs.timeOfFlight, 3)} s
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-600">Range</p>
                  <p className="mt-1 font-mono text-lg text-slate-900">
                    {formatNumber(lengthToOutput(computed.outputs.range, unitSystem), 3)} {lengthUnit}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-600">Max height</p>
                  <p className="mt-1 font-mono text-lg text-slate-900">
                    {formatNumber(lengthToOutput(computed.outputs.maxHeight, unitSystem), 3)} {lengthUnit}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-600">Impact speed</p>
                  <p className="mt-1 font-mono text-lg text-slate-900">
                    {formatNumber(speedToOutput(computed.outputs.impactSpeed, unitSystem), 3)} {speedUnit}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Gravity used: <span className="font-mono">{formatNumber(usedGravity, 3)} {gravityUnit}</span>{" "}
                • Launch speed (m/s): <span className="font-mono">{formatNumber(mpsFromInput(speed, unitSystem), 3)}</span>
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Projectile motion snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Projectile Motion Simulator
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Speed: <span className="font-mono text-emerald-300">{formatNumber(speed, 2)} {speedUnit}</span>{" "}
                    • Angle: <span className="font-mono text-emerald-300">{formatNumber(angleDeg, 1)}°</span>{" "}
                    • Height: <span className="font-mono text-emerald-300">{formatNumber(initialHeight, 2)} {lengthUnit}</span>
                    {airResistanceEnabled ? (
                      <> • Drag: <span className="font-mono text-emerald-300">k={formatNumber(airResistanceStrength, 2)}</span></>
                    ) : (
                      <> • Drag: <span className="font-mono text-slate-100">off</span></>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={pauseResume}
                    disabled={!computed.ok}
                    className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAnimating ? "Pause" : "Play"}
                  </button>
                  <button
                    type="button"
                    onClick={startAnimation}
                    disabled={!computed.ok}
                    className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Restart
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
                <canvas ref={canvasRef} className="h-[320px] w-full sm:h-[420px]" />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Time
                  </p>
                  <p className="mt-2 font-mono text-lg text-slate-100">
                    {formatNumber(animTime, 2)} s
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Position
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-100">
                    x={currentPoint ? formatNumber(lengthToOutput(currentPoint.x, unitSystem), 2) : "—"} {lengthUnit}
                  </p>
                  <p className="font-mono text-sm text-slate-100">
                    y={currentPoint ? formatNumber(lengthToOutput(currentPoint.y, unitSystem), 2) : "—"} {lengthUnit}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Velocity
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-100">
                    vx={currentPoint ? formatNumber(speedToOutput(currentPoint.vx, unitSystem), 2) : "—"} {speedUnit}
                  </p>
                  <p className="font-mono text-sm text-slate-100">
                    vy={currentPoint ? formatNumber(speedToOutput(currentPoint.vy, unitSystem), 2) : "—"} {speedUnit}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Assumptions: flat ground, constant gravity. No-drag uses closed-form kinematics; drag uses a simple linear model for teaching intuition.
              </p>
            </div>
          </ExportableImageFrame>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportPng}
              disabled={!computed.ok || isExporting}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? "Exporting…" : "Export PNG"}
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={!computed.ok}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download CSV (points)
            </button>
            <button
              type="button"
              onClick={handleCopyCsv}
              disabled={!computed.ok}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Copy CSV
            </button>
            {copiedMessage && (
              <span className="text-[11px] text-slate-600">{copiedMessage}</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectileMotionSimulator;


