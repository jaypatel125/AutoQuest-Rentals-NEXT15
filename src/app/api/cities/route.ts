import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT city 
      FROM branch 
      WHERE city IS NOT NULL 
      ORDER BY city
    `);

    const cities = result.rows.map((row) => row.city);
    return NextResponse.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
