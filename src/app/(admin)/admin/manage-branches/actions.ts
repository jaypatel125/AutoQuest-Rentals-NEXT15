export type Branches = {
  id: string;
  name: string;
  address: string;
  city: string;
  vehicle_count: number;
};

export async function fetchAllBranches(): Promise<Branches[]> {
  const response = await fetch(`/api/admin/all-branches`);
  if (!response.ok) {
    throw new Error("Failed to fetch cities");
  }
  return response.json();
}
