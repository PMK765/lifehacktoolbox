"use client";

import type { EyeColorProbability } from "../logic";

type ChartEyeColorProps = {
  data: EyeColorProbability[];
};

const colorForEye = (id: string): string => {
  if (id === "brown") return "#92400e";
  if (id === "hazel") return "#b45309";
  if (id === "green") return "#16a34a";
  if (id === "blue") return "#0ea5e9";
  return "#9ca3af";
};

const labelForEye = (id: string): string => {
  if (id === "brown") return "Brown";
  if (id === "hazel") return "Hazel";
  if (id === "green") return "Green";
  if (id === "blue") return "Blue";
  return "Gray";
};

const ChartEyeColor = (props: ChartEyeColorProps) => {
  const { data } = props;
  const filtered = data.filter(
    (item) => item.percentage > 0.5
  );
  const total = filtered.reduce(
    (accumulator, item) => accumulator + item.percentage,
    0
  );
  if (total <= 0) {
    return null;
  }
  const size = 180;
  const radius = 70;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
      aria-label="Eye color probability donut chart"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke="#1f2937"
        strokeWidth={strokeWidth}
      />
      {filtered.map((segment) => {
        const fraction =
          segment.percentage / total;
        const arcLength =
          circumference * fraction;
        const strokeDasharray = `${arcLength} ${
          circumference - arcLength
        }`;
        const strokeDashoffset = -cumulative;
        cumulative += arcLength;
        return (
          <circle
            key={segment.color}
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={colorForEye(segment.color)}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        );
      })}
      <text
        x={center}
        y={center - 8}
        textAnchor="middle"
        className="text-xs font-semibold fill-slate-50"
      >
        Most likely
      </text>
      <text
        x={center}
        y={center + 10}
        textAnchor="middle"
        className="text-base font-semibold fill-slate-50"
      >
        {labelForEye(
          filtered[0]?.color ?? ""
        )}
      </text>
    </svg>
  );
};

export default ChartEyeColor;


