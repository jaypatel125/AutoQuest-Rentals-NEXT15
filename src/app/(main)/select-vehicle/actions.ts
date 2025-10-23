"use server";

import { Cars as CarType } from "@/lib/database/table-types";

export async function fetchCars(
  city?: string,
  startDate?: Date,
  endDate?: Date
): Promise<CarType[]> {
  const payload = {
    city,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cars");
  }

  return res.json();
}
