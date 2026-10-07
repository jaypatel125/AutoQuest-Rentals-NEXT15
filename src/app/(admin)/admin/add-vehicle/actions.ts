import { compressImage } from "@/lib/compress-image";
import type { VehicleFormValues } from "@/components/admin/vehicle-form/VehicleForm";

export async function createVehicle(
  input: VehicleFormValues,
  file?: File | null
) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(input)) {
    formData.append(key, String(value));
  }
  if (file) formData.append("file", await compressImage(file));

  const res = await fetch("/api/admin/add-vehicle", {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const field = data?.fields
      ? (Object.values(data.fields).flat()[0] as string)
      : null;
    throw new Error(field || data?.error || "Failed to create vehicle");
  }

  return data.vehicle;
}
