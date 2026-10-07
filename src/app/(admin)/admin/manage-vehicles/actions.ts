import { Cars } from "@/lib/database/table-types";

export interface CarWithBranch extends Cars {
  branch_name: string | null;
  branch_city: string | null;
}

export async function fetchAllVehicles(): Promise<CarWithBranch[]> {
  try {
    const res = await fetch(`/api/admin/all-vehicles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch vehicles");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
}
