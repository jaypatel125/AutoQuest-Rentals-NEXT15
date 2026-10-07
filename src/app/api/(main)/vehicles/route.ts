import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { parseRentalDates } from "@/lib/bookings";

export const dynamic = "force-dynamic";

async function getAvailableCars(city?: string, start?: Date, end?: Date) {
  const params: unknown[] = [];
  let query = `
    SELECT c.*, br.name AS branch_name, br.city AS branch_city
    FROM cars c
    LEFT JOIN branches br ON br.id = c.branch_id
    WHERE c.available = TRUE
  `;

  if (city) {
    params.push(city);
    query += ` AND br.city = $${params.length}`;
  }

  if (start && end) {
    params.push(start, end);
    query += `
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.car_id = c.id
          AND b.status <> 'Cancelled'
          AND b.start_date <= $${params.length}
          AND b.end_date >= $${params.length - 1}
      )`;
  }

  query += " ORDER BY c.price_per_day ASC, c.brand, c.model LIMIT 200";

  const result = await pool.query(query, params);
  return result.rows;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const city =
      typeof body?.city === "string" && body.city.length <= 100
        ? body.city
        : undefined;

    let start: Date | undefined;
    let end: Date | undefined;
    if (body?.startDate || body?.endDate) {
      const dates = parseRentalDates(body.startDate, body.endDate);
      if ("error" in dates) {
        return NextResponse.json({ error: dates.error }, { status: 400 });
      }
      ({ start, end } = dates);
    }

    const cars = await getAvailableCars(city, start, end);
    return NextResponse.json(cars);
  } catch (error) {
    console.error("Error searching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
