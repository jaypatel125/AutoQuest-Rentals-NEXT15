import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { branchUpdateSchema } from "@/lib/zod";
import { isInvalidInput } from "@/lib/bookings";

// Column names come from this fixed list, never from the request body.
const UPDATABLE = [
  "name",
  "address",
  "city",
  "province",
  "postal_code",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { branchId } = await params;
    const body = await request.json().catch(() => null);
    const parsed = branchUpdateSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid branch details",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data as Record<string, string | undefined>;
    const entries = UPDATABLE.filter((key) => data[key] !== undefined).map(
      (key) => [key, data[key]] as const
    );
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const setClauses = entries.map(([key], index) => `${key} = $${index + 1}`);
    const result = await pool.query(
      `UPDATE branches
       SET ${setClauses.join(", ")}, updated_at = NOW()
       WHERE id = $${entries.length + 1}
       RETURNING *`,
      [...entries.map(([, value]) => value), branchId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, branch: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 500 }
    );
  }
}
