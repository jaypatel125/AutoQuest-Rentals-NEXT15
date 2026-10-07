import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { isInvalidInput } from "@/lib/bookings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }
    const result = await pool.query(
      `SELECT c.*,
              br.name AS branch_name, br.address AS branch_address,
              br.city AS branch_city, br.province AS branch_province,
              br.postal_code AS branch_postal_code
       FROM cars c
       LEFT JOIN branches br ON br.id = c.branch_id
       WHERE c.id = $1`,
      [vehicleId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}
