import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { getStripe } from "@/lib/stripe";
import { buildQuote, isElectric } from "@/lib/pricing";
import { hasConflict, isInvalidInput, parseRentalDates } from "@/lib/bookings";
import { absoluteImageUrl } from "@/lib/vehicle-image";
import { formatDate } from "@/lib/utils";

/**
 * Creates a Stripe Checkout session.
 *
 * Only the vehicle id, dates, and whether to redeem points come from the
 * client. The customer comes from the session; the price, the pick-up
 * branch, and the point balance come from the database.
 */
export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payments are not configured" },
        { status: 503 }
      );
    }

    const session = await getServerSideSession();
    const user = session?.user;
    if (!user?.id) {
      return NextResponse.json(
        { error: "Please sign in to continue" },
        { status: 401 }
      );
    }
    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot make bookings" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const carId = typeof body?.carId === "string" ? body.carId : null;
    if (!carId) {
      return NextResponse.json(
        { error: "Vehicle is required" },
        { status: 400 }
      );
    }

    const dates = parseRentalDates(body?.startDate, body?.endDate);
    if ("error" in dates) {
      return NextResponse.json({ error: dates.error }, { status: 400 });
    }
    const { start, end } = dates;

    const carRes = await db.query(
      `SELECT c.id, c.brand, c.model, c.price_per_day, c.fuel_type, c.image,
              c.available, c.branch_id, br.name AS branch_name
       FROM cars c LEFT JOIN branches br ON br.id = c.branch_id
       WHERE c.id = $1`,
      [carId]
    );
    const car = carRes.rows[0];
    if (!car) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    if (!car.available || (await hasConflict(db, car.id, start, end))) {
      return NextResponse.json(
        {
          error: "This vehicle is no longer available for the selected dates.",
        },
        { status: 409 }
      );
    }

    const userRes = await db.query(
      `SELECT reward_points FROM "user" WHERE id = $1`,
      [user.id]
    );
    const quote = buildQuote({
      pricePerDay: car.price_per_day,
      start,
      end,
      fuelType: car.fuel_type,
      availablePoints: Number(userRes.rows[0]?.reward_points ?? 0),
      redeemPoints: body?.redeemPoints !== false,
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const image = absoluteImageUrl(car.image, appUrl);
    const days = `${quote.days} day${quote.days === 1 ? "" : "s"}`;

    const checkout = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      // Abandoned carts expire quickly (Stripe's minimum is 30 minutes).
      expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `${car.brand} ${car.model}`,
              ...(image ? { images: [image] } : {}),
              description: `${formatDate(start)} to ${formatDate(end)} (${days})${
                car.branch_name ? `, pick-up at ${car.branch_name}` : ""
              }${isElectric(car.fuel_type) ? ". Earns 2x reward points." : ""}`,
            },
            unit_amount: Math.round(quote.total * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        carId: car.id,
        branch: car.branch_id ?? "",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        redeemedPoints: String(quote.pointsRedeemed),
        subtotal: quote.rentalCharge.toFixed(2),
        total: quote.total.toFixed(2),
      },
      success_url: `${appUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=1`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    if (isInvalidInput(err)) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    console.error("Checkout Error:", err);
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again in a moment." },
      { status: 500 }
    );
  }
}
