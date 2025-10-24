import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const query = `
      SELECT 
        c.id,
        c.brand,
        c.model,
        c.transmission,
        c.fuel_type,
        c.passenger_capacity,
        c.body_type,
        c.carbon_emissions,
        c.price_per_day,
        c.available,
        c.image,
        c.created_at,
        c.updated_at,
        c.branch_id,
        b.name AS branch_name,
        b.city AS branch_city
      FROM cars c
      LEFT JOIN branches b ON c.branch_id = b.id
      ORDER BY c.id ASC;
    `;

    const { rows } = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching vehicles with branch info:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
