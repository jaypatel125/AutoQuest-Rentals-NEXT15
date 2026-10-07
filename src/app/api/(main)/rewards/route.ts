import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { rentalDays } from "@/lib/pricing";
import { tripSavingsKg } from "@/lib/green";

export const dynamic = "force-dynamic";

/** The signed-in customer's points balance, history, and green impact. */
export async function GET() {
  const session = await getServerSideSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [balance, totals, history, trips] = await Promise.all([
      pool.query(`SELECT reward_points FROM "user" WHERE id = $1`, [userId]),
      pool.query(
        `SELECT
           COALESCE(SUM(points) FILTER (WHERE transaction_type = 'Earned'), 0)::int AS earned,
           COALESCE(SUM(points) FILTER (WHERE transaction_type = 'Redeemed'), 0)::int AS redeemed,
           COALESCE(SUM(points) FILTER (WHERE transaction_type = 'Adjusted' AND points < 0), 0)::int AS reversed,
           COALESCE(SUM(points) FILTER (WHERE transaction_type = 'Adjusted' AND points > 0), 0)::int AS returned
         FROM rewardshistory WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT rh.id, rh.points, rh.transaction_type, rh.created_at, rh.booking_id,
                c.brand, c.model, c.fuel_type
         FROM rewardshistory rh
         LEFT JOIN bookings b ON b.id = rh.booking_id
         LEFT JOIN cars c ON c.id = b.car_id
         WHERE rh.user_id = $1
         ORDER BY rh.created_at DESC
         LIMIT 50`,
        [userId]
      ),
      pool.query(
        `SELECT b.start_date, b.end_date, c.carbon_emissions, c.fuel_type
         FROM bookings b JOIN cars c ON c.id = b.car_id
         WHERE b.user_id = $1 AND b.status IN ('Completed', 'Confirmed')
           AND b.start_date <= now()`,
        [userId]
      ),
    ]);

    const t = totals.rows[0] ?? {};
    const lifetimeEarned = Math.max(
      0,
      Number(t.earned ?? 0) + Number(t.reversed ?? 0)
    );
    const totalRedeemed = Math.max(
      0,
      Number(t.redeemed ?? 0) - Number(t.returned ?? 0)
    );

    let co2SavedKg = 0;
    let greenTrips = 0;
    for (const trip of trips.rows) {
      const saved = tripSavingsKg(
        trip.carbon_emissions ?? 0,
        rentalDays(trip.start_date, trip.end_date)
      );
      co2SavedKg += saved;
      if (trip.fuel_type === "Electric" || trip.fuel_type === "Hybrid")
        greenTrips += 1;
    }

    return NextResponse.json({
      balance: Number(balance.rows[0]?.reward_points ?? 0),
      lifetimeEarned,
      totalRedeemed,
      co2SavedKg: Math.round(co2SavedKg),
      greenTrips,
      trips: trips.rows.length,
      history: history.rows.map((r) => ({
        id: r.id,
        points: Number(r.points),
        type: r.transaction_type,
        createdAt: r.created_at,
        bookingId: r.booking_id,
        vehicle: r.brand ? `${r.brand} ${r.model}` : null,
        electric: r.fuel_type === "Electric",
      })),
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}
