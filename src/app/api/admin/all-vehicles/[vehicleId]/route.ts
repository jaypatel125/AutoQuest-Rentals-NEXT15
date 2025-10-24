import { NextResponse } from "next/server";
import pool from "@/lib/db"; // adjust if your db file is elsewhere
import { z } from "zod";

// Zod schema for validating input
const vehicleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  branch_id: z.number(),
  price_per_day: z.number(),
  available: z.boolean(),
});

// GET — fetch a single vehicle by ID (with branch info)
export async function GET(
  _req: Request,
  { params }: { params: { vehicleId: string } }
) {
  try {
    const { vehicleId } = params;

    const query = `
      SELECT 
        v.id,
        v.brand,
        v.model,
        v.price_per_day,
        v.available,
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

// PUT — update a vehicle by ID
export async function PUT(
  req: Request,
  { params }: { params: { vehicleId: string } }
) {
  try {
    const { vehicleId } = params;
    const body = await req.json();
    const parsed = vehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { brand, model, branch_id, price_per_day, available } = parsed.data;

    const result = await pool.query(
      `
        UPDATE cars
        SET brand = $1,
            model = $2,
            branch_id = $3,
            price_per_day = $4,
            available = $5
        WHERE id = $6
        RETURNING *
      `,
      [brand, model, branch_id, price_per_day, available, vehicleId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
