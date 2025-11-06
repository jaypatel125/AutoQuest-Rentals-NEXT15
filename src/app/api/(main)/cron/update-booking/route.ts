import pool from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

    // Update bookings that ended yesterday and are still 'Confirm'
    const query = `
      UPDATE bookings
      SET status = 'Completed', updated_at = NOW()
      WHERE status = 'Confirmed'
      AND DATE(end_date) = $1
      RETURNING id, user_id, car_id, end_date;
    `;

    const result = await client.query(query, [formatted]);
    console.log(`Updated ${result.rowCount} bookings to 'Complete' status.`);

    return NextResponse.json({
      message: `Updated ${result.rowCount} bookings to 'Complete'.`,
      updatedBookings: result.rows,
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
