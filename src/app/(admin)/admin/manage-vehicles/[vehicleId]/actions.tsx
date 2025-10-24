"use server";

import { revalidatePath } from "next/cache";

export async function fetchVehicle(vehicleId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/all-vehicles/${vehicleId}`
    );
    if (!res.ok) throw new Error("Failed to fetch vehicle");
    return await res.json();
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateVehicle(vehicleId: string, data: any) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/all-vehicles/${vehicleId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) throw new Error("Failed to update vehicle");

    revalidatePath("/admin/manage-vehicles"); // revalidate listing page if needed

    return await res.json();
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
}
