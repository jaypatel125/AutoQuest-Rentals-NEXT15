import pool from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/email-templates";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Without a configured secret the endpoint stays closed.
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

/**
 * Daily job (see vercel.json): marks finished rentals as Completed and sends
 * the receipt. Picks up every confirmed booking that has ended, so a missed
 * run is caught up the next day.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE bookings b
       SET status = 'Completed', updated_at = NOW()
       FROM cars c
       LEFT JOIN branches br ON br.id = c.branch_id
       WHERE b.car_id = c.id
         AND b.status = 'Confirmed'
         AND b.end_date < CURRENT_DATE
       RETURNING b.id, b.user_id, b.start_date, b.end_date, b.total_price,
                 c.brand, c.model, br.name AS branch_name, br.address, br.city,
                 br.province, br.postal_code`
    );

    const emailResults: Array<{ bookingId: string; emailSent: boolean }> = [];

    for (const row of rows) {
      try {
        const [userRes, pointsRes] = await Promise.all([
          pool.query(`SELECT email, name FROM "user" WHERE id = $1`, [
            row.user_id,
          ]),
          pool.query(
            `SELECT COALESCE(SUM(points), 0)::int AS points FROM rewardshistory
             WHERE booking_id = $1 AND transaction_type = 'Earned'`,
            [row.id]
          ),
        ]);
        const user = userRes.rows[0];
        if (!user?.email) {
          emailResults.push({ bookingId: row.id, emailSent: false });
          continue;
        }

        const address = [row.address, row.city, row.province, row.postal_code]
          .filter(Boolean)
          .join(", ");

        await sendEmail({
          to: user.email,
          subject: "Your AutoQuest rental receipt",
          html: renderEmail({
            title: "Rental completed",
            greeting: `Hi ${user.name || "there"},`,
            paragraphs: [
              "We hope you enjoyed the drive! Your rental is complete. Here's your receipt.",
            ],
            details: [
              ["Vehicle", `${row.brand} ${row.model}`],
              ["Pick-up", formatDate(row.start_date)],
              ["Return", formatDate(row.end_date)],
              ["Total paid", formatPrice(Number(row.total_price))],
              ["Reward points earned", `+${pointsRes.rows[0]?.points ?? 0}`],
            ],
            callout: row.branch_name
              ? { title: row.branch_name, body: address }
              : undefined,
          }),
        });
        emailResults.push({ bookingId: row.id, emailSent: true });
      } catch (err) {
        console.error(`Error sending receipt for booking ${row.id}:`, err);
        emailResults.push({ bookingId: row.id, emailSent: false });
      }
    }

    return NextResponse.json({
      message: `Updated ${rows.length} bookings to 'Completed'.`,
      updatedCount: rows.length,
      emailResults,
    });
  } catch (error) {
    console.error("Error updating booking statuses:", error);
    return NextResponse.json(
      { error: "Failed to update booking statuses" },
      { status: 500 }
    );
  }
}
