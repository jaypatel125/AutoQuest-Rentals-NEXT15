import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSideSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
  SELECT 
    -- Booking fields
    b.id AS booking_id,
    b.user_id,
    b.car_id,
    b.start_date,
    b.end_date,
    b.total_price,
    b.status AS booking_status,
    b.created_at AS booking_created_at,
    b.updated_at AS booking_updated_at,

    -- Car fields
    c.id AS car_id,
    c.branch_id AS car_branch_id,
    c.brand,
    c.model,
    c.transmission,
    c.fuel_type,
    c.passenger_capacity,
    c.body_type,
    c.carbon_emissions,
    c.price_per_day,
    c.available,
    c.image,
    c.created_at AS car_created_at,
    c.updated_at AS car_updated_at,

    -- Branch fields
    br.id AS branch_id,
    br.name AS branch_name,
    br.address AS branch_address,
    br.city AS branch_city,
    br.province AS branch_province,
    br.postal_code AS branch_postal_code,
    br.created_at AS branch_created_at,
    br.updated_at AS branch_updated_at,

    -- Reward History aggregation
    COALESCE(SUM(CASE WHEN rh.transaction_type = 'Earned' THEN rh.points ELSE 0 END), 0) AS points_earned,
    COALESCE(SUM(CASE WHEN rh.transaction_type = 'Redeemed' THEN rh.points ELSE 0 END), 0) AS points_redeemed

  FROM bookings b
  JOIN cars c ON b.car_id = c.id
  JOIN branches br ON c.branch_id = br.id
  LEFT JOIN RewardsHistory rh ON rh.booking_id = b.id

  WHERE b.id = $1

  GROUP BY
    b.id, b.user_id, b.car_id, b.start_date, b.end_date, b.total_price, b.status, b.created_at, b.updated_at,
    c.id, c.branch_id, c.brand, c.model, c.transmission, c.fuel_type, c.passenger_capacity, c.body_type, 
    c.carbon_emissions, c.price_per_day, c.available, c.image, c.created_at, c.updated_at,
    br.id, br.name, br.address, br.city, br.province, br.postal_code, br.created_at, br.updated_at

  LIMIT 1
  `,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching booking:", err);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  try {
    const existing = await pool.query(
      `SELECT id, status FROM bookings WHERE id = $1`,
      [bookingId]
    );
    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await pool.query(
      `UPDATE bookings 
       SET status = 'Cancelled' 
       WHERE id = $1`,
      [bookingId]
    );

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
