import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  deleteImageByUrl,
  ImageValidationError,
  saveImage,
} from "@/lib/images";
import { isInvalidInput } from "@/lib/bookings";

/** Replaces a vehicle's photo. Admin only. */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const carId = formData.get("carId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A file is required." },
        { status: 400 }
      );
    }
    if (typeof carId !== "string" || !carId) {
      return NextResponse.json(
        { error: "carId is required." },
        { status: 400 }
      );
    }

    const existing = await pool.query<{ image: string | null }>(
      `SELECT image FROM cars WHERE id = $1`,
      [carId]
    );
    if (!existing.rows.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const image = await saveImage(file);
    await pool.query(
      `UPDATE cars SET image = $1, updated_at = NOW() WHERE id = $2`,
      [image, carId]
    );
    // Old photo is no longer referenced; free the space.
    await deleteImageByUrl(existing.rows[0].image).catch((err) =>
      console.error("Could not delete previous image:", err)
    );

    return NextResponse.json({ success: true, image });
  } catch (error: unknown) {
    if (error instanceof ImageValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
