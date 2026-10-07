import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { vehicleUpdateSchema } from "@/lib/zod";
import { isInvalidInput } from "@/lib/bookings";

// Column names come from this fixed list, never from the request body.
const UPDATABLE = [
  "brand",
  "model",
  "branch_id",
  "price_per_day",
  "available",
  "carbon_emissions",
  "body_type",
  "passenger_capacity",
  "fuel_type",
  "transmission",
  "image",
] as const;

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { vehicleId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = vehicleUpdateSchema.safeParse(body ?? {});

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid vehicle details",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data as Record<string, unknown>;
    const entries = UPDATABLE.filter((key) => data[key] !== undefined).map(
      (key) => [key, data[key]] as const
    );

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const setClause = entries
      .map(([key], index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = entries.map(([, value]) => value);

    const result = await pool.query(
      `UPDATE cars
       SET ${setClause}, updated_at = NOW()
       WHERE id = $${entries.length + 1}
       RETURNING *`,
      [...values, vehicleId]
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
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    if ((error as { code?: string })?.code === "23503") {
      return NextResponse.json({ error: "Branch not found" }, { status: 400 });
    }
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
