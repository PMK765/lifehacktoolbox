export type Sex = "boy" | "girl";

export type HeightPrediction = {
  meanCm: number;
  meanIn: number;
  rangeCm: { min: number; max: number };
  rangeIn: { min: number; max: number };
  distribution: {
    /** Height in centimeters at this sample point */
    heightCm: number;
    /** Height in inches at this sample point */
    heightIn: number;
    /** Probability for this height (0–1, sums to 1 across distribution) */
    probability: number;
  }[];
};

export type EyeColorId =
  | "brown"
  | "hazel"
  | "green"
  | "blue"
  | "gray";

export type EyeColorProbability = {
  color: EyeColorId;
  percentage: number;
};

export type HairParentType = "dark" | "light" | "red";

export type HairColorId =
  | "black"
  | "dark-brown"
  | "light-brown"
  | "blonde"
  | "red";

export type HairColorProbability = {
  color: HairColorId;
  percentage: number;
};

export type HeightUnit = "cm" | "imperial";

export const INCHES_PER_FOOT = 12;
export const CM_PER_INCH = 2.54;

export const convertFeetInchesToCm = (
  feet: number,
  inches: number
): number => {
  const totalInches = feet * INCHES_PER_FOOT + inches;
  if (!Number.isFinite(totalInches) || totalInches < 0) {
    return 0;
  }
  return totalInches * CM_PER_INCH;
};

export const convertCmToFeetInches = (cm: number): {
  feet: number;
  inches: number;
} => {
  if (!Number.isFinite(cm) || cm <= 0) {
    return { feet: 0, inches: 0 };
  }
  const totalInches = cm / CM_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = Math.round(totalInches - feet * INCHES_PER_FOOT);
  return { feet, inches };
};

export const predictChildHeight = (
  motherCm: number,
  fatherCm: number,
  sex: Sex
): HeightPrediction | null => {
  if (
    !Number.isFinite(motherCm) ||
    !Number.isFinite(fatherCm) ||
    motherCm <= 0 ||
    fatherCm <= 0
  ) {
    return null;
  }

  const m = motherCm;
  const f = fatherCm;

  const meanCm =
    sex === "boy"
      ? (m * (13 / 12) / 2 + f / 2)
      : (f * (12 / 13) / 2 + m / 2);

  const sdCm = 2 * CM_PER_INCH;
  const lowerCm = meanCm - 2 * sdCm;
  const upperCm = meanCm + 2 * sdCm;

  const meanIn = meanCm / CM_PER_INCH;
  const lowerIn = lowerCm / CM_PER_INCH;
  const upperIn = upperCm / CM_PER_INCH;

  const distribution: HeightPrediction["distribution"] = [];
  const stepCm = CM_PER_INCH;
  const startCm = meanCm - 4 * CM_PER_INCH;
  const endCm = meanCm + 4 * CM_PER_INCH;

  const values: { h: number; pdf: number }[] = [];
  for (let h = startCm; h <= endCm + 0.1; h += stepCm) {
    const z = (h - meanCm) / sdCm;
    const pdf = Math.exp(-0.5 * z * z);
    values.push({ h, pdf });
  }

  const totalPdf = values.reduce(
    (accumulator, item) => accumulator + item.pdf,
    0
  );

  for (const item of values) {
    const probability =
      totalPdf > 0 ? item.pdf / totalPdf : 0;
    distribution.push({
      heightCm: item.h,
      heightIn: item.h / CM_PER_INCH,
      probability
    });
  }

  return {
    meanCm,
    meanIn,
    rangeCm: { min: lowerCm, max: upperCm },
    rangeIn: { min: lowerIn, max: upperIn },
    distribution
  };
};

const eyeKey = (a: EyeColorId, b: EyeColorId): string =>
  [a, b].sort().join("_");

const EYE_COLOR_MAP: Record<string, EyeColorProbability[]> = {
  [eyeKey("brown", "brown")]: [
    { color: "brown", percentage: 75 },
    { color: "hazel", percentage: 18 },
    { color: "green", percentage: 3 },
    { color: "blue", percentage: 4 },
    { color: "gray", percentage: 0 }
  ],
  [eyeKey("brown", "blue")]: [
    { color: "brown", percentage: 50 },
    { color: "hazel", percentage: 10 },
    { color: "green", percentage: 5 },
    { color: "blue", percentage: 35 },
    { color: "gray", percentage: 0 }
  ],
  [eyeKey("brown", "green")]: [
    { color: "brown", percentage: 50 },
    { color: "hazel", percentage: 25 },
    { color: "green", percentage: 20 },
    { color: "blue", percentage: 4 },
    { color: "gray", percentage: 1 }
  ],
  [eyeKey("brown", "hazel")]: [
    { color: "brown", percentage: 60 },
    { color: "hazel", percentage: 30 },
    { color: "green", percentage: 5 },
    { color: "blue", percentage: 5 },
    { color: "gray", percentage: 0 }
  ],
  [eyeKey("blue", "blue")]: [
    { color: "blue", percentage: 90 },
    { color: "gray", percentage: 8 },
    { color: "green", percentage: 2 },
    { color: "hazel", percentage: 0 },
    { color: "brown", percentage: 0 }
  ],
  [eyeKey("green", "blue")]: [
    { color: "green", percentage: 45 },
    { color: "blue", percentage: 25 },
    { color: "hazel", percentage: 20 },
    { color: "gray", percentage: 5 },
    { color: "brown", percentage: 10 }
  ],
  [eyeKey("green", "green")]: [
    { color: "green", percentage: 75 },
    { color: "hazel", percentage: 15 },
    { color: "blue", percentage: 8 },
    { color: "brown", percentage: 2 },
    { color: "gray", percentage: 0 }
  ],
  [eyeKey("hazel", "hazel")]: [
    { color: "hazel", percentage: 60 },
    { color: "brown", percentage: 20 },
    { color: "green", percentage: 10 },
    { color: "blue", percentage: 8 },
    { color: "gray", percentage: 2 }
  ],
  [eyeKey("hazel", "blue")]: [
    { color: "blue", percentage: 45 },
    { color: "hazel", percentage: 30 },
    { color: "green", percentage: 15 },
    { color: "brown", percentage: 5 },
    { color: "gray", percentage: 5 }
  ],
  [eyeKey("hazel", "green")]: [
    { color: "green", percentage: 50 },
    { color: "hazel", percentage: 30 },
    { color: "brown", percentage: 10 },
    { color: "blue", percentage: 8 },
    { color: "gray", percentage: 2 }
  ],
  [eyeKey("gray", "gray")]: [
    { color: "gray", percentage: 80 },
    { color: "blue", percentage: 15 },
    { color: "green", percentage: 3 },
    { color: "hazel", percentage: 2 },
    { color: "brown", percentage: 0 }
  ],
  [eyeKey("gray", "blue")]: [
    { color: "blue", percentage: 60 },
    { color: "gray", percentage: 30 },
    { color: "green", percentage: 5 },
    { color: "hazel", percentage: 3 },
    { color: "brown", percentage: 2 }
  ],
  [eyeKey("gray", "brown")]: [
    { color: "brown", percentage: 60 },
    { color: "hazel", percentage: 20 },
    { color: "green", percentage: 10 },
    { color: "gray", percentage: 5 },
    { color: "blue", percentage: 5 }
  ],
  [eyeKey("gray", "green")]: [
    { color: "green", percentage: 45 },
    { color: "gray", percentage: 25 },
    { color: "blue", percentage: 15 },
    { color: "hazel", percentage: 10 },
    { color: "brown", percentage: 5 }
  ],
  [eyeKey("gray", "hazel")]: [
    { color: "hazel", percentage: 40 },
    { color: "gray", percentage: 25 },
    { color: "green", percentage: 20 },
    { color: "blue", percentage: 10 },
    { color: "brown", percentage: 5 }
  ]
};

export const predictEyeColor = (
  parent1: EyeColorId,
  parent2: EyeColorId
): EyeColorProbability[] => {
  const key = eyeKey(parent1, parent2);
  const base = EYE_COLOR_MAP[key];
  if (!base) {
    const equal = 100 / 5;
    return [
      { color: "brown", percentage: equal },
      { color: "hazel", percentage: equal },
      { color: "green", percentage: equal },
      { color: "blue", percentage: equal },
      { color: "gray", percentage: equal }
    ];
  }
  return base;
};

export const HAIR_PARENT_LABELS: { id: HairParentType; label: string }[] = [
  { id: "dark", label: "Dark (black / dark brown)" },
  { id: "light", label: "Light brown / blonde" },
  { id: "red", label: "Red hair or carrier" }
];

const hairKey = (a: HairParentType, b: HairParentType): string =>
  [a, b].sort().join("_");

const HAIR_COLOR_MAP: Record<
  string,
  HairColorProbability[]
> = {
  [hairKey("dark", "dark")]: [
    { color: "black", percentage: 40 },
    { color: "dark-brown", percentage: 30 },
    { color: "light-brown", percentage: 25 },
    { color: "blonde", percentage: 3 },
    { color: "red", percentage: 2 }
  ],
  [hairKey("dark", "light")]: [
    { color: "black", percentage: 20 },
    { color: "dark-brown", percentage: 20 },
    { color: "light-brown", percentage: 45 },
    { color: "blonde", percentage: 10 },
    { color: "red", percentage: 5 }
  ],
  [hairKey("light", "light")]: [
    { color: "black", percentage: 5 },
    { color: "dark-brown", percentage: 10 },
    { color: "light-brown", percentage: 45 },
    { color: "blonde", percentage: 35 },
    { color: "red", percentage: 5 }
  ],
  [hairKey("light", "dark")]: [
    { color: "black", percentage: 20 },
    { color: "dark-brown", percentage: 20 },
    { color: "light-brown", percentage: 45 },
    { color: "blonde", percentage: 10 },
    { color: "red", percentage: 5 }
  ],
  [hairKey("dark", "red")]: [
    { color: "black", percentage: 25 },
    { color: "dark-brown", percentage: 25 },
    { color: "light-brown", percentage: 25 },
    { color: "blonde", percentage: 10 },
    { color: "red", percentage: 15 }
  ],
  [hairKey("light", "red")]: [
    { color: "black", percentage: 5 },
    { color: "dark-brown", percentage: 15 },
    { color: "light-brown", percentage: 40 },
    { color: "blonde", percentage: 30 },
    { color: "red", percentage: 10 }
  ],
  [hairKey("red", "red")]: [
    { color: "black", percentage: 0 },
    { color: "dark-brown", percentage: 5 },
    { color: "light-brown", percentage: 15 },
    { color: "blonde", percentage: 20 },
    { color: "red", percentage: 60 }
  ]
};

export const predictHairColor = (
  parent1: HairParentType,
  parent2: HairParentType
): HairColorProbability[] => {
  const key = hairKey(parent1, parent2);
  const base = HAIR_COLOR_MAP[key];
  if (!base) {
    const equal = 100 / 5;
    return [
      { color: "black", percentage: equal },
      { color: "dark-brown", percentage: equal },
      { color: "light-brown", percentage: equal },
      { color: "blonde", percentage: equal },
      { color: "red", percentage: equal }
    ];
  }
  return base;
};


