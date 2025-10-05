import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") as string;
  const body = await req.text();
  const pool = db;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata!;
      const userId = metadata.userId!;
      const carId = metadata.carId!;
      const startDate = new Date(metadata.startDate!);
      const endDate = new Date(metadata.endDate!);
      const totalPrice = Number(metadata.total!);
      const redeemedPoints = Number(metadata.redeemedPoints!);

      // Create booking record
      const bookingQuery = `
    INSERT INTO bookings (
      user_id, car_id, start_date, end_date,
      total_price, status, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING id;
  `;
      const result = await pool.query(bookingQuery, [
        userId,
        carId,
        startDate,
        endDate,
        totalPrice,
        "Confirmed",
      ]);

      const bookingId = result.rows[0].id;

      //  Handle redeemed points (if any were used)
      if (redeemedPoints > 0) {
        await pool.query(
          `UPDATE "user" SET reward_points = reward_points - $1 WHERE id = $2`,
          [redeemedPoints, userId]
        );

        await pool.query(
          `INSERT INTO RewardsHistory (id, user_id, booking_id, points, transaction_type)
           VALUES (gen_random_uuid(), $1, $2, $3, 'Redeemed')`,
          [userId, bookingId, redeemedPoints]
        );
      }

      // 2 Check fuel type of the car
      const carRes = await pool.query(
        `SELECT fuel_type FROM cars WHERE id = $1`,
        [carId]
      );

      const fuelType = carRes.rows[0]?.fuel_type;
      const isEV = fuelType?.toLowerCase() === "electric";

      const pointsEarned = Math.floor(isEV ? totalPrice * 2 : totalPrice * 1);

      //  Update user's reward points
      await pool.query(
        `UPDATE "user" SET reward_points = reward_points + $1 WHERE id = $2`,
        [pointsEarned, userId]
      );

      //  Add entry to RewardsHistory
      await pool.query(
        `INSERT INTO rewardshistory (id, user_id, booking_id, points, transaction_type)
     VALUES (gen_random_uuid(), $1, $2, $3, 'Earned')`,
        [userId, bookingId, pointsEarned]
      );

      console.log(`User ${userId} earned ${pointsEarned} points.`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
