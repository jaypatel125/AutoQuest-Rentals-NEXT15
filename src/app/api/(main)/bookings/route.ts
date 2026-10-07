import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { ensureSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSideSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureSchema();
    const query = `
      SELECT
        b.id AS booking_id,
        b.id, b.user_id, b.car_id, b.start_date, b.end_date, b.sub_total,
        b.total_price, b.status, b.created_at, b.updated_at,
        b.refund_amount, b.cancelled_at,
        c.brand,
        c.model,
        c.image,
        c.price_per_day,
        c.fuel_type,
        c.body_type,
        c.carbon_emissions,
        br.id AS branch_id,
        br.name AS branch_name,
        br.city,
        br.province,
        br.postal_code,
        COALESCE(SUM(CASE WHEN rh.transaction_type = 'Earned' THEN rh.points ELSE 0 END), 0) AS points_earned,
        COALESCE(SUM(CASE WHEN rh.transaction_type = 'Redeemed' THEN rh.points ELSE 0 END), 0) AS points_redeemed
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      JOIN branches br ON c.branch_id = br.id
      LEFT JOIN rewardshistory rh ON rh.booking_id = b.id
      WHERE b.user_id = $1
      GROUP BY
        b.id, c.brand, c.model, c.image, c.price_per_day, c.fuel_type,
        c.body_type, c.carbon_emissions,
        br.id, br.name, br.city, br.province, br.postal_code
      ORDER BY b.start_date DESC
    `;

    const { rows } = await pool.query(query, [userId]);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
