import type { VehicleDetail } from "@/components/main/select-vehicle-details";

export async function fetchVehicle(id: string): Promise<VehicleDetail> {
  const res = await fetch(`/api/vehicles/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error("Failed to fetch vehicle details");
  }
  return res.json();
}
