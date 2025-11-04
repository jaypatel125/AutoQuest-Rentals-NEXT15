export async function getBranchById(branchId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/all-branches/${branchId}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Failed to fetch branch");
    return await res.json();
  } catch (error) {
    console.error("Error fetching branch:", error);
    throw error;
  }
}

export async function updateBranch(
  branchId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Record<string, any>
) {
  try {
    if (!branchId) {
      throw new Error("branchId is required");
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/update-branch/${branchId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!res.ok) throw new Error("Failed to update branch");
    return await res.json();
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
}
