import { CarWithBranchDetails } from "../manage-vehicles/[vehicleId]/actions";
import { CarsInput } from "@/components/admin/add-vehicle";

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
