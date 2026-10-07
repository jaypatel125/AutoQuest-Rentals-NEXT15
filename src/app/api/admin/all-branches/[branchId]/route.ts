import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { isInvalidInput } from "@/lib/bookings";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { branchId } = await params;

  try {
    const result = await pool.query("SELECT * FROM branches WHERE id = $1", [
      branchId,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    console.error("Error fetching branch:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { branchId } = await params;

  try {
    const existing = await pool.query(
      `SELECT b.id, COUNT(c.id)::int AS vehicle_count
       FROM branches b LEFT JOIN cars c ON c.branch_id = b.id
       WHERE b.id = $1
       GROUP BY b.id`,
      [branchId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    if (existing.rows[0].vehicle_count > 0) {
      return NextResponse.json(
        {
          error:
            "This branch still has vehicles. Move or remove them before deleting the branch.",
        },
        { status: 409 }
      );
    }

    await pool.query("DELETE FROM branches WHERE id = $1", [branchId]);

    return NextResponse.json(
      { message: "Branch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    console.error("Error deleting branch:", error);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}
