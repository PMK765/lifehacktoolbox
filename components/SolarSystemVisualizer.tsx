"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AU_IN_KM, PlanetInfo, PlanetId, planets, sun } from "@/data/solarSystem";

type LayoutBreakpoint = "desktop" | "mobile";

const TIME_PRESETS: { id: string; label: string; daysPerSecond: number }[] = [
  { id: "pause", label: "Pause", daysPerSecond: 0 },
  { id: "slow", label: "0.1× (0.1 day/s)", daysPerSecond: 0.1 },
  { id: "one", label: "1× (1 day/s)", daysPerSecond: 1 },
  { id: "ten", label: "10×", daysPerSecond: 10 },
  { id: "hundred", label: "100×", daysPerSecond: 100 }
];

const formatScientific = (value: number) => {
  if (value === 0) {
    return "0";
  }
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  return `${mantissa.toFixed(2)} × 10^${exponent}`;
};

const formatTemperatureC = (kelvin: number) => {
  const celsius = kelvin - 273.15;
  return `${Math.round(celsius)}`;
};

const SolarSystemVisualizer = () => {
  const [selectedId, setSelectedId] = useState<PlanetId>("earth");
  const [daysPerSecond, setDaysPerSecond] = useState<number>(10);
  const [zoom, setZoom] = useState(1);
  const [layout, setLayout] = useState<LayoutBreakpoint>("desktop");
  const [frame, setFrame] = useState(0);

  const simDaysRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      setLayout(media.matches ? "desktop" : "mobile");
    };
    handleChange();
    media.addEventListener("change", handleChange);
    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const step = (timestamp: number) => {
      if (cancelled) {
        return;
      }
      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      if (daysPerSecond > 0) {
        const deltaDays = (deltaMs / 1000) * daysPerSecond;
        simDaysRef.current += deltaDays;
        setFrame((previous) => previous + 1);
      }

      rafIdRef.ref = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [daysPerSecond]);

  const selectedPlanet: PlanetInfo | undefined = useMemo(
    () => planets.find((planet) => planet.id === selectedId),
    [selectedId]
  );

  const orbitScale = (au: number) => {
    const base = 120;
    const factor = 1.7;
    return base * Math.log(1 + au * factor);
  };

  const planetMarkerSize = (radiusKm: number) => {
    const scales: { maxRadius: number; size: number }[] = [
      { maxRadius: 4000, size: 8 },
      { maxRadius: 8000, size: 12 },
      { maxRadius: 20000, size: 16 },
      { maxRadius: 80000, size: 22 },
      { maxRadius: 800000, size: 28 }
    ];
    const found = scales.find((entry) => radiusKm <= entry.maxRadius);
    return (found ?? scales[scales.length - 1]).size;
  };

  const currentSimDays = simDaysRef.current;

  const planetsWithPosition = useMemo(
    () =>
      planets.map((planet) => {
        const angle =
          ((2 * Math.PI * currentSimDays) / planet.orbitalPeriodDays) %
          (2 * Math.PI);
        const r = orbitScale(planet.orbitalRadiusAu) * zoom;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        return {
          ...planet,
          angle,
          x,
          y,
          r,
          size: planetMarkerSize(planet.radiusKm)
        };
      }),
    [currentSimDays, zoom]
  );

  const currentSpeedLabel =
    TIME_PRESETS.find((preset) => preset.daysPerSecond === daysPerSecond)
      ?.label ?? `${daysPerSecond.toFixed(1)} days/s`;

  const distanceAu = selectedPlanet?.orbitalRadiusAu ?? 1;
  const distanceKm = distanceAu * AU_IN_KM;

  const simYearFactor = selectedPlanet
    ? selectedPlanet.orbitalPeriodDays / 365.25
    : 1;

  const containerBg =
    "bg-gradient-radial from-slate-900 via-slate-950 to-black";

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Time control
              </p>
              <p className="text-sm text-slate-200">
                Simulated rate:{" "}
                <span className="font-semibold">{currentSpeedLabel}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {TIME_PRESETS.map((preset) => {
                const isActive = daysPerSecond === preset.daysPerSecond;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDaysPerSecond(preset.daysPerSecond)}
                    className={`rounded-full px-3 py-1.5 shadow-sm ${
                      isActive
                        ? "bg-cyan-500 text-slate-950"
                        : "border border-slate-600 bg-slate-800/60 text-slate-200 hover:border-cyan-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="w-20 text-slate-300">Zoom</span>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(event) =>
                setZoom(Number.parseFloat(event.target.value) || 1)
              }
              className="w-full accent-cyan-400"
            />
            <span className="w-10 text-right text-slate-300">
              {zoom.toFixed(1)}×
            </span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300 lg:mt-0 lg:w-64">
          {planets.map((planet) => {
            const isSelected = planet.id === selectedId;
            return (
              <button
                key={planet.id}
                type="button"
                onClick={() => setSelectedId(planet.id)}
                className={`flex-1 rounded-full px-2.5 py-1.5 text-left shadow-sm ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950"
                    : "border border-slate-600 bg-slate-800/60 text-slate-100 hover:border-cyan-400"
                }`}
              >
                {planet.name}
              </button>
            );
          })}
        </div>
      </div>
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-radial from-slate-900 via-slate-950 to-black shadow-[0_0_40px_rgba(15,23,42,0.8)]`}
        style={{
          minHeight: layout === "desktop" ? 520 : 420
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.2),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.2),transparent_45%),radial-gradient(circle_at_60%_10%,rgba(129,140,248,0.16),transparent_40%)]" />
        <div className="relative grid h-full w-full gap-6 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="relative flex items-center justify-center">
            <div className="relative h-[360px] w-full max-w-[480px]">
              <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 shadow-[0_0_40px_rgba(251,191,36,0.8)]" />
              {planetsWithPosition.map((planet) => {
                const size = planet.size;
                const isSelected = planet.id === selectedId;
                const x = planet.x;
                const y = planet.y;
                const angleDeg = (planet.angle * 180) / Math.PI;
                const shadowAngle = angleDeg + 180;

                const orbitDiameter = planet.r * 2;

                return (
                  <div key={planet.id}>
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-slate-700/40"
                      style={{
                        width: `${orbitDiameter}px`,
                        height: `${orbitDiameter}px`,
                        marginLeft: -orbitDiameter / 2,
                        marginTop: -orbitDiameter / 2
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedId(planet.id)}
                      className={`absolute flex items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-cyan-300 shadow-[0_0_12px_rgba(45,212,191,0.9)]"
                          : "border-slate-700 shadow-[0_0_6px_rgba(148,163,184,0.4)]"
                      }`}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: "50%",
                        top: "50%",
                        transform: `translate(${x - size / 2}px, ${
                          y - size / 2
                        }px)`
                      }}
                      aria-label={planet.name}
                    >
                      <div
                        className="relative h-full w-full overflow-hidden rounded-full"
                        style={{
                          backgroundColor: planet.color
                        }}
                      >
                        {planet.textureImage && (
                          <img
                            src={planet.textureImage}
                            alt={planet.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <div
                          className="pointer-events-none absolute inset-0 rounded-full"
                          style={{
                            backgroundImage:
                              "linear-gradient(90deg, rgba(15,23,42,0.7), transparent 55%)",
                            transform: `rotate(${shadowAngle}deg)`
                          }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur" />
            <div className="relative flex h-full flex-col gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
              {selectedPlanet ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 rounded-full border border-slate-600 bg-slate-800/80 p-1">
                      <div className="h-full w-full overflow-hidden rounded-full">
                        {selectedPlanet.textureImage ? (
                          <img
                            src={selectedPlanet.textureImage}
                            alt={selectedPlanet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-full w-full rounded-full"
                            style={{ backgroundColor: selectedPlanet.color }}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-50">
                        {selectedPlanet.name}
                      </h3>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Orbit #{planets.findIndex(
                          (planet) => planet.id === selectedPlanet.id
                        ) + 1}{" "}
                        from the Sun
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-200">
                    {selectedPlanet.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Distance from Sun
                      </p>
                      <p className="mt-1 text-sm text-cyan-300">
                        {distanceAu.toFixed(2)} AU
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ≈ {Math.round(distanceKm / 1_000_000).toLocaleString()}{" "}
                        million km
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Radius
                      </p>
                      <p className="mt-1 text-sm text-slate-100">
                        {selectedPlanet.radiusKm.toLocaleString()} km
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Mass
                      </p>
                      <p className="mt-1 text-sm text-slate-100">
                        {formatScientific(selectedPlanet.massKg)} kg
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Year length
                      </p>
                      <p className="mt-1 text-sm text-slate-100">
                        {selectedPlanet.orbitalPeriodDays.toFixed(0)} days
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ≈ {simYearFactor.toFixed(2)} Earth years
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Day length
                      </p>
                      <p className="mt-1 text-sm text-slate-100">
                        {Math.abs(
                          selectedPlanet.rotationPeriodHours
                        ).toFixed(1)}{" "}
                        hours
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedPlanet.rotationPeriodHours < 0
                          ? "Retrograde rotation"
                          : "Prograde rotation"}
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Temperature
                      </p>
                      <p className="mt-1 text-sm text-slate-100">
                        {Math.round(
                          selectedPlanet.averageTempK
                        ).toLocaleString()}{" "}
                        K
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ≈ {formatTemperatureC(selectedPlanet.averageTempK)}°C
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Axial tilt
                      </p>
                      <p className="mt-1 text-sm text-slate-100">
                        {selectedPlanet.axialTiltDegrees.toFixed(1)}°
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Data is approximate and intended for visualization and
                    learning, not for precise navigation or scientific work.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-200">
                  Select a planet to see its details.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarSystemVisualizer;


