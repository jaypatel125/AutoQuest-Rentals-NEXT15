export interface NewBranchInput {
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

export async function addBranch(data: NewBranchInput) {
  try {
    const res = await fetch(`/api/admin/add-branch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const field = body?.fields
        ? (Object.values(body.fields).flat()[0] as string)
        : null;
      throw new Error(field || body?.error || "Failed to add branch");
    }
    return body;
  } catch (error) {
    console.error("Error adding branch:", error);
    throw error;
  }
}
