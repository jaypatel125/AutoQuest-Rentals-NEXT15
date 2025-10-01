import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const query = `
      SELECT b.*, 
             c.brand, 
             c.model, 
             c.image, 
             c.price_per_day, 
             br.*
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
