"use server";
import { Cars as CarType } from "@/lib/database/table-types";
export async function fetchVehicle(id: string): Promise<CarType> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/vehicles/${id}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch vehicle details");
  }
  return res.json();
}
