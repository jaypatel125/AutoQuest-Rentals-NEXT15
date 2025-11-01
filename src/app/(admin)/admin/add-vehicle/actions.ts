import { CarWithBranchDetails } from "../manage-vehicles/[vehicleId]/actions";
import { CarsInput } from "./page";

export async function createVehicle(
  input: CarsInput
): Promise<CarWithBranchDetails> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(input)) {
    // Handle file separately
    if (key === "image" && value instanceof File) {
      formData.append("file", value);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formData.append(key, value as any);
    }
  }

  const res = await fetch("/api/admin/add-vehicle", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to create vehicle");
  }

  return data.vehicle;
}

/**
 * Updates an existing vehicle
 */
export async function updateVehicle(
  vehicleId: string,
  input: Omit<CarsInput, "image"> & { image_url: string }
) {
  const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to update vehicle");
  return data.vehicle;
}

/**
 * Replaces a vehicle photo
 */
export async function replaceVehiclePhoto(
  vehicleId: string,
  file: File,
  currentImageUrl: string
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("imageUrl", currentImageUrl);

  const res = await fetch(`/api/admin/vehicles/${vehicleId}/replace-photo`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.error || "Failed to replace vehicle photo");
  return data;
}
