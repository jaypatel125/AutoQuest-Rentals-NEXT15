import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { getServerSideSession } from "@/hooks/SessionHandler";

const vehicleSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  branch_id: z.string().optional(),
  price_per_day: z.number().optional(),
  available: z.boolean().optional(),
  carbon_emissions: z.number().optional(),
  body_type: z.string().optional(),
  passenger_capacity: z.number().optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  image: z.string().url().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    const session = await getServerSideSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query = `
      SELECT 
        v.*,
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    const body = await req.json();
    const parsed = vehicleSchema.safeParse(body);

    const session = await getServerSideSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Remove undefined fields (so only changed ones are updated)
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined
    );

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Build the dynamic SET clause
    const setClause = entries
      .map(([key], index) => `${key} = $${index + 1}`)
      .join(", ");

    const values = entries.map(([, value]) => value);

    const query = `
      UPDATE cars
      SET ${setClause}
      WHERE id = $${entries.length + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, [...values, vehicleId]);

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
