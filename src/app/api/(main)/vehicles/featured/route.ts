import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

/** A short, varied list for the home page: one car per model, greenest first. */
export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM (
        SELECT DISTINCT ON (c.brand, c.model)
               c.*, br.city AS branch_city, br.name AS branch_name
        FROM cars c
        LEFT JOIN branches br ON br.id = c.branch_id
        WHERE c.available = TRUE
        ORDER BY c.brand, c.model, c.price_per_day ASC
      ) unique_models
      ORDER BY COALESCE(carbon_emissions, 999) ASC, price_per_day ASC
      LIMIT 8
    `);
    return NextResponse.json(rows, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching featured vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
