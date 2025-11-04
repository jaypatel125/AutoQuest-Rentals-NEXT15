import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    const session = await getServerSideSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
