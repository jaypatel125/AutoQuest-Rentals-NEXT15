import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function GET() {
  try {
    const { user } = await getServerSideSession();

    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const query = `
SELECT 
        b.id AS booking_id,
        b.*,
        c.brand, 
        c.model, 
        c.image, 
        c.price_per_day, 
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
      LEFT JOIN RewardsHistory rh ON rh.booking_id = b.id
      WHERE b.user_id = $1
      GROUP BY 
        b.id, c.brand, c.model, c.image, c.price_per_day, 
        br.id, br.name, br.city, br.province, br.postal_code
      ORDER BY b.created_at DESC
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
