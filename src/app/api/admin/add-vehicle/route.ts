import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { ImageValidationError, saveImage } from "@/lib/images";
import { vehicleSchema } from "@/lib/zod";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const formData = await request.formData();
    const parsed = vehicleSchema.safeParse({
      branch_id: formData.get("branch_id"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      transmission: formData.get("transmission"),
      fuel_type: formData.get("fuel_type"),
      passenger_capacity: formData.get("passenger_capacity"),
      body_type: formData.get("body_type"),
      carbon_emissions: formData.get("carbon_emissions"),
      price_per_day: formData.get("price_per_day"),
      available: formData.get("available") === "true",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid vehicle details",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const branch = await pool.query(`SELECT 1 FROM branches WHERE id = $1`, [
      data.branch_id,
    ]);
    if (!branch.rows.length) {
      return NextResponse.json({ error: "Branch not found" }, { status: 400 });
    }

    const file = formData.get("file");
    const image =
      file instanceof File && file.size > 0 ? await saveImage(file) : null;

    const { rows } = await pool.query(
      `INSERT INTO cars
        (branch_id, brand, model, transmission, fuel_type, passenger_capacity,
         body_type, carbon_emissions, price_per_day, available, image, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
       RETURNING *`,
      [
        data.branch_id,
        data.brand,
        data.model,
        data.transmission,
        data.fuel_type,
        data.passenger_capacity,
        data.body_type,
        data.carbon_emissions,
        data.price_per_day,
        data.available,
        image,
      ]
    );

    return NextResponse.json(
      { success: true, vehicle: rows[0] },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof ImageValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Error creating vehicle:", err);
    return NextResponse.json(
      { error: "Failed to create vehicle." },
      { status: 500 }
    );
  }
}
