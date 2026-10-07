import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { ensureSchema } from "@/lib/schema";
import {
  BookingError,
  cancelBooking,
  isInvalidInput,
  isStripeError,
} from "@/lib/bookings";
import { ADMIN_TRANSITIONS } from "@/lib/cancellation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { bookingId } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body?.status;

    if (!Object.keys(ADMIN_TRANSITIONS).includes(status)) {
      return NextResponse.json(
        { error: "Invalid booking status" },
        { status: 400 }
      );
    }

    await ensureSchema();
    const current = await pool.query(
      `SELECT status FROM bookings WHERE id = $1`,
      [bookingId]
    );
    if (!current.rows.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const from = current.rows[0].status as string;
    if (from === status) {
      return NextResponse.json({
        success: true,
        booking: { id: bookingId, status },
      });
    }
    if (!ADMIN_TRANSITIONS[from]?.includes(status)) {
      return NextResponse.json(
        {
          error: `A ${from.toLowerCase()} booking can't be changed to ${status.toLowerCase()}.`,
        },
        { status: 409 }
      );
    }

    if (status === "Cancelled") {
      const result = await cancelBooking(bookingId, guard.user.id, {
        asAdmin: true,
      });
      return NextResponse.json({
        success: true,
        booking: { id: bookingId, status: "Cancelled" },
        refund: result.refund,
        refundedAutomatically: result.refundedAutomatically,
      });
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    return NextResponse.json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    if (isInvalidInput(error)) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (isStripeError(error)) {
      console.error("Refund failed:", error);
      return NextResponse.json(
        {
          error:
            "We couldn't process the refund right now, so nothing was changed. Please try again shortly.",
        },
        { status: 502 }
      );
    }
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
