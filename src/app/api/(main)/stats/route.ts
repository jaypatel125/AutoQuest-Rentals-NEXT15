import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

/** Live fleet numbers for the home page (replaces hard-coded marketing stats). */
export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM cars WHERE available) AS vehicles,
        (SELECT COUNT(*)::int FROM cars WHERE available AND fuel_type = 'Electric') AS electric,
        (SELECT COUNT(*)::int FROM cars WHERE available AND fuel_type IN ('Electric', 'Hybrid')) AS low_emission,
        (SELECT COUNT(DISTINCT brand)::int FROM cars WHERE available) AS brands,
        (SELECT COUNT(*)::int FROM branches) AS branches,
        (SELECT COUNT(DISTINCT city)::int FROM branches WHERE city IS NOT NULL) AS cities
    `);
    return NextResponse.json(rows[0], {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
