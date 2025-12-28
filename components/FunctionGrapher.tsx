"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import {
  type AngleUnit,
  type Viewport,
  buildSampleTable,
  clampNumber,
  evaluateAst,
  findIntercepts,
  matchQuadratic,
  matchTrigForm,
  normalizeViewport,
  parseExpressionToAst
} from "@/lib/functionGrapherLogic";
import { useSearchParams } from "next/navigation";

type SliderDefinition = {
  key: "a" | "b" | "c" | "d";
  label: string;
  min: number;
  max: number;
  step: number;
};

type SliderState = Record<
  SliderDefinition["key"],
  number
>;

const defaultViewport: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const abs = Math.abs(value);
  if (abs >= 1000 || (abs > 0 && abs < 0.001)) {
    return value.toExponential(3);
  }
  return value.toFixed(4).replace(/\.?0+$/, "");
};

const encodeParams = (params: Record<string, string>): string => {
  const pairs = Object.entries(params)
    .filter(([, value]) => value.length > 0)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    );
  return pairs.length > 0 ? `?${pairs.join("&")}` : "";
};

const buildExpressionWithSliders = (
  expression: string,
  sliders: SliderState
): string => {
  const replaced = expression
    .replaceAll(/\ba\b/g, `(${sliders.a})`)
    .replaceAll(/\bb\b/g, `(${sliders.b})`)
    .replaceAll(/\bc\b/g, `(${sliders.c})`)
    .replaceAll(/\bd\b/g, `(${sliders.d})`);
  return replaced;
};

const FunctionGrapher = () => {
  const searchParams = useSearchParams();
  const [rawExpression, setRawExpression] =
    useState("x^2");
  const [angleUnit, setAngleUnit] =
    useState<AngleUnit>("radians");
  const [viewport, setViewport] =
    useState<Viewport>(defaultViewport);
  const [showGrid, setShowGrid] = useState(true);
  const [showIntercepts, setShowIntercepts] =
    useState(true);
  const [isExporting, setIsExporting] =
    useState(false);
  const [copyMessage, setCopyMessage] =
    useState<string | null>(null);
  const [sliderState, setSliderState] =
    useState<SliderState>({
      a: 1,
      b: 1,
      c: 0,
      d: 0
    });

  const exportRef = useRef<HTMLDivElement | null>(
    null
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(
    null
  );
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startViewport: Viewport;
  } | null>(null);

  useEffect(() => {
    const expr = searchParams.get("expr");
    const xMin = searchParams.get("xmin");
    const xMax = searchParams.get("xmax");
    const yMin = searchParams.get("ymin");
    const yMax = searchParams.get("ymax");
    const unit = searchParams.get("unit");
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    const c = searchParams.get("c");
    const d = searchParams.get("d");
    if (expr) {
      setRawExpression(expr);
    }
    if (unit === "degrees" || unit === "radians") {
      setAngleUnit(unit);
    }
    if (
      xMin &&
      xMax &&
      yMin &&
      yMax &&
      Number.isFinite(Number(xMin)) &&
      Number.isFinite(Number(xMax)) &&
      Number.isFinite(Number(yMin)) &&
      Number.isFinite(Number(yMax))
    ) {
      setViewport(
        normalizeViewport({
          xMin: Number(xMin),
          xMax: Number(xMax),
          yMin: Number(yMin),
          yMax: Number(yMax)
        })
      );
    }
    const nextSliders = {
      a: sliderState.a,
      b: sliderState.b,
      c: sliderState.c,
      d: sliderState.d
    };
    if (a && Number.isFinite(Number(a))) {
      nextSliders.a = Number(a);
    }
    if (b && Number.isFinite(Number(b))) {
      nextSliders.b = Number(b);
    }
    if (c && Number.isFinite(Number(c))) {
      nextSliders.c = Number(c);
    }
    if (d && Number.isFinite(Number(d))) {
      nextSliders.d = Number(d);
    }
    setSliderState(nextSliders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expressionWithSliders = useMemo(
    () => buildExpressionWithSliders(rawExpression, sliderState),
    [rawExpression, sliderState]
  );

  const parseResult = useMemo(
    () => parseExpressionToAst(expressionWithSliders),
    [expressionWithSliders]
  );

  const ast = parseResult.ok ? parseResult.ast : null;

  const sliderDefinitions: SliderDefinition[] = useMemo(() => {
    if (!ast) {
      return [];
    }
    const quadratic = matchQuadratic(ast);
    if (quadratic) {
      return [
        { key: "a", label: "a", min: -5, max: 5, step: 0.1 },
        { key: "b", label: "b", min: -10, max: 10, step: 0.1 },
        { key: "c", label: "c", min: -10, max: 10, step: 0.1 }
      ];
    }
    const trig = matchTrigForm(ast);
    if (trig) {
      return [
        { key: "a", label: "a (amplitude)", min: -5, max: 5, step: 0.1 },
        { key: "b", label: "b (frequency)", min: -10, max: 10, step: 0.1 },
        { key: "c", label: "c (phase)", min: -6.28, max: 6.28, step: 0.05 },
        { key: "d", label: "d (vertical shift)", min: -10, max: 10, step: 0.1 }
      ];
    }
    return [];
  }, [ast]);

  const intercepts = useMemo(() => {
    if (!ast) {
      return { xIntercepts: [] as number[] };
    }
    return findIntercepts(ast, viewport, angleUnit);
  }, [ast, viewport, angleUnit]);

  const sampleTable = useMemo(() => {
    if (!ast) {
      return [];
    }
    return buildSampleTable(ast, viewport, angleUnit, 9);
  }, [ast, viewport, angleUnit]);

  const setViewportFromInputs = (patch: Partial<Viewport>) => {
    setViewport((previous) => normalizeViewport({ ...previous, ...patch }));
  };

  const worldToCanvas = (
    x: number,
    y: number,
    rect: { width: number; height: number },
    view: Viewport
  ) => {
    const px =
      ((x - view.xMin) / (view.xMax - view.xMin)) *
      rect.width;
    const py =
      rect.height -
      ((y - view.yMin) / (view.yMax - view.yMin)) *
        rect.height;
    return { px, py };
  };

  const canvasToWorld = (
    px: number,
    py: number,
    rect: { width: number; height: number },
    view: Viewport
  ) => {
    const x =
      view.xMin +
      (px / rect.width) * (view.xMax - view.xMin);
    const y =
      view.yMin +
      ((rect.height - py) / rect.height) *
        (view.yMax - view.yMin);
    return { x, y };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ast) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (displayWidth <= 0 || displayHeight <= 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(displayWidth * dpr);
    const height = Math.round(displayHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const view = normalizeViewport(viewport);
    const rect = { width: displayWidth, height: displayHeight };

    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (showGrid) {
      const gridColor = "rgba(148, 163, 184, 0.15)";
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const xSpan = view.xMax - view.xMin;
      const ySpan = view.yMax - view.yMin;
      const gridStepX = 10 ** Math.floor(Math.log10(xSpan / 8));
      const gridStepY = 10 ** Math.floor(Math.log10(ySpan / 8));

      const startX = Math.floor(view.xMin / gridStepX) * gridStepX;
      for (let x = startX; x <= view.xMax; x += gridStepX) {
        const p = worldToCanvas(x, 0, rect, view);
        ctx.beginPath();
        ctx.moveTo(p.px, 0);
        ctx.lineTo(p.px, rect.height);
        ctx.stroke();
      }
      const startY = Math.floor(view.yMin / gridStepY) * gridStepY;
      for (let y = startY; y <= view.yMax; y += gridStepY) {
        const p = worldToCanvas(0, y, rect, view);
        ctx.beginPath();
        ctx.moveTo(0, p.py);
        ctx.lineTo(rect.width, p.py);
        ctx.stroke();
      }
    }

    const axisColor = "rgba(226, 232, 240, 0.65)";
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    if (view.xMin <= 0 && view.xMax >= 0) {
      const x0 = worldToCanvas(0, 0, rect, view).px;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, rect.height);
      ctx.stroke();
    }
    if (view.yMin <= 0 && view.yMax >= 0) {
      const y0 = worldToCanvas(0, 0, rect, view).py;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(rect.width, y0);
      ctx.stroke();
    }

    const samples = Math.max(600, Math.floor(rect.width * 2));
    const step = (view.xMax - view.xMin) / (samples - 1);
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < samples; i += 1) {
      const x = view.xMin + i * step;
      const y = evaluateAst(ast, x, angleUnit);
      if (!Number.isFinite(y)) {
        started = false;
        continue;
      }
      const p = worldToCanvas(x, y, rect, view);
      if (!started) {
        ctx.moveTo(p.px, p.py);
        started = true;
      } else {
        ctx.lineTo(p.px, p.py);
      }
    }
    ctx.stroke();

    if (showIntercepts) {
      ctx.fillStyle = "#f97316";
      const dotRadius = 4;
      intercepts.xIntercepts.forEach((x) => {
        const y = 0;
        if (x < view.xMin || x > view.xMax) {
          return;
        }
        const p = worldToCanvas(x, y, rect, view);
        ctx.beginPath();
        ctx.arc(p.px, p.py, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });
      if (intercepts.yIntercept) {
        const p = worldToCanvas(0, intercepts.yIntercept.y, rect, view);
        ctx.beginPath();
        ctx.arc(p.px, p.py, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ast, viewport, showGrid, showIntercepts, angleUnit]);

  const handleWheel = (event: React.WheelEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const view = normalizeViewport(viewport);
    const anchor = canvasToWorld(px, py, { width: rect.width, height: rect.height }, view);
    const zoomFactor = event.deltaY > 0 ? 1.12 : 0.9;
    const xMin = anchor.x + (view.xMin - anchor.x) * zoomFactor;
    const xMax = anchor.x + (view.xMax - anchor.x) * zoomFactor;
    const yMin = anchor.y + (view.yMin - anchor.y) * zoomFactor;
    const yMax = anchor.y + (view.yMax - anchor.y) * zoomFactor;
    setViewport(normalizeViewport({ xMin, xMax, yMin, yMax }));
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startViewport: viewport
    };
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) {
      return;
    }
    if (drag.pointerId !== event.pointerId) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dxPx = event.clientX - drag.startX;
    const dyPx = event.clientY - drag.startY;
    const view = normalizeViewport(drag.startViewport);
    const dxWorld = (dxPx / rect.width) * (view.xMax - view.xMin);
    const dyWorld = (dyPx / rect.height) * (view.yMax - view.yMin);
    const next: Viewport = {
      xMin: view.xMin - dxWorld,
      xMax: view.xMax - dxWorld,
      yMin: view.yMin + dyWorld,
      yMax: view.yMax + dyWorld
    };
    setViewport(normalizeViewport(next));
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") {
      return;
    }
    const view = normalizeViewport(viewport);
    const params = encodeParams({
      expr: rawExpression,
      xmin: String(view.xMin),
      xmax: String(view.xMax),
      ymin: String(view.yMin),
      ymax: String(view.yMax),
      unit: angleUnit,
      a: String(sliderState.a),
      b: String(sliderState.b),
      c: String(sliderState.c),
      d: String(sliderState.d)
    });
    const url = `${window.location.origin}${window.location.pathname}${params}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(url)
        .then(() => setCopyMessage("Copied link."))
        .catch(() => setCopyMessage("Could not copy link."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyMessage("Copied link.");
    }
    window.setTimeout(() => setCopyMessage(null), 1200);
  };

  const handleExportPng = async () => {
    if (!exportRef.current || isExporting) {
      return;
    }
    setIsExporting(true);
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: "#0b1220",
      scale: 2
    });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `lifehacktoolbox-function-graph-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Function input
          </h2>
          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">
              Expression (use x)
            </span>
            <input
              value={rawExpression}
              onChange={(e) => setRawExpression(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Examples: x^2, 2x+3, sin(x), a*sin(bx+c)+d"
              spellCheck={false}
              autoComplete="off"
            />
            <p className="text-[11px] text-slate-500">
              Supported: + − × ÷, parentheses, x, pi, e, sin/cos/tan, sqrt, abs,
              log, exp. Implicit multiply works (2x, 3(x+1)).
            </p>
          </label>
          {!parseResult.ok && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
              {parseResult.message}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-900">
                Viewport
              </p>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-[11px] text-slate-600">
                  <span>x min</span>
                  <input
                    type="number"
                    value={viewport.xMin}
                    onChange={(e) =>
                      setViewportFromInputs({
                        xMin: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900"
                  />
                </label>
                <label className="space-y-1 text-[11px] text-slate-600">
                  <span>x max</span>
                  <input
                    type="number"
                    value={viewport.xMax}
                    onChange={(e) =>
                      setViewportFromInputs({
                        xMax: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900"
                  />
                </label>
                <label className="space-y-1 text-[11px] text-slate-600">
                  <span>y min</span>
                  <input
                    type="number"
                    value={viewport.yMin}
                    onChange={(e) =>
                      setViewportFromInputs({
                        yMin: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900"
                  />
                </label>
                <label className="space-y-1 text-[11px] text-slate-600">
                  <span>y max</span>
                  <input
                    type="number"
                    value={viewport.yMax}
                    onChange={(e) =>
                      setViewportFromInputs({
                        yMax: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                  />
                  Grid
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showIntercepts}
                    onChange={(e) => setShowIntercepts(e.target.checked)}
                    className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                  />
                  Intercepts
                </label>
                <button
                  type="button"
                  onClick={() => setViewport(defaultViewport)}
                  className="ml-auto rounded-md border border-slate-300 px-2 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset view
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-900">
                Trig mode
              </p>
              <div className="inline-flex rounded-full bg-slate-100 p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAngleUnit("radians")}
                  className={`rounded-full px-3 py-1 font-semibold ${
                    angleUnit === "radians"
                      ? "bg-slate-900 text-slate-50"
                      : "text-slate-700"
                  }`}
                >
                  Radians
                </button>
                <button
                  type="button"
                  onClick={() => setAngleUnit("degrees")}
                  className={`rounded-full px-3 py-1 font-semibold ${
                    angleUnit === "degrees"
                      ? "bg-slate-900 text-slate-50"
                      : "text-slate-700"
                  }`}
                >
                  Degrees
                </button>
              </div>
              {sliderDefinitions.length > 0 ? (
                <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-700">
                    Coefficient sliders
                  </p>
                  {sliderDefinitions.map((def) => (
                    <label
                      key={def.key}
                      className="block space-y-1 text-[11px] text-slate-700"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{def.label}</span>
                        <span className="font-mono text-slate-600">
                          {formatNumber(sliderState[def.key])}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={def.min}
                        max={def.max}
                        step={def.step}
                        value={sliderState[def.key]}
                        onChange={(e) =>
                          setSliderState((prev) => ({
                            ...prev,
                            [def.key]: clampNumber(
                              Number(e.target.value),
                              def.min,
                              def.max
                            )
                          }))
                        }
                        className="h-1 w-full cursor-pointer rounded-full bg-slate-200 accent-emerald-600"
                      />
                    </label>
                  ))}
                  <p className="text-[10px] text-slate-500">
                    Tip: use variables a, b, c, d in your expression.
                    Example: a*sin(bx+c)+d
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-600">
                  To enable sliders, write a common form using a, b, c, d — for
                  example <span className="font-mono">a*x^2+b*x+c</span> or{" "}
                  <span className="font-mono">a*sin(bx+c)+d</span>.
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting || !ast}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? "Exporting…" : "Export PNG"}
                </button>
                {copyMessage && (
                  <span className="self-center text-[11px] text-slate-600">
                    {copyMessage}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Privacy: everything runs in your browser. No data is uploaded.
          </p>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Function grapher snapshot"
            ref={exportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    f(x) ={" "}
                    <span className="font-mono text-emerald-300">
                      {rawExpression}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Pan by dragging. Zoom with trackpad/wheel.
                  </p>
                </div>
                <div className="text-[11px] text-slate-300">
                  {angleUnit === "degrees" ? "Trig: degrees" : "Trig: radians"}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
                <canvas
                  ref={canvasRef}
                  className="h-[340px] w-full touch-none sm:h-[420px]"
                  onWheel={handleWheel}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Intercepts
                  </p>
                  {!ast ? (
                    <p className="mt-2 text-sm text-slate-400">
                      Enter a valid expression to see intercepts.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1 text-sm text-slate-200">
                      <p>
                        <span className="font-semibold text-slate-100">
                          y-intercept:
                        </span>{" "}
                        {intercepts.yIntercept
                          ? `(${formatNumber(intercepts.yIntercept.x)}, ${formatNumber(
                              intercepts.yIntercept.y
                            )})`
                          : "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-100">
                          x-intercepts:
                        </span>{" "}
                        {intercepts.xIntercepts.length > 0
                          ? intercepts.xIntercepts
                              .map((x) => formatNumber(x))
                              .join(", ")
                          : "—"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Table of values
                  </p>
                  {!ast ? (
                    <p className="mt-2 text-sm text-slate-400">
                      Enter a valid expression to see sample values.
                    </p>
                  ) : (
                    <div className="mt-2 max-h-40 overflow-auto rounded-md border border-slate-800">
                      <table className="min-w-full border-collapse text-[11px]">
                        <thead className="bg-slate-900 text-slate-300">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">
                              x
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              f(x)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleTable.map((p) => (
                            <tr
                              key={p.x}
                              className="border-t border-slate-800 text-slate-200"
                            >
                              <td className="px-3 py-1.5 font-mono">
                                {formatNumber(p.x)}
                              </td>
                              <td className="px-3 py-1.5 font-mono">
                                {formatNumber(p.y)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                This graphing calculator is educational and approximate. For
                numeric edge cases (discontinuities, asymptotes), zoom in and
                adjust the viewport for clarity.
              </p>
            </div>
          </ExportableImageFrame>
          <p className="text-xs text-slate-600">
            Want more math tools? Try the{" "}
            <Link
              href="/unit-circle-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Unit Circle Calculator
            </Link>{" "}
            or the{" "}
            <Link
              href="/binary-decimal-hex-converter"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Number Base Converter
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default FunctionGrapher;


