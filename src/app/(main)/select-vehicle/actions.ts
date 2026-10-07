import type { CarListing } from "@/components/vehicles/VehicleCard";

/** Searches available vehicles. Dates are optional (browse mode). */
export async function fetchCars(
  city?: string,
  startDate?: Date,
  endDate?: Date
): Promise<CarListing[]> {
  const res = await fetch("/api/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      city: city || undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Failed to fetch cars");
  }

  return res.json();
}
