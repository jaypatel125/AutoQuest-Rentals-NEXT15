// Emission helpers behind the Green Score badge and the trip impact estimator.

/** Reference point for a typical gasoline car, in grams of CO2 per km. */
export const TYPICAL_CAR_G_PER_KM = 180;
export const DEFAULT_KM_PER_DAY = 80;
/** Rough yearly CO2 uptake of one mature tree, in kg. */
export const KG_CO2_PER_TREE_YEAR = 21;

export type GreenGrade = "A+" | "A" | "B" | "C" | "D" | "E";

export interface GreenScore {
  grade: GreenGrade;
  label: string;
  tone: "emerald" | "green" | "lime" | "amber" | "orange" | "red";
}

export function greenScore(
  gPerKm: number | string | null | undefined
): GreenScore {
  const g = Number(gPerKm ?? 0);
  if (g <= 0) return { grade: "A+", label: "Zero tailpipe", tone: "emerald" };
  if (g <= 100)
    return { grade: "A", label: "Very low emissions", tone: "green" };
  if (g <= 130) return { grade: "B", label: "Low emissions", tone: "lime" };
  if (g <= 170)
    return { grade: "C", label: "Average emissions", tone: "amber" };
  if (g <= 220) return { grade: "D", label: "High emissions", tone: "orange" };
  return { grade: "E", label: "Very high emissions", tone: "red" };
}

/** Estimated tailpipe CO2 for a trip, in kg. */
export function tripEmissionsKg(
  gPerKm: number | string,
  days: number,
  kmPerDay = DEFAULT_KM_PER_DAY
) {
  return (Number(gPerKm) * kmPerDay * days) / 1000;
}

/** CO2 avoided compared with a typical car for the same trip, in kg. */
export function tripSavingsKg(
  gPerKm: number | string,
  days: number,
  kmPerDay = DEFAULT_KM_PER_DAY
) {
  return Math.max(
    0,
    tripEmissionsKg(TYPICAL_CAR_G_PER_KM, days, kmPerDay) -
      tripEmissionsKg(gPerKm, days, kmPerDay)
  );
}
