"use client";

import { useMemo, useState } from "react";
import { UNIT_CIRCLE_REFERENCE } from "@/data/unitCircleReference";

type AngleInputMode = "degrees" | "radians";

type ExactTrigValues = {
  sinExact: string;
  cosExact: string;
  tanExact: string;
  tanDefined: boolean;
} | null;

const normalizeDegrees = (degrees: number): number => {
  let result = degrees % 360;
  if (result < 0) {
    result += 360;
  }
  return result;
};

const degreesToRadians = (degrees: number): number =>
  (degrees * Math.PI) / 180;

const radiansToDegrees = (radians: number): number =>
  (radians * 180) / Math.PI;

const formatDecimal = (value: number, maxDecimals: number): string => {
  if (!Number.isFinite(value)) {
    return "–";
  }
  const factor = 10 ** maxDecimals;
  const rounded = Math.round(value * factor) / factor;
  return rounded
    .toFixed(maxDecimals)
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "");
};

const findClosestReferenceAngle = (degrees: number, maxDelta: number) => {
  const normalized = normalizeDegrees(degrees);
  let closest = null as
    | {
        rowIndex: number;
        rowDegrees: number;
        delta: number;
      }
    | null;
  for (let index = 0; index < UNIT_CIRCLE_REFERENCE.length; index += 1) {
    const row = UNIT_CIRCLE_REFERENCE[index];
    const delta = Math.abs(normalizeDegrees(row.degrees) - normalized);
    if (delta <= maxDelta && (closest == null || delta < closest.delta)) {
      closest = { rowIndex: index, rowDegrees: row.degrees, delta };
    }
  }
  return closest;
};

const formatRadiansAsPi = (radians: number): string => {
  const degrees = radiansToDegrees(radians);
  const closest = findClosestReferenceAngle(degrees, 0.5);
  if (closest != null) {
    const row = UNIT_CIRCLE_REFERENCE[closest.rowIndex];
    return row.radiansLabel;
  }
  return `${formatDecimal(radians, 4)} rad`;
};

const getExactTrigValues = (angleDegrees: number): ExactTrigValues => {
  const closest = findClosestReferenceAngle(angleDegrees, 0.5);
  if (closest == null) {
    return null;
  }
  const row = UNIT_CIRCLE_REFERENCE[closest.rowIndex];
  return {
    sinExact: row.sinExact,
    cosExact: row.cosExact,
    tanExact: row.tanExact,
    tanDefined: row.tanDefined
  };
};

const UnitCircleExplorer = () => {
  const [angleDegrees, setAngleDegrees] = useState<number>(30);
  const [angleInputMode, setAngleInputMode] =
    useState<AngleInputMode>("degrees");
  const [angleInputText, setAngleInputText] = useState<string>("30");
  const [snapToCommon, setSnapToCommon] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const normalizedDegrees = normalizeDegrees(angleDegrees);
  const angleRadians = degreesToRadians(normalizedDegrees);
  const cosValue = Math.cos(angleRadians);
  const sinValue = Math.sin(angleRadians);
  const tanRaw = cosValue === 0 ? NaN : Math.tan(angleRadians);

  const exactValues = useMemo(
    () => getExactTrigValues(normalizedDegrees),
    [normalizedDegrees]
  );

  const handleAngleInputCommit = () => {
    const trimmed = angleInputText.trim();
    if (!trimmed) {
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      return;
    }
    const newDegrees =
      angleInputMode === "degrees"
        ? parsed
        : radiansToDegrees(parsed);
    setAngleDegrees(newDegrees);
  };

  const handlePointerUpdate = (
    clientX: number,
    clientY: number,
    rect: DOMRect
  ) => {
    const svgSize = 200;
    const xInSvg =
      ((clientX - rect.left) / rect.width) * svgSize;
    const yInSvg =
      ((clientY - rect.top) / rect.height) * svgSize;
    const center = svgSize / 2;
    const dx = xInSvg - center;
    const dy = center - yInSvg;
    const angleRad = Math.atan2(dy, dx);
    const degreesRaw = radiansToDegrees(angleRad);
    let newDegrees = normalizeDegrees(degreesRaw);
    if (snapToCommon) {
      const closest = findClosestReferenceAngle(newDegrees, 4);
      if (closest != null) {
        newDegrees = normalizeDegrees(closest.rowDegrees);
      }
    }
    setAngleDegrees(newDegrees);
    setAngleInputText(
      angleInputMode === "degrees"
        ? formatDecimal(newDegrees, 2)
        : formatDecimal(degreesToRadians(newDegrees), 4)
    );
  };

  const handleSvgPointerDown: React.PointerEventHandler<SVGSVGElement> = (
    event
  ) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    handlePointerUpdate(event.clientX, event.clientY, rect);
    setIsDragging(true);
    target.setPointerCapture(event.pointerId);
  };

  const handleSvgPointerMove: React.PointerEventHandler<SVGSVGElement> = (
    event
  ) => {
    if (!isDragging) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    handlePointerUpdate(event.clientX, event.clientY, rect);
  };

  const handleSvgPointerUp: React.PointerEventHandler<SVGSVGElement> = (
    event
  ) => {
    if (!isDragging) {
      return;
    }
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const radius = 80;
  const center = 100;
  const pointX = center + radius * cosValue;
  const pointY = center - radius * sinValue;

  const xAxisStart = center - radius - 10;
  const xAxisEnd = center + radius + 10;
  const yAxisStart = center - radius - 10;
  const yAxisEnd = center + radius + 10;

  const referenceAngles = [
    0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360
  ];

  const activeReference = referenceAngles.find(
    (degrees) => normalizeDegrees(degrees) === normalizedDegrees
  );

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="max-w-2xl text-sm text-slate-700">
          Use this interactive unit circle calculator to drag the angle
          around the circle, switch between degrees and radians, and see
          sine, cosine, and tangent values update in real time.
        </p>
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)]">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1 text-sm text-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Angle
                </span>
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAngleInputMode("degrees");
                      setAngleInputText(
                        formatDecimal(normalizedDegrees, 2)
                      );
                    }}
                    className={`rounded-full px-2 py-1 ${
                      angleInputMode === "degrees"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    Degrees
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAngleInputMode("radians");
                      setAngleInputText(
                        formatDecimal(angleRadians, 4)
                      );
                    }}
                    className={`rounded-full px-2 py-1 ${
                      angleInputMode === "radians"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    Radians
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={angleInputText}
                  onChange={(event) => setAngleInputText(event.target.value)}
                  onBlur={handleAngleInputCommit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleAngleInputCommit();
                    }
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:max-w-[10rem]"
                  placeholder={
                    angleInputMode === "degrees"
                      ? "Angle in degrees"
                      : "Angle in radians"
                  }
                />
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={snapToCommon}
                    onChange={(event) =>
                      setSnapToCommon(event.target.checked)
                    }
                  />
                  <span>Snap to nearest common angle</span>
                </label>
              </div>
            </div>
            <div className="space-y-1 text-right text-xs text-slate-600">
              <p>
                θ ≈{" "}
                <span className="font-semibold">
                  {formatDecimal(normalizedDegrees, 2)}°
                </span>
              </p>
              <p>
                θ ≈{" "}
                <span className="font-semibold">
                  {formatDecimal(angleRadians, 4)} rad
                </span>{" "}
                ({formatRadiansAsPi(angleRadians)})
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xs">
              <svg
                viewBox="0 0 200 200"
                className="h-auto w-full touch-none"
                onPointerDown={handleSvgPointerDown}
                onPointerMove={handleSvgPointerMove}
                onPointerUp={handleSvgPointerUp}
                onPointerLeave={handleSvgPointerUp}
              >
                <defs>
                  <linearGradient
                    id="unitCircleBg"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="100%" stopColor="#cbd5f5" />
                  </linearGradient>
                </defs>
                <rect
                  x={0}
                  y={0}
                  width={200}
                  height={200}
                  fill="url(#unitCircleBg)"
                  rx={16}
                />
                <line
                  x1={xAxisStart}
                  y1={center}
                  x2={xAxisEnd}
                  y2={center}
                  stroke="#9ca3af"
                  strokeWidth={1}
                />
                <line
                  x1={center}
                  y1={yAxisStart}
                  x2={center}
                  y2={yAxisEnd}
                  stroke="#9ca3af"
                  strokeWidth={1}
                />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth={1.2}
                />
                <circle
                  cx={center + radius}
                  cy={center}
                  r={2}
                  fill="#6b7280"
                />
                <circle
                  cx={center}
                  cy={center - radius}
                  r={2}
                  fill="#6b7280"
                />
                {Math.abs(cosValue) > 0 && (
                  <line
                    x1={pointX}
                    y1={pointY}
                    x2={pointX}
                    y2={center}
                    stroke="#a5b4fc"
                    strokeWidth={1.5}
                  />
                )}
                <line
                  x1={center}
                  y1={center}
                  x2={pointX}
                  y2={pointY}
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
                <path
                  d={(() => {
                    const angleSmall =
                      normalizedDegrees > 0 && normalizedDegrees <= 360
                        ? normalizedDegrees
                        : 0;
                    const arcRadius = 20;
                    const startAngleRad = 0;
                    const endAngleRad =
                      (Math.min(angleSmall, 90) * Math.PI) / 180;
                    const startX =
                      center +
                      arcRadius * Math.cos(startAngleRad);
                    const startY =
                      center -
                      arcRadius * Math.sin(startAngleRad);
                    const endX =
                      center + arcRadius * Math.cos(endAngleRad);
                    const endY =
                      center - arcRadius * Math.sin(endAngleRad);
                    const largeArcFlag =
                      angleSmall > 180 ? 1 : 0;
                    return `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
                  })()}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={1.5}
                />
                <circle
                  cx={pointX}
                  cy={pointY}
                  r={5}
                  fill="#22c55e"
                  stroke="#064e3b"
                  strokeWidth={1.2}
                />
                <text
                  x={center + radius + 6}
                  y={center - 4}
                  fontSize={9}
                  fill="#4b5563"
                >
                  +x (cos θ)
                </text>
                <text
                  x={center + 4}
                  y={center - radius - 6}
                  fontSize={9}
                  fill="#4b5563"
                >
                  +y (sin θ)
                </text>
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            {referenceAngles.map((degrees) => {
              const isActive =
                activeReference != null &&
                degrees === activeReference;
              return (
                <button
                  key={degrees}
                  type="button"
                  onClick={() => {
                    setAngleDegrees(degrees);
                    setAngleInputText(
                      angleInputMode === "degrees"
                        ? formatDecimal(degrees, 2)
                        : formatDecimal(
                            degreesToRadians(degrees),
                            4
                          )
                    );
                  }}
                  className={`rounded-full px-2 py-1 shadow-sm ${
                    isActive
                      ? "bg-indigo-500 text-slate-50"
                      : "border border-slate-300 bg-slate-50 text-slate-800 hover:border-indigo-400"
                  }`}
                >
                  {degrees}°
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Angle and coordinates
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Angle</p>
                <p className="font-mono text-slate-900">
                  {formatDecimal(normalizedDegrees, 2)}°
                </p>
                <p className="font-mono text-slate-900">
                  {formatDecimal(angleRadians, 4)} rad
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  {formatRadiansAsPi(angleRadians)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">
                  Coordinates (cos θ, sin θ)
                </p>
                <p className="font-mono text-slate-900">
                  ({formatDecimal(cosValue, 4)},{" "}
                  {formatDecimal(sinValue, 4)})
                </p>
                {exactValues && (
                  <p className="mt-1 text-[11px] text-slate-700">
                    Exact: ({exactValues.cosExact},{" "}
                    {exactValues.sinExact})
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Trig function values
            </h2>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3 sm:text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">sin θ</p>
                <p className="font-mono text-slate-900">
                  {formatDecimal(sinValue, 4)}
                </p>
                {exactValues && (
                  <p className="mt-1 text-[11px] text-slate-700">
                    Exact: {exactValues.sinExact}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">cos θ</p>
                <p className="font-mono text-slate-900">
                  {formatDecimal(cosValue, 4)}
                </p>
                {exactValues && (
                  <p className="mt-1 text-[11px] text-slate-700">
                    Exact: {exactValues.cosExact}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">tan θ</p>
                <p className="font-mono text-slate-900">
                  {Number.isNaN(tanRaw)
                    ? "undefined"
                    : formatDecimal(tanRaw, 4)}
                </p>
                {exactValues && (
                  <p className="mt-1 text-[11px] text-slate-700">
                    Exact:{" "}
                    {exactValues.tanDefined
                      ? exactValues.tanExact
                      : "undefined"}
                  </p>
                )}
              </div>
            </div>
            {Number.isNaN(tanRaw) && (
              <p className="text-[11px] text-amber-700">
                Tangent is undefined when cos θ = 0 (odd multiples of 90°).
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-900 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Common unit circle angles and exact trig values
        </h2>
        <div className="max-h-80 overflow-x-auto overflow-y-auto rounded-md border border-slate-200 bg-slate-50">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
            <thead className="sticky top-0 bg-slate-100 text-[11px]">
              <tr>
                <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">
                  Angle (°)
                </th>
                <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">
                  Angle (radians)
                </th>
                <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">
                  (cos θ, sin θ)
                </th>
                <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">
                  tan θ
                </th>
              </tr>
            </thead>
            <tbody>
              {UNIT_CIRCLE_REFERENCE.map((row) => (
                <tr
                  key={row.degrees}
                  className="odd:bg-white even:bg-slate-50"
                >
                  <td className="border-b border-slate-200 px-2 py-1">
                    {row.degrees}°
                  </td>
                  <td className="border-b border-slate-200 px-2 py-1">
                    {row.radiansLabel}
                  </td>
                  <td className="border-b border-slate-200 px-2 py-1">
                    ({row.cosExact}, {row.sinExact})
                  </td>
                  <td className="border-b border-slate-200 px-2 py-1">
                    {row.tanDefined ? row.tanExact : "undefined"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UnitCircleExplorer;


