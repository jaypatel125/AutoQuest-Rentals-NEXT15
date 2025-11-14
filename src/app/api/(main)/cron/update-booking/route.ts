import pool from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const client = await pool.connect();
  try {
    // Get yesterday's date in YYYY-MM-DD format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = yesterday.toISOString().split("T")[0];

    // Update bookings that ended yesterday and are still 'Confirmed'
    const updateQuery = `
      UPDATE bookings
      SET status = 'Completed'
      WHERE status = 'Confirmed'
      AND DATE(end_date) = $1
      RETURNING id, user_id, car_id, start_date, end_date, total_price, sub_total;
    `;

    const updateResult = await client.query(updateQuery, [formatted]);
    const updatedRows = updateResult.rows ?? [];
    console.log(
      `Updated ${updateResult.rowCount} bookings to 'Completed' status.`
    );

    // For each updated booking, fetch related data and send an email
    const emailResults: Array<{
      bookingId: string;
      userId: string;
      emailSent: boolean;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error?: any;
    }> = [];

    for (const row of updatedRows) {
      const bookingId = row.id;
      const userId = row.user_id;
      const carId = row.car_id;

      try {
        // Fetch user
        const userRes = await client.query(
          `SELECT id, email, name FROM "user" WHERE id = $1 LIMIT 1`,
          [userId]
        );
        const user = userRes.rows[0] ?? null;
        const userEmail = user?.email ?? null;
        const userName = user?.name || "Customer";

        // Fetch vehicle (cars table — adjust if your table name/columns differ)
        const vehicleRes = await client.query(
          `SELECT id, brand, model, branch_id FROM cars WHERE id = $1 LIMIT 1`,
          [carId]
        );
        const vehicle = vehicleRes.rows[0] ?? null;
        const carName =
          vehicle?.name ??
          ([vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") ||
            "Selected vehicle");
        const branchId = vehicle?.branch_id;

        // Fetch branch
        const branchRes = await client.query(
          `SELECT id, name, address, city, province, postal_code FROM branches WHERE id = $1 LIMIT 1`,
          [branchId]
        );
        const branch = branchRes.rows[0] ?? null;
        const branchName = branch?.name ?? "Pickup Location";
        // Build address string from available fields
        const addressParts = [
          branch?.address,
          branch?.city,
          branch?.province,
          branch?.postal_code,
        ].filter(Boolean);
        const address =
          addressParts.join(", ") || "Branch address not available";

        // Fetch rewards history rows for this booking
        const rewardsRes = await client.query(
          `SELECT points FROM rewardshistory WHERE booking_id = $1 AND transaction_type = 'Earned'`,
          [bookingId]
        );

        const pointsEarned = rewardsRes.rows?.[0]?.points || 0;

        // booking dates/prices
        const startDate = row.start_date ? new Date(row.start_date) : null;
        const endDate = row.end_date ? new Date(row.end_date) : null;
        const totalPrice =
          typeof row.total_price !== "undefined"
            ? row.total_price
            : row.sub_total ?? 0;

        const subject = "Your AutoQuest Rental Receipt";

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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Rental Completed</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px; color: #374151; font-size: 16px;">
              <p style="margin: 0 0 20px 0;">Hello ${userName},</p>
              <p style="margin: 0 0 20px 0;">We hope you enjoyed your recent rental with <strong style="color: #059669;">AutoQuest</strong>! Your booking has now been successfully completed.</p>
              
              <p style="margin: 0 0 20px 0;">Below is your final rental receipt for reference:</p>

              <!-- Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; background-color: #f9fafb; border-radius: 6px;">
                    <p style="margin: 0;"><strong>Car:</strong> ${carName}</p>
                    <p style="margin: 0;"><strong>Start Date:</strong> ${
                      startDate ? startDate.toDateString() : "N/A"
                    }</p>
                    <p style="margin: 0;"><strong>End Date:</strong> ${
                      endDate ? endDate.toDateString() : "N/A"
                    }</p>
                    <p style="margin: 0;"><strong>Total Price:</strong> $${totalPrice}</p>
                    <p style="margin: 0;"><strong>Reward Points Earned:</strong> ${pointsEarned}</p>
                  </td>
                </tr>
              </table>

              <!-- Pickup & Dropoff Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="Margin: 25px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; background-color: #ecfdf5; border-left: 4px solid #059669; border-radius: 4px;">
                    <p style="margin: 0; font-weight: 600; color: #065f46;">Pickup & Dropoff Location:</p>
                    <p style="margin: 5px 0 0 0; color: #065f46;">${branchName}</p>
                    <p style="margin: 5px 0 0 0; color: #065f46;">${address}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0;">Thank you for choosing AutoQuest. We appreciate your business and hope to serve you again soon!</p>
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

        // Send email if we have an email address
        if (userEmail) {
          try {
            await sendEmail({ to: userEmail, subject, html });
            console.log(
              `Booking completion email sent to ${userEmail} for booking ${bookingId}`
            );
            emailResults.push({ bookingId, userId, emailSent: true });
          } catch (sendErr) {
            console.error(
              `Error sending email for booking ${bookingId} to ${userEmail}:`,
              sendErr
            );
            emailResults.push({
              bookingId,
              userId,
              emailSent: false,
              error: String(sendErr),
            });
          }
        } else {
          console.warn(
            `No email for user ${userId} (booking ${bookingId}); skipping email send.`
          );
          emailResults.push({
            bookingId,
            userId,
            emailSent: false,
            error: "No user email",
          });
        }
      } catch (innerErr) {
        console.error(`Error processing booking ${bookingId}:`, innerErr);
        emailResults.push({
          bookingId,
          userId,
          emailSent: false,
          error: String(innerErr),
        });
      }
    }

    return NextResponse.json({
      message: `Updated ${updateResult.rowCount} bookings to 'Completed'.`,
      updatedCount: updateResult.rowCount,
      updatedBookings: updatedRows,
      emailResults,
    });
  } catch (error) {
    console.error("Error updating booking statuses:", error);
    return NextResponse.json(
      { error: "Failed to update booking statuses" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
