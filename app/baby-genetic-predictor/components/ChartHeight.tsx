"use client";

import type { HeightPrediction, HeightUnit } from "../logic";
import { CM_PER_INCH, convertCmToFeetInches } from "../logic";

type ChartHeightProps = {
  prediction: HeightPrediction;
  unit: HeightUnit;
};

const formatHeightLabel = (heightCm: number, unit: HeightUnit): string => {
  if (unit === "cm") {
    return `${Math.round(heightCm)} cm`;
  }
  const { feet, inches } = convertCmToFeetInches(heightCm);
  return `${feet}′${inches}″`;
};

const ChartHeight = (props: ChartHeightProps) => {
  const { prediction, unit } = props;
  const bars = prediction.distribution;
  if (bars.length === 0) {
    return null;
  }
  const maxProbability = bars.reduce(
    (maximum, entry) =>
      entry.probability > maximum ? entry.probability : maximum,
    0
  );
  const width = 360;
  const barHeight = 18;
  const gap = 6;
  const marginLeft = 80;
  const marginRight = 10;
  const marginTop = 10;
  const marginBottom = 10;
  const innerWidth = width - marginLeft - marginRight;
  const height =
    marginTop +
    marginBottom +
    bars.length * (barHeight + gap) -
    gap;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Height probability distribution"
    >
      <defs>
        <linearGradient
          id="heightBar"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {bars.map((entry, index) => {
        const y =
          marginTop + index * (barHeight + gap);
        const normalized =
          maxProbability > 0
            ? entry.probability / maxProbability
            : 0;
        const barWidth = innerWidth * normalized;
        const percent = Math.round(
          entry.probability * 100
        );
        const label = formatHeightLabel(
          entry.heightCm,
          unit
        );
        return (
          <g key={entry.heightCm}>
            <text
              x={marginLeft - 4}
              y={y + barHeight / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={9}
              fill="#e5e7eb"
            >
              {label}
            </text>
            <rect
              x={marginLeft}
              y={y}
              width={Math.max(barWidth, 1)}
              height={barHeight}
              rx={4}
              fill="url(#heightBar)"
              opacity={0.9}
            />
            <text
              x={marginLeft + innerWidth + 2}
              y={y + barHeight / 2}
              fontSize={9}
              fill="#cbd5f5"
              dominantBaseline="central"
            >
              {percent}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default ChartHeight;


