"use client";

import type { HairColorId, HairColorProbability } from "../logic";

type ChartHairColorProps = {
  data: HairColorProbability[];
};

const hairLabel = (id: HairColorId): string => {
  if (id === "black") return "Black";
  if (id === "dark-brown") return "Dark brown";
  if (id === "light-brown") return "Light brown";
  if (id === "blonde") return "Blonde";
  return "Red";
};

const hairColor = (id: HairColorId): string => {
  if (id === "black") return "#020617";
  if (id === "dark-brown") return "#4b2e15";
  if (id === "light-brown") return "#9a6a3a";
  if (id === "blonde") return "#facc6b";
  return "#e11d48";
};

const ChartHairColor = (props: ChartHairColorProps) => {
  const { data } = props;
  const total = data.reduce(
    (accumulator, item) => accumulator + item.percentage,
    0
  );
  if (total <= 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex h-4 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-900 text-[10px]">
        {data.map((entry) => {
          const widthPercent =
            (entry.percentage / total) * 100;
          if (widthPercent < 1) {
            return null;
          }
          return (
            <div
              key={entry.color}
              className="h-full"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: hairColor(entry.color)
              }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-200 sm:grid-cols-3">
        {data
          .filter((entry) => entry.percentage > 3)
          .map((entry) => (
            <div
              key={entry.color}
              className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border border-slate-700"
                  style={{
                    backgroundColor: hairColor(
                      entry.color
                    )
                  }}
                />
                <span>{hairLabel(entry.color)}</span>
              </div>
              <span className="font-mono">
                {Math.round(entry.percentage)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChartHairColor;


