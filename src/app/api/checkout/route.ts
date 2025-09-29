import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST(req: Request) {
  try {
    const { amountDue, currentUser, selectedCar, startDate, endDate, branch } =
      await req.json();

    if (!currentUser?.id) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

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
              description: `
                        ${new Date(
                          startDate
                        ).toLocaleDateString()} → ${new Date(
                endDate
              ).toLocaleDateString()}`,
            },
            unit_amount: Math.round(amountDue * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        userId: currentUser.id,
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
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
