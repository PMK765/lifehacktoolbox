export type Sex = "male" | "female" | "other";

export type CountryCode =
  | "US"
  | "CA"
  | "UK"
  | "AU"
  | "EU"
  | "WORLD";

export type BaselineLifeTableEntry = {
  country: CountryCode;
  sex: Sex;
  lifeExpectancyAtBirth: number;
};

export const MIN_AGE_YEARS = 18;
export const MAX_AGE_YEARS = 100;

const BASELINE_TABLE: BaselineLifeTableEntry[] = [
  { country: "US", sex: "male", lifeExpectancyAtBirth: 76.0 },
  { country: "US", sex: "female", lifeExpectancyAtBirth: 81.0 },
  { country: "US", sex: "other", lifeExpectancyAtBirth: 78.0 },
  { country: "CA", sex: "male", lifeExpectancyAtBirth: 80.0 },
  { country: "CA", sex: "female", lifeExpectancyAtBirth: 84.0 },
  { country: "CA", sex: "other", lifeExpectancyAtBirth: 82.0 },
  { country: "UK", sex: "male", lifeExpectancyAtBirth: 79.0 },
  { country: "UK", sex: "female", lifeExpectancyAtBirth: 83.0 },
  { country: "UK", sex: "other", lifeExpectancyAtBirth: 81.0 },
  { country: "AU", sex: "male", lifeExpectancyAtBirth: 81.0 },
  { country: "AU", sex: "female", lifeExpectancyAtBirth: 85.0 },
  { country: "AU", sex: "other", lifeExpectancyAtBirth: 83.0 },
  { country: "EU", sex: "male", lifeExpectancyAtBirth: 78.5 },
  { country: "EU", sex: "female", lifeExpectancyAtBirth: 83.5 },
  { country: "EU", sex: "other", lifeExpectancyAtBirth: 81.0 },
  { country: "WORLD", sex: "male", lifeExpectancyAtBirth: 71.5 },
  { country: "WORLD", sex: "female", lifeExpectancyAtBirth: 76.0 },
  { country: "WORLD", sex: "other", lifeExpectancyAtBirth: 73.8 }
];

const getBaselineEntry = (
  sex: Sex,
  country: CountryCode
): BaselineLifeTableEntry => {
  const entry =
    BASELINE_TABLE.find(
      (candidate) =>
        candidate.sex === sex &&
        candidate.country === country
    ) ??
    BASELINE_TABLE.find(
      (candidate) =>
        candidate.sex === "other" &&
        candidate.country === "WORLD"
    );
  return (
    entry ?? {
      country: "WORLD",
      sex: "other",
      lifeExpectancyAtBirth: 74
    }
  );
};

const clampAge = (age: number): number => {
  if (!Number.isFinite(age)) {
    return MIN_AGE_YEARS;
  }
  if (age < MIN_AGE_YEARS) {
    return MIN_AGE_YEARS;
  }
  if (age > MAX_AGE_YEARS) {
    return MAX_AGE_YEARS;
  }
  return Math.floor(age);
};

export const estimateRemainingYearsBaseline = (
  ageInput: number,
  sex: Sex,
  country: CountryCode
): number => {
  const age = clampAge(ageInput);
  const baseline = getBaselineEntry(sex, country);
  const simpleGap =
    baseline.lifeExpectancyAtBirth - age;
  const baseRemaining =
    simpleGap > 0 ? simpleGap : 5;
  const survivalBonusFactor =
    age < 40
      ? 1.08
      : age < 60
      ? 1.15
      : age < 80
      ? 1.25
      : 1.3;
  const rawRemaining =
    baseRemaining * survivalBonusFactor;
  const maxAllowed = Math.max(
    5,
    105 - age
  );
  const clamped = Math.min(
    maxAllowed,
    Math.max(2, rawRemaining)
  );
  return clamped;
};

export type LifestyleProfile = {
  smoking: "never" | "former" | "light" | "heavy";
  exercise: "sedentary" | "light" | "moderate" | "high";
  bmiBand: "underweight" | "normal" | "overweight" | "obese";
  alcohol: "none" | "moderate" | "heavy";
  stress: "low" | "medium" | "high";
};

export const adjustRemainingYearsForLifestyle = (
  baselineRemaining: number,
  profile: LifestyleProfile,
  ageInput: number
): {
  adjustedRemaining: number;
  deltaYears: number;
} => {
  const age = clampAge(ageInput);
  let delta = 0;
  if (profile.smoking === "former") {
    delta -= 1.0;
  } else if (profile.smoking === "light") {
    delta -= 2.5;
  } else if (profile.smoking === "heavy") {
    delta -= 7.0;
  }
  if (profile.exercise === "sedentary") {
    delta -= 3.0;
  } else if (profile.exercise === "moderate") {
    delta += 2.0;
  } else if (profile.exercise === "high") {
    delta += 3.5;
  }
  if (profile.bmiBand === "underweight") {
    delta -= 2.0;
  } else if (profile.bmiBand === "overweight") {
    delta -= 1.5;
  } else if (profile.bmiBand === "obese") {
    delta -= 4.5;
  }
  if (profile.alcohol === "none") {
    delta += 0.5;
  } else if (profile.alcohol === "heavy") {
    delta -= 3.0;
  }
  if (profile.stress === "low") {
    delta += 1.5;
  } else if (profile.stress === "high") {
    delta -= 3.0;
  }
  const minRemaining = 2;
  const maxRemaining = Math.max(
    5,
    105 - age
  );
  const adjustedRaw =
    baselineRemaining + delta;
  const adjusted = Math.min(
    maxRemaining,
    Math.max(minRemaining, adjustedRaw)
  );
  return {
    adjustedRemaining: adjusted,
    deltaYears: adjusted - baselineRemaining
  };
};

export type SurvivalPoint = {
  age: number;
  survivalProbability: number;
};

export const buildSurvivalCurve = (
  currentAgeInput: number,
  expectedLifeAge: number,
  range: { low: number; high: number }
): SurvivalPoint[] => {
  const currentAge = clampAge(currentAgeInput);
  const lowAge = Math.max(
    currentAge + 2,
    Math.min(range.low, 98)
  );
  const highAge = Math.max(
    lowAge + 4,
    Math.min(range.high, 102)
  );
  const maxAge = Math.max(
    highAge + 5,
    Math.floor(expectedLifeAge) + 10,
    currentAge + 25,
    100
  );
  const points: SurvivalPoint[] = [];
  let previousProbability = 1;
  for (
    let age = currentAge;
    age <= maxAge;
    age += 1
  ) {
    let probability = 1;
    if (age <= lowAge) {
      const fraction =
        (age - currentAge) /
        Math.max(1, lowAge - currentAge);
      probability = 1 - 0.05 * fraction;
    } else if (age <= highAge) {
      const fraction =
        (age - lowAge) /
        Math.max(1, highAge - lowAge);
      probability = 0.95 - 0.75 * fraction;
    } else {
      const tailFraction =
        (age - highAge) /
        Math.max(5, maxAge - highAge);
      const tail =
        0.2 * (1 - tailFraction) * (1 - tailFraction);
      probability = tail;
    }
    if (probability > previousProbability) {
      probability = previousProbability;
    }
    if (probability < 0) {
      probability = 0;
    }
    if (probability > 1) {
      probability = 1;
    }
    previousProbability = probability;
    points.push({
      age,
      survivalProbability: probability
    });
  }
  return points;
};

export const probabilityOfReachingAge = (
  targetAgeInput: number,
  survivalCurve: SurvivalPoint[]
): number => {
  if (survivalCurve.length === 0) {
    return 0;
  }
  const targetAge = clampAge(targetAgeInput);
  const first = survivalCurve[0];
  if (targetAge <= first.age) {
    return 1;
  }
  let previous = first;
  for (let index = 1; index < survivalCurve.length; index += 1) {
    const point = survivalCurve[index];
    if (point.age === targetAge) {
      return point.survivalProbability;
    }
    if (point.age > targetAge) {
      const span = point.age - previous.age;
      if (span <= 0) {
        return point.survivalProbability;
      }
      const fraction =
        (targetAge - previous.age) / span;
      const interpolated =
        previous.survivalProbability +
        (point.survivalProbability -
          previous.survivalProbability) *
          fraction;
      if (!Number.isFinite(interpolated)) {
        return point.survivalProbability;
      }
      return Math.max(
        0,
        Math.min(1, interpolated)
      );
    }
    previous = point;
  }
  return survivalCurve[
    survivalCurve.length - 1
  ].survivalProbability;
};


