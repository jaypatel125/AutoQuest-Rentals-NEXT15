// Browser-side data helpers shared by several pages.
import { Branches, Cars } from "@/lib/database/table-types";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return response.json();
}

export function fetchCarBrands() {
  return getJson<string[]>("/api/vehicles/get-brands");
}

export function fetchCarBodyTypes() {
  return getJson<string[]>("/api/vehicles/get-body-types");
}

export function fetchBranches() {
  return getJson<Branches[]>("/api/branch");
}

export type FeaturedCar = Cars & {
  branch_city: string | null;
  branch_name: string | null;
};

export function fetchFeaturedCars() {
  return getJson<FeaturedCar[]>("/api/vehicles/featured");
}

export interface FleetStats {
  vehicles: number;
  electric: number;
  low_emission: number;
  brands: number;
  branches: number;
  cities: number;
}

export function fetchFleetStats() {
  return getJson<FleetStats>("/api/stats");
}

export interface RewardsSummary {
  balance: number;
  lifetimeEarned: number;
  totalRedeemed: number;
  co2SavedKg: number;
  greenTrips: number;
  trips: number;
  history: {
    id: string;
    points: number;
    type: "Earned" | "Redeemed" | "Adjusted";
    createdAt: string;
    bookingId: string | null;
    vehicle: string | null;
    electric: boolean;
  }[];
}

export function fetchRewards() {
  return getJson<RewardsSummary>("/api/rewards");
}
