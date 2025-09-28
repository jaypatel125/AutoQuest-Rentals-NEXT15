import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * 
      FROM branches
      WHERE city IS NOT NULL 
      ORDER BY city
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
