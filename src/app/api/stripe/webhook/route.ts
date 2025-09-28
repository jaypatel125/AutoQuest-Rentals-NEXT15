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

      const query = `
INSERT INTO bookings (
  user_id,
  car_id,
  start_date,
  end_date,
  total_price,
  status,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
RETURNING *;
`;

      const values = [
        userId,
        carId,
        startDate,
        endDate,
        totalPrice,
        "Confirmed",
      ];

      const result = await pool.query(query, values);

      console.log("Booking created:", result.rows[0]);
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
