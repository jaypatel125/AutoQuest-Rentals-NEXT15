export interface NewBranchInput {
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

export async function addBranch(data: NewBranchInput) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/add-branch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) throw new Error("Failed to add branch");
    return await res.json();
  } catch (error) {
    console.error("Error adding branch:", error);
    throw error;
  }
}
