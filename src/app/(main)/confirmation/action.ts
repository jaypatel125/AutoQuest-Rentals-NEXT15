// Server-only helper for the confirmation page. This is intentionally not a
// server action ("use server"), so it is not callable from the browser.
import pool from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { ensureSchema } from "@/lib/schema";
import { getServerSideSession } from "@/hooks/SessionHandler";

export interface ConfirmationData {
  status: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  startDate: string;
  endDate: string;
  redeemedPoints: number;
  bookingId: string | null;
  pointsEarned: number | null;
  car: {
    id: string;
    brand: string;
    model: string;
    image: string | null;
    fuel_type: string;
    body_type: string;
    transmission: string;
    passenger_capacity: number;
    carbon_emissions: number;
    price_per_day: string;
  } | null;
  branch: {
    name: string;
    address: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
  } | null;
}

const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]+$/;

/** Returns the checkout details for the signed-in owner, or null. */
export async function getConfirmation(
  sessionId: string | undefined
): Promise<ConfirmationData | null> {
  if (!sessionId || !SESSION_ID_RE.test(sessionId)) return null;

  const stripe = getStripe();
  const auth = await getServerSideSession();
  if (!stripe || !auth?.user) return null;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }

  const metadata = session.metadata ?? {};
  if (metadata.userId !== auth.user.id) return null;

  await ensureSchema();
  const [carRes, bookingRes] = await Promise.all([
    pool.query(
      `SELECT c.id, c.brand, c.model, c.image, c.fuel_type, c.body_type,
              c.transmission, c.passenger_capacity, c.carbon_emissions, c.price_per_day,
              br.name AS branch_name, br.address, br.city, br.province, br.postal_code
       FROM cars c LEFT JOIN branches br ON br.id = c.branch_id
       WHERE c.id = $1`,
      [metadata.carId]
    ),
    pool.query(
      `SELECT b.id,
              COALESCE((SELECT SUM(points) FROM rewardshistory rh
                        WHERE rh.booking_id = b.id AND rh.transaction_type = 'Earned'), 0)::int AS points
       FROM bookings b WHERE b.stripe_session_id = $1`,
      [sessionId]
    ),
  ]);
  const row = carRes.rows[0];
  const booking = bookingRes.rows[0];

  return {
    status: session.status ?? "open",
    customerEmail: session.customer_details?.email ?? auth.user.email,
    amountTotal: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "cad").toUpperCase(),
    startDate: metadata.startDate ?? "",
    endDate: metadata.endDate ?? "",
    redeemedPoints: Number(metadata.redeemedPoints ?? 0),
    bookingId: booking?.id ?? null,
    pointsEarned: booking ? Number(booking.points) : null,
    car: row
      ? {
          id: row.id,
          brand: row.brand,
          model: row.model,
          image: row.image,
          fuel_type: row.fuel_type,
          body_type: row.body_type,
          transmission: row.transmission,
          passenger_capacity: row.passenger_capacity,
          carbon_emissions: Number(row.carbon_emissions ?? 0),
          price_per_day: String(row.price_per_day),
        }
      : null,
    branch: row?.branch_name
      ? {
          name: row.branch_name,
          address: row.address,
          city: row.city,
          province: row.province,
          postal_code: row.postal_code,
        }
      : null,
  };
}
