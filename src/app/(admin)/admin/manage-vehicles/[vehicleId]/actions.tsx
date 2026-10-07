"use client";

import { Cars } from "@/lib/database/table-types";
import { compressImage } from "@/lib/compress-image";

export interface CarWithBranchDetails extends Cars {
  branch_name: string;
  branch_city: string;
  branch_id: string;
}

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  const field = data?.fields
    ? (Object.values(data.fields).flat()[0] as string)
    : null;
  return new Error(field || data?.error || fallback);
}

export async function fetchVehicle(
  vehicleId: string
): Promise<CarWithBranchDetails> {
  const res = await fetch(
    `/api/admin/all-vehicles/${encodeURIComponent(vehicleId)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw await readError(res, "Failed to fetch vehicle");
  return res.json();
}

export async function updateVehicle(
  vehicleId: string,
  data: Record<string, unknown>
) {
  const res = await fetch(
    `/api/admin/update-vehicle/${encodeURIComponent(vehicleId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw await readError(res, "Failed to update vehicle");
  return res.json();
}

/** Uploads a new photo for the vehicle (resized in the browser first). */
export async function replaceVehiclePhoto(
  vehicleId: string,
  file: File
): Promise<{ success: boolean; image: string }> {
  const form = new FormData();
  form.append("file", await compressImage(file));
  form.append("carId", vehicleId);

  const res = await fetch("/api/admin/update-image", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) throw await readError(res, "Failed to upload image");
  return res.json();
}
