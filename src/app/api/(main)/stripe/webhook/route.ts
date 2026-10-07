import { NextResponse } from "next/server";
import Stripe from "stripe";
import { withTransaction } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { ensureSchema } from "@/lib/schema";
import { hasConflict } from "@/lib/bookings";
import { EV_POINTS_MULTIPLIER, isElectric } from "@/lib/pricing";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/email-templates";
import { formatDate, formatPrice } from "@/lib/utils";

type Outcome =
  | { kind: "duplicate" }
  | { kind: "conflict" }
  | {
      kind: "created";
      bookingId: string;
      pointsEarned: number;
      car: { brand: string; model: string };
      branch: { name: string; address: string } | null;
      user: { email: string; name: string } | null;
    };

async function handleCompletedSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") return;

  const metadata = session.metadata ?? {};
  const { userId, carId } = metadata;
  const startDate = new Date(metadata.startDate ?? "");
  const endDate = new Date(metadata.endDate ?? "");
  if (
    !userId ||
    !carId ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    console.error("Checkout session is missing booking metadata:", session.id);
    return;
  }

  const totalPrice = (session.amount_total ?? 0) / 100;
  const subtotal = Number(metadata.subtotal ?? 0);
  const redeemedPoints = Math.max(
    0,
    Math.floor(Number(metadata.redeemedPoints ?? 0))
  );
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  await ensureSchema();

  const outcome = await withTransaction<Outcome>(async (db) => {
    // Lock the car so two payments for it are processed one at a time.
    const carRes = await db.query(
      `SELECT id, brand, model, fuel_type, branch_id FROM cars WHERE id = $1 FOR UPDATE`,
      [carId]
    );
    const car = carRes.rows[0];

    const existing = await db.query(
      `SELECT id FROM bookings WHERE stripe_session_id = $1`,
      [session.id]
    );
    if (existing.rows.length) return { kind: "duplicate" };

    if (!car || (await hasConflict(db, carId, startDate, endDate))) {
      return { kind: "conflict" };
    }

    const inserted = await db.query(
      `INSERT INTO bookings (
         user_id, car_id, start_date, end_date, sub_total, total_price, status,
         stripe_session_id, stripe_payment_intent_id, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'Confirmed', $7, $8, NOW(), NOW())
       ON CONFLICT (stripe_session_id) WHERE stripe_session_id IS NOT NULL DO NOTHING
       RETURNING id`,
      [
        userId,
        carId,
        startDate,
        endDate,
        subtotal,
        totalPrice,
        session.id,
        paymentIntentId,
      ]
    );
    if (!inserted.rows.length) return { kind: "duplicate" };
    const bookingId = inserted.rows[0].id;

    if (redeemedPoints > 0) {
      await db.query(
        `UPDATE "user" SET reward_points = GREATEST(0, reward_points - $1) WHERE id = $2`,
        [redeemedPoints, userId]
      );
      await db.query(
        `INSERT INTO rewardshistory (id, user_id, booking_id, points, transaction_type)
         VALUES (gen_random_uuid(), $1, $2, $3, 'Redeemed')`,
        [userId, bookingId, redeemedPoints]
      );
    }

    const pointsEarned = Math.floor(
      totalPrice * (isElectric(car.fuel_type) ? EV_POINTS_MULTIPLIER : 1)
    );
    if (pointsEarned > 0) {
      await db.query(
        `UPDATE "user" SET reward_points = reward_points + $1 WHERE id = $2`,
        [pointsEarned, userId]
      );
      await db.query(
        `INSERT INTO rewardshistory (id, user_id, booking_id, points, transaction_type)
         VALUES (gen_random_uuid(), $1, $2, $3, 'Earned')`,
        [userId, bookingId, pointsEarned]
      );
    }

    const [userRes, branchRes] = await Promise.all([
      db.query(`SELECT email, name FROM "user" WHERE id = $1`, [userId]),
      db.query(
        `SELECT name, address, city, province FROM branches WHERE id = $1`,
        [car.branch_id]
      ),
    ]);
    const branch = branchRes.rows[0];

    return {
      kind: "created",
      bookingId,
      pointsEarned,
      car: { brand: car.brand, model: car.model },
      branch: branch
        ? {
            name: branch.name,
            address: [branch.address, branch.city, branch.province]
              .filter(Boolean)
              .join(", "),
          }
        : null,
      user: userRes.rows[0] ?? null,
    };
  });

  const customerEmail =
    session.customer_details?.email ?? session.customer_email;

  if (outcome.kind === "conflict") {
    // Someone else booked the car first: give the money back right away.
    if (paymentIntentId) {
      await stripe.refunds.create(
        {
          payment_intent: paymentIntentId,
          metadata: { reason: "double_booking" },
        },
        { idempotencyKey: `conflict-${session.id}` }
      );
    }
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: "We couldn't complete your AutoQuest booking",
        html: renderEmail({
          title: "Booking not completed",
          accent: "#b45309",
          paragraphs: [
            "Sorry! The vehicle you paid for was booked by someone else moments before your payment went through.",
            "We've refunded your payment in full. It should appear on your statement within 5 to 10 business days.",
          ],
          details: [["Refund", formatPrice(totalPrice)]],
        }),
      }).catch((err) => console.error("Conflict email failed:", err));
    }
    return;
  }

  if (outcome.kind !== "created" || !outcome.user?.email) return;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  await sendEmail({
    to: outcome.user.email,
    subject: "Your AutoQuest booking is confirmed",
    html: renderEmail({
      title: "Booking confirmed",
      greeting: `Hi ${outcome.user.name || "there"},`,
      paragraphs: [
        "Thanks for booking with AutoQuest! Here are your trip details.",
      ],
      details: [
        ["Vehicle", `${outcome.car.brand} ${outcome.car.model}`],
        ["Pick-up", formatDate(startDate)],
        ["Return", formatDate(endDate)],
        ["Total paid", formatPrice(totalPrice)],
        ["Points earned", `+${outcome.pointsEarned}`],
      ],
      callout: outcome.branch
        ? {
            title: `Pick-up and drop-off: ${outcome.branch.name}`,
            body: outcome.branch.address,
          }
        : undefined,
      button: appUrl
        ? {
            label: "View booking",
            href: `${appUrl}/bookings/${outcome.bookingId}`,
          }
        : undefined,
      footnote: "Free cancellation up to 24 hours before pick-up.",
    }),
  }).catch((err) => console.error("Error sending confirmation email:", err));
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    if (!sig) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCompletedSession(
        stripe,
        event.data.object as Stripe.Checkout.Session
      );
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    // A 500 makes Stripe retry later; the handler is idempotent.
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
