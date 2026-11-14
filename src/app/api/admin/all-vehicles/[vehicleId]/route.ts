import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdminViewer } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    const guard = await requireAdminViewer();
    if (guard.error) return guard.error;

    const query = `
      SELECT 
        v.*,
        b.id AS branch_id,
        b.name AS branch_name,
        b.city AS branch_city
      FROM cars v
      JOIN branches b ON v.branch_id = b.id
      WHERE v.id = $1
    `;

    const { rows } = await pool.query(query, [vehicleId]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
