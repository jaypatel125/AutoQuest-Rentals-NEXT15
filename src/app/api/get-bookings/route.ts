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
  br.id,
  br.name,
  br.city ,
  br.province,
  br.postal_code
FROM bookings b
JOIN cars c ON b.car_id = c.id
JOIN branches br ON c.branch_id = br.id
WHERE b.user_id = $1
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
