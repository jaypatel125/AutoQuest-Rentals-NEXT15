import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdminViewer } from "@/lib/api-auth";

export async function GET() {
  try {
    const guard = await requireAdminViewer();
    if (guard.error) return guard.error;

    const result = await pool.query(`
      SELECT 
        b.id,
        b.name,
        b.city,
        b.address,
        b.province,
        b.postal_code,
        COUNT(c.id)::int AS vehicle_count
      FROM branches b
      LEFT JOIN cars c ON c.branch_id = b.id
      WHERE b.city IS NOT NULL
      GROUP BY b.id, b.name, b.city, b.address
      ORDER BY b.city;
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching branches with vehicle counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches with vehicle counts" },
      { status: 500 }
    );
  }
}
