export async function fetchVehicle(id: string) {
  const res = await fetch(`/api/vehicles/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch vehicle details");
  }
  return res.json();
}
