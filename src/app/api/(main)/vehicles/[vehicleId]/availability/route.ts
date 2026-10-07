import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { hasConflict, isInvalidInput, parseRentalDates } from "@/lib/bookings";

export const dynamic = "force-dynamic";

/** GET ?start=ISO&end=ISO - is this vehicle free for the requested dates? */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params;
  const search = request.nextUrl.searchParams;
  const dates = parseRentalDates(search.get("start"), search.get("end"));
  if ("error" in dates) {
    return NextResponse.json(
      { available: false, reason: dates.error },
      { status: 400 }
    );
  }

  try {
    const car = await pool.query(`SELECT available FROM cars WHERE id = $1`, [
      vehicleId,
    ]);
    if (!car.rows.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    if (!car.rows[0].available) {
      return NextResponse.json({
        available: false,
        reason: "This vehicle is currently not available for rent.",
      });
    }
    const booked = await hasConflict(pool, vehicleId, dates.start, dates.end);
    return NextResponse.json({
      available: !booked,
      reason: booked ? "Already booked for some of these dates." : undefined,
    });
  } catch (error) {
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
