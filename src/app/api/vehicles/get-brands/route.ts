import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT brand
      FROM cars
      WHERE brand IS NOT NULL
      ORDER BY brand ASC
    `);

    const brands: string[] = result.rows.map((row) => row.brand);

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching car brands:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch car brands" },
      { status: 500 }
    );
  }
}
