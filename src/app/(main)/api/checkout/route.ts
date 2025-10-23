import db from "@/lib/db";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  try {
    const { currentUser, selectedCar, startDate, endDate, branch } =
      await req.json();

    if (!currentUser?.id) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // ---------------------------
    // SERVER-SIDE PRICE CALCULATION
    // ---------------------------
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const days =
      start && end
        ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        : 1;

    const rentalCharge = selectedCar.price_per_day * days;
    const serviceCharge = 15;

    // Fetch the latest reward points directly from the database
    const userRes = await db.query(
      `SELECT reward_points FROM "user" WHERE id = $1`,
      [currentUser.id]
    );

    const rewards = userRes.rows[0]?.reward_points || 0;

    const rewardsDiscount = Number(-(rewards / 10).toFixed(2)); // Convert to number
    const tax = rentalCharge * 0.13;

    const amountDue = rentalCharge + serviceCharge + tax + rewardsDiscount;

    if (amountDue <= 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    // ---------------------------
    // STRIPE CHECKOUT SESSION
    // ---------------------------
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: currentUser.email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `${selectedCar.brand} ${selectedCar.model}`,
              images: [selectedCar.image || ""],
              description: `${new Date(
                startDate
              ).toLocaleDateString()} → ${new Date(
                endDate
              ).toLocaleDateString()}`,
            },
            unit_amount: Math.round(amountDue * 100), // Stripe requires cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: currentUser.id,
        redeemedPoints: rewards.toString(),
        carId: selectedCar.id,
        startDate,
        endDate,
        branch: branch?.id,
        total: amountDue.toFixed(2).toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/select-vehicle`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout Error:", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
