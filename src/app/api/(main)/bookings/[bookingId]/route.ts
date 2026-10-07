import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { ensureSchema } from "@/lib/schema";
import {
  BookingError,
  cancelBooking,
  isInvalidInput,
  isStripeError,
} from "@/lib/bookings";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/email-templates";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSideSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    await ensureSchema();
    const result = await pool.query(
      `
  SELECT
    b.id AS booking_id,
    b.user_id,
    b.car_id,
    b.start_date,
    b.end_date,
    b.sub_total,
    b.total_price,
    b.status AS booking_status,
    b.created_at AS booking_created_at,
    b.updated_at AS booking_updated_at,
    b.cancelled_at,
    b.refund_amount,
    (b.stripe_payment_intent_id IS NOT NULL) AS paid_online,

    c.branch_id AS car_branch_id,
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

    br.id AS branch_id,
    br.name AS branch_name,
    br.address AS branch_address,
    br.city AS branch_city,
    br.province AS branch_province,
    br.postal_code AS branch_postal_code,

    COALESCE(SUM(CASE WHEN rh.transaction_type = 'Earned' THEN rh.points ELSE 0 END), 0) AS points_earned,
    COALESCE(SUM(CASE WHEN rh.transaction_type = 'Redeemed' THEN rh.points ELSE 0 END), 0) AS points_redeemed

  FROM bookings b
  JOIN cars c ON b.car_id = c.id
  JOIN branches br ON c.branch_id = br.id
  LEFT JOIN rewardshistory rh ON rh.booking_id = b.id

  WHERE b.id = $1

  GROUP BY b.id, c.id, br.id
  LIMIT 1
  `,
      [bookingId]
    );

    const booking = result.rows[0];
    const isAdmin = session.user.role === "admin";
    // Bookings belonging to someone else are reported as missing.
    if (!booking || (!isAdmin && booking.user_id !== session.user.id)) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (err) {
    if (isInvalidInput(err)) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    console.error("Error fetching booking:", err);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

/** Cancels the signed-in customer's booking and refunds it per the policy. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await getServerSideSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { bookingId } = await params;

  try {
    await ensureSchema();
    const result = await cancelBooking(bookingId, session.user.id);

    const { booking } = result;
    const refundLine = result.refundedAutomatically
      ? `A refund of ${formatPrice(result.refund)} is on its way to your original payment method (allow 5 to 10 business days).`
      : result.refund > 0
        ? `Our team will process your refund of ${formatPrice(result.refund)} within 5 to 7 business days.`
        : "No refund is due for this cancellation.";

    sendEmail({
      to: booking.email,
      subject: "Your AutoQuest booking was cancelled",
      html: renderEmail({
        title: "Booking cancelled",
        accent: "#475569",
        greeting: `Hi ${booking.name || "there"},`,
        paragraphs: ["Your booking has been cancelled.", refundLine],
        details: [
          ["Vehicle", `${booking.brand} ${booking.model}`],
          ["Pick-up", formatDate(booking.start_date)],
          ["Return", formatDate(booking.end_date)],
          ...(result.fee > 0
            ? ([["Late cancellation fee", formatPrice(result.fee)]] as [
                string,
                string,
              ][])
            : []),
          ["Refund", formatPrice(result.refund)],
        ],
      }),
    }).catch((err) => console.error("Cancellation email failed:", err));

    if (
      !result.refundedAutomatically &&
      result.refund > 0 &&
      process.env.SUPPORT_EMAIL
    ) {
      sendEmail({
        to: process.env.SUPPORT_EMAIL,
        subject: `Manual refund needed for booking ${bookingId}`,
        html: renderEmail({
          title: "Manual refund needed",
          paragraphs: [
            "A booking made before online refunds were enabled was cancelled. Please refund it in the Stripe dashboard.",
          ],
          details: [
            ["Booking", bookingId],
            ["Customer", booking.email],
            ["Refund due", formatPrice(result.refund)],
          ],
        }),
      }).catch((err) => console.error("Support email failed:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      refund: result.refund,
      fee: result.fee,
      refundedAutomatically: result.refundedAutomatically,
    });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (isInvalidInput(err)) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (isStripeError(err)) {
      console.error("Refund failed:", err);
      return NextResponse.json(
        {
          error:
            "We couldn't process the refund right now, so nothing was changed. Please try again shortly.",
        },
        { status: 502 }
      );
    }
    console.error("Error cancelling booking:", err);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
