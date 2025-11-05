import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
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
