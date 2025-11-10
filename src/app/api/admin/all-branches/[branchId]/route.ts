import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const session = await getServerSideSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
    console.error("Error fetching branch:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch" },
      { status: 500 }
    );
  }
}

// DELETE branch
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const session = await getServerSideSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { branchId } = await params;

  try {
    // Check if branch exists
    const existing = await pool.query("SELECT id FROM branches WHERE id = $1", [
      branchId,
    ]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    // Delete branch
    await pool.query("DELETE FROM branches WHERE id = $1", [branchId]);

    return NextResponse.json(
      { message: "Branch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting branch:", error);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}
