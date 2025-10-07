import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT body_type
      FROM cars
      WHERE body_type IS NOT NULL
      ORDER BY body_type ASC
    `);

    const bodyTypes: string[] = result.rows.map((row) => row.body_type);

    return NextResponse.json(bodyTypes);
  } catch (error) {
    console.error("Error fetching car body type:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch car body type." },
      { status: 500 }
    );
  }
}
