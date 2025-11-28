import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { Branches, Cars } from "@/lib/database/table-types";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }
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
      const subtotal = Number(metadata.subtotal!);
      const totalPrice = Number(metadata.total!);
      const branchId = metadata.branch;
      const redeemedPoints = Number(metadata.redeemedPoints!);

      // Create booking record
      const bookingQuery = `
      INSERT INTO bookings (
        user_id,
        car_id,
        start_date,
        end_date,
        sub_total,
        total_price,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id;
    `;

      const result = await pool.query(bookingQuery, [
        userId,
        carId,
        startDate,
        endDate,
        subtotal,
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

      // 3. Check car fuel type
      const carRes = await pool.query(`SELECT * FROM cars WHERE id = $1`, [
        carId,
      ]);
      const car: Cars = carRes.rows[0];
      const fuelType = car?.fuel_type;
      const carName = `${car?.brand} ${car.model}` || "Car";
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

      // 5. Fetch user info for email
      const userRes = await pool.query(
        `SELECT email, name FROM "user" WHERE id = $1`,
        [userId]
      );
      const user = userRes.rows[0];
      const userEmail = user?.email;
      const userName = user?.name || "Customer";

      const branchRes = await pool.query(
        `SELECT * FROM branches WHERE id = $1`,
        [branchId]
      );

      const branch: Branches = branchRes.rows[0];
      const branchName = branch?.name || "Branch";
      const address = `${branch.address}, ${branch.city}, ${branch.province}`;

      // 6. Send booking confirmation email
      if (userEmail) {
        const subject = "Your AutoQuest Booking Confirmation";
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669, #047857); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Booking Confirmation</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px; color: #374151; font-size: 16px;">
              <p style="margin: 0 0 20px 0;">Hello ${userName},</p>
              <p style="margin: 0 0 20px 0;">Thank you for booking with <strong style="color: #059669;">AutoQuest</strong>! Your booking has been successfully confirmed.</p>

              <!-- Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; background-color: #f9fafb; border-radius: 6px;">
                    <p style="margin: 0;"><strong>Car:</strong> ${carName}</p>
                    <p style="margin: 0;"><strong>Start Date:</strong> ${startDate.toDateString()}</p>
                    <p style="margin: 0;"><strong>End Date:</strong> ${endDate.toDateString()}</p>
                    <p style="margin: 0;"><strong>Total Price:</strong> $${totalPrice}</p>
                    <p style="margin: 0;"><strong>Reward Points Earned:</strong> ${pointsEarned}</p>
                  </td>
                </tr>
              </table>

              <!-- Pickup & Dropoff Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; background-color: #ecfdf5; border-left: 4px solid #059669; border-radius: 4px;">
                    <p style="margin: 0; font-weight: 600; color: #065f46;">Pickup & Dropoff Location:</p>
                    <p style="margin: 5px 0 0 0; color: #065f46;">${branchName}</p>
                    <p style="margin: 5px 0 0 0; color: #065f46;">${address}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0;">We look forward to seeing you soon!</p>
              <p style="margin: 0;">Best regards,<br><strong>The AutoQuest Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} AutoQuest. All rights reserved.</p>
              <p style="margin: 0; font-size: 11px;">This is an automated message, please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

        try {
          await sendEmail({ to: userEmail, subject, html });
          console.log(`Booking confirmation email sent to ${userEmail}`);
        } catch (emailErr) {
          console.error("Error sending confirmation email:", emailErr);
        }
      }
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
