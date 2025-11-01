import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSideSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await pool.connect();

    try {
      const query = `
        SELECT 
        b.id,
        b.user_id,
        b.car_id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status,
        b.created_at,
        u.name,
        u.email,
        c.brand AS vehicle_brand,
        c.model AS vehicle_model
        FROM bookings b
        JOIN "user" u ON u.id = b.user_id
        JOIN cars c ON c.id = b.car_id
        ORDER BY b.created_at DESC
        
      `;

      const result = await client.query(query);

      const bookings = result.rows;

      return NextResponse.json({
        bookings,
      });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error("Error fetching bookings:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: message },
      { status: 500 }
    );
  }
}
