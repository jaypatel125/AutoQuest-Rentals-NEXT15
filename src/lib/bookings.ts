import type { PoolClient } from "pg";
import { withTransaction } from "./db";
import { MAX_RENTAL_DAYS, rentalDays } from "./pricing";
import { cancellationTerms } from "./cancellation";
import { getStripe } from "./stripe";

type Queryable = Pick<PoolClient, "query">;

const HOUR = 3_600_000;

export class BookingError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Validates a requested rental window coming from the client. */
export function parseRentalDates(
  startRaw: unknown,
  endRaw: unknown,
  now: Date = new Date()
): { start: Date; end: Date } | { error: string } {
  if (typeof startRaw !== "string" || typeof endRaw !== "string") {
    return { error: "Pick-up and return dates are required." };
  }
  const start = new Date(startRaw);
  const end = new Date(endRaw);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Invalid rental dates." };
  }
  // Dates are picked as local midnight, so allow for time zones.
  if (start.getTime() < now.getTime() - 36 * HOUR) {
    return { error: "Pick-up date cannot be in the past." };
  }
  if (start.getTime() > now.getTime() + 366 * 24 * HOUR) {
    return { error: "Bookings can be made up to one year in advance." };
  }
  if (end.getTime() < start.getTime()) {
    return { error: "Return date must be after the pick-up date." };
  }
  if (rentalDays(start, end) > MAX_RENTAL_DAYS) {
    return { error: `Rentals are limited to ${MAX_RENTAL_DAYS} days.` };
  }
  return { start, end };
}

/** True when another active booking overlaps the requested window. */
export async function hasConflict(
  db: Queryable,
  carId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string
) {
  const params: unknown[] = [carId, start, end];
  let exclude = "";
  if (excludeBookingId) {
    params.push(excludeBookingId);
    exclude = "AND id <> $4";
  }
  const { rows } = await db.query(
    `SELECT 1 FROM bookings
     WHERE car_id = $1
       AND status <> 'Cancelled'
       AND start_date <= $3
       AND end_date >= $2
       ${exclude}
     LIMIT 1`,
    params
  );
  return rows.length > 0;
}

/** Errors thrown by the Stripe SDK (network problems, declined refunds, ...). */
export function isStripeError(err: unknown) {
  return (
    typeof (err as { type?: string })?.type === "string" &&
    (err as { type: string }).type.startsWith("Stripe")
  );
}

/** Postgres "invalid input syntax" (for example a malformed uuid). */
export function isInvalidInput(err: unknown) {
  return (err as { code?: string })?.code === "22P02";
}

export interface CancellationResult {
  bookingId: string;
  refund: number;
  fee: number;
  refundedAutomatically: boolean;
  pointsReversed: number;
  pointsReturned: number;
  booking: {
    brand: string;
    model: string;
    start_date: string;
    end_date: string;
    email: string;
    name: string;
  };
}

/**
 * Cancels a customer's booking: applies the cancellation policy, reverses
 * reward points, and refunds the payment through Stripe. Runs in one
 * transaction so a failed refund leaves the booking untouched.
 */
export async function cancelBooking(
  bookingId: string,
  userId: string,
  { asAdmin = false }: { asAdmin?: boolean } = {}
): Promise<CancellationResult> {
  return withTransaction(async (db) => {
    const { rows } = await db.query(
      `SELECT b.id, b.user_id, b.status, b.start_date, b.end_date, b.total_price,
              b.stripe_payment_intent_id, c.price_per_day, c.brand, c.model,
              u.email, u.name
       FROM bookings b
       JOIN cars c ON c.id = b.car_id
       JOIN "user" u ON u.id = b.user_id
       WHERE b.id = $1
       FOR UPDATE OF b`,
      [bookingId]
    );
    const booking = rows[0];
    // Someone else's booking is reported as missing so ids can't be probed.
    if (!booking || (!asAdmin && booking.user_id !== userId)) {
      throw new BookingError(404, "Booking not found");
    }

    // Cancellations made by AutoQuest staff are always refunded in full.
    const terms = asAdmin
      ? booking.status === "Confirmed" || booking.status === "Pending"
        ? {
            allowed: true,
            free: true,
            fee: 0,
            refund: Number(booking.total_price),
          }
        : {
            allowed: false,
            free: false,
            fee: 0,
            refund: 0,
            reason: "Only active bookings can be cancelled.",
          }
      : cancellationTerms(booking);
    if (!terms.allowed) throw new BookingError(409, terms.reason!);

    const points = await db.query(
      `SELECT
         COALESCE(SUM(points) FILTER (WHERE transaction_type = 'Earned'), 0)::int AS earned,
         COALESCE(SUM(points) FILTER (WHERE transaction_type = 'Redeemed'), 0)::int AS redeemed
       FROM rewardshistory WHERE booking_id = $1`,
      [bookingId]
    );
    const earned = Number(points.rows[0]?.earned ?? 0);
    const redeemed = Number(points.rows[0]?.redeemed ?? 0);

    await db.query(
      `UPDATE "user"
       SET reward_points = GREATEST(0, reward_points - $1 + $2)
       WHERE id = $3`,
      [earned, redeemed, booking.user_id]
    );
    for (const delta of [-earned, redeemed]) {
      if (!delta) continue;
      // History rows are informational; never let them block a cancellation.
      await db.query("SAVEPOINT reward_history");
      try {
        await db.query(
          `INSERT INTO rewardshistory (id, user_id, booking_id, points, transaction_type)
           VALUES (gen_random_uuid(), $1, $2, $3, 'Adjusted')`,
          [booking.user_id, bookingId, delta]
        );
        await db.query("RELEASE SAVEPOINT reward_history");
      } catch (err) {
        console.error("Could not record reward adjustment:", err);
        await db.query("ROLLBACK TO SAVEPOINT reward_history");
      }
    }

    await db.query(
      `UPDATE bookings
       SET status = 'Cancelled', cancelled_at = now(), updated_at = now(),
           refund_amount = $2
       WHERE id = $1`,
      [bookingId, terms.refund]
    );

    let refundedAutomatically = false;
    if (terms.refund > 0 && booking.stripe_payment_intent_id) {
      const stripe = getStripe();
      if (!stripe) {
        throw new BookingError(
          503,
          "Online cancellation is temporarily unavailable. Please contact support."
        );
      }
      await stripe.refunds.create(
        {
          payment_intent: booking.stripe_payment_intent_id,
          amount: Math.round(terms.refund * 100),
          metadata: { bookingId },
        },
        { idempotencyKey: `cancel-${bookingId}` }
      );
      refundedAutomatically = true;
    }

    return {
      bookingId,
      refund: terms.refund,
      fee: terms.fee,
      refundedAutomatically,
      pointsReversed: earned,
      pointsReturned: redeemed,
      booking: {
        brand: booking.brand,
        model: booking.model,
        start_date: new Date(booking.start_date).toISOString(),
        end_date: new Date(booking.end_date).toISOString(),
        email: booking.email,
        name: booking.name,
      },
    };
  });
}
