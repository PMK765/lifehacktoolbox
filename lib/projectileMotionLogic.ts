export type UnitSystem = "metric" | "imperial";

export type GravityPresetId = "earth" | "moon" | "mars" | "custom";

export type GravityPreset = {
  id: GravityPresetId;
  name: string;
  g_m_s2: number;
};

export const GRAVITY_PRESETS: GravityPreset[] = [
  { id: "earth", name: "Earth", g_m_s2: 9.80665 },
  { id: "moon", name: "Moon", g_m_s2: 1.62 },
  { id: "mars", name: "Mars", g_m_s2: 3.711 },
  { id: "custom", name: "Custom", g_m_s2: 9.80665 }
];

export type ProjectileInputs = {
  unitSystem: UnitSystem;
  speed: number;
  angleDeg: number;
  initialHeight: number;
  gravityPreset: GravityPresetId;
  customGravity: number;
  airResistanceEnabled: boolean;
  airResistanceStrength: number;
};

export type SamplePoint = {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
};

export type ProjectileOutputs = {
  timeOfFlight: number;
  range: number;
  maxHeight: number;
  impactSpeed: number;
  impactVx: number;
  impactVy: number;
  points: SamplePoint[];
};

export type ComputeResult =
  | { ok: true; inputs: ProjectileInputs; outputs: ProjectileOutputs }
  | { ok: false; message: string };

export const clampNumber = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const mpsFromInput = (value: number, unitSystem: UnitSystem): number =>
  unitSystem === "imperial" ? value * 0.3048 : value;

export const metersFromInput = (value: number, unitSystem: UnitSystem): number =>
  unitSystem === "imperial" ? value * 0.3048 : value;

export const speedToOutput = (mps: number, unitSystem: UnitSystem): number =>
  unitSystem === "imperial" ? mps / 0.3048 : mps;

export const lengthToOutput = (meters: number, unitSystem: UnitSystem): number =>
  unitSystem === "imperial" ? meters / 0.3048 : meters;

export const gravityToOutput = (g_m_s2: number, unitSystem: UnitSystem): number =>
  unitSystem === "imperial" ? g_m_s2 / 0.3048 : g_m_s2;

const radians = (deg: number): number => (deg * Math.PI) / 180;

const getGravity = (inputs: ProjectileInputs): number => {
  if (inputs.gravityPreset !== "custom") {
    const preset = GRAVITY_PRESETS.find((p) => p.id === inputs.gravityPreset);
    return preset ? preset.g_m_s2 : 9.80665;
  }
  return clampNumber(inputs.customGravity, 0.1, 50);
};

const solveTimeToImpactNoDrag = (vy0: number, y0: number, g: number): number => {
  const disc = vy0 * vy0 + 2 * g * y0;
  const sqrt = disc >= 0 ? Math.sqrt(disc) : 0;
  const t = (vy0 + sqrt) / g;
  return t > 0 ? t : 0;
};

const computeNoDrag = (inputs: ProjectileInputs): ProjectileOutputs => {
  const g = getGravity(inputs);
  const v0 = clampNumber(mpsFromInput(inputs.speed, inputs.unitSystem), 0, 2000);
  const angle = clampNumber(inputs.angleDeg, -89.9, 89.9);
  const y0 = clampNumber(metersFromInput(inputs.initialHeight, inputs.unitSystem), 0, 100000);
  const theta = radians(angle);
  const vx0 = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);
  const tFlight = solveTimeToImpactNoDrag(vy0, y0, g);
  const range = vx0 * tFlight;
  const maxHeight = y0 + (vy0 * vy0) / (2 * g);
  const vyImpact = vy0 - g * tFlight;
  const impactSpeed = Math.sqrt(vx0 * vx0 + vyImpact * vyImpact);

  const pointCount = 320;
  const points: SamplePoint[] = [];
  for (let i = 0; i <= pointCount; i += 1) {
    const t = (i / pointCount) * tFlight;
    const x = vx0 * t;
    const y = y0 + vy0 * t - 0.5 * g * t * t;
    const vx = vx0;
    const vy = vy0 - g * t;
    points.push({ t, x, y: Math.max(0, y), vx, vy, speed: Math.sqrt(vx * vx + vy * vy) });
  }

  return {
    timeOfFlight: tFlight,
    range,
    maxHeight: Math.max(maxHeight, y0),
    impactSpeed,
    impactVx: vx0,
    impactVy: vyImpact,
    points
  };
};

const computeWithLinearDrag = (inputs: ProjectileInputs): ProjectileOutputs => {
  const g = getGravity(inputs);
  const v0 = clampNumber(mpsFromInput(inputs.speed, inputs.unitSystem), 0, 2000);
  const angle = clampNumber(inputs.angleDeg, -89.9, 89.9);
  const y0 = clampNumber(metersFromInput(inputs.initialHeight, inputs.unitSystem), 0, 100000);
  const theta = radians(angle);
  let x = 0;
  let y = y0;
  let vx = v0 * Math.cos(theta);
  let vy = v0 * Math.sin(theta);

  const k = clampNumber(inputs.airResistanceStrength, 0, 10);
  const dt = 1 / 240;
  const maxSeconds = 1200;

  const points: SamplePoint[] = [];
  let t = 0;
  points.push({ t, x, y, vx, vy, speed: Math.sqrt(vx * vx + vy * vy) });

  const step = () => {
    const ax = -k * vx;
    const ay = -g - k * vy;
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
  };

  while (t < maxSeconds && y > 0) {
    step();
    if (points.length < 2400) {
      const sp = Math.sqrt(vx * vx + vy * vy);
      points.push({ t, x, y, vx, vy, speed: sp });
    } else {
      if (Math.floor(t * 120) !== Math.floor((t - dt) * 120)) {
        const sp = Math.sqrt(vx * vx + vy * vy);
        points.push({ t, x, y, vx, vy, speed: sp });
      }
    }
  }

  const timeOfFlight = t;
  const range = x;
  const maxHeight = Math.max(...points.map((p) => p.y), y0);
  const impactVx = vx;
  const impactVy = vy;
  const impactSpeed = Math.sqrt(vx * vx + vy * vy);

  if (points.length > 0) {
    const last = points[points.length - 1];
    if (last.y < 0) {
      last.y = 0;
    }
  }

  return {
    timeOfFlight,
    range,
    maxHeight,
    impactSpeed,
    impactVx,
    impactVy,
    points
  };
};

export const computeProjectile = (inputs: ProjectileInputs): ComputeResult => {
  const speed = Number(inputs.speed);
  const angle = Number(inputs.angleDeg);
  const initialHeight = Number(inputs.initialHeight);
  if (!Number.isFinite(speed) || speed <= 0) {
    return { ok: false, message: "Launch speed must be a positive number." };
  }
  if (!Number.isFinite(angle)) {
    return { ok: false, message: "Angle must be a number." };
  }
  if (!Number.isFinite(initialHeight) || initialHeight < 0) {
    return { ok: false, message: "Initial height must be zero or positive." };
  }

  const g = getGravity(inputs);
  if (!Number.isFinite(g) || g <= 0) {
    return { ok: false, message: "Gravity must be positive." };
  }

  const outputs = inputs.airResistanceEnabled
    ? computeWithLinearDrag(inputs)
    : computeNoDrag(inputs);

  if (!Number.isFinite(outputs.timeOfFlight) || outputs.timeOfFlight <= 0) {
    return { ok: false, message: "Could not compute a valid flight time. Try different inputs." };
  }

  return { ok: true, inputs, outputs };
};

export const pointsToCsv = (points: SamplePoint[], unitSystem: UnitSystem): string => {
  const speedUnit = unitSystem === "imperial" ? "ft/s" : "m/s";
  const lengthUnit = unitSystem === "imperial" ? "ft" : "m";
  const lines: string[] = [
    `t_s,x_${lengthUnit},y_${lengthUnit},vx_${speedUnit},vy_${speedUnit},speed_${speedUnit}`
  ];
  points.forEach((p) => {
    const x = lengthToOutput(p.x, unitSystem);
    const y = lengthToOutput(p.y, unitSystem);
    const vx = speedToOutput(p.vx, unitSystem);
    const vy = speedToOutput(p.vy, unitSystem);
    const sp = speedToOutput(p.speed, unitSystem);
    lines.push(`${p.t},${x},${y},${vx},${vy},${sp}`);
  });
  return lines.join("\n");
};


