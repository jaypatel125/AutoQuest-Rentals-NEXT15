import type {
  body_type,
  fuel_type,
  transmission_type,
} from "@/lib/database/table-types";

export const BODY_TYPES: body_type[] = [
  "Sedan",
  "Suv",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Truck",
  "Van",
];
export const FUEL_TYPES: fuel_type[] = [
  "Electric",
  "Hybrid",
  "Petrol",
  "Diesel",
];
export const TRANSMISSIONS: transmission_type[] = ["Automatic", "Manual"];
export const SEAT_OPTIONS = [2, 4, 5, 6, 7, 8] as const;

/** Human label for the stored body type enum ("Suv" reads better as "SUV"). */
export function bodyTypeLabel(type?: string | null) {
  if (!type) return "Vehicle";
  return type.toLowerCase() === "suv" ? "SUV" : type;
}
