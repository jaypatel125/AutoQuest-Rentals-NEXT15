import { NextResponse } from "next/server";
import pool from "@/lib/db";

async function getAvailableCars(
  city?: string,
  startDate?: string,
  endDate?: string
) {
  let query = `
    SELECT c.* FROM cars c
    WHERE c.available = TRUE
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];

  if (city) {
    query += ` AND c.branch_id IN (SELECT id FROM branches WHERE city = $${
      params.length + 1
    })`;
    params.push(city);
  }

  if (startDate && endDate) {
    query += `
      AND c.id NOT IN (
        SELECT car_id FROM bookings 
        WHERE (
          (start_date <= $${params.length + 1} AND end_date >= $${
      params.length + 2
    })
          OR (start_date <= $${params.length + 2} AND end_date >= $${
      params.length + 1
    })
          OR (start_date >= $${params.length + 1} AND end_date <= $${
      params.length + 2
    })
        )
        AND status != 'Cancelled'
      )
    `;
    params.push(new Date(startDate), new Date(endDate));
  }

  query += " LIMIT 12";

  const result = await pool.query(query, params);

  return result.rows;
}

export async function POST(req: Request) {
  const { city, startDate, endDate } = await req.json();
  const cars = await getAvailableCars(city, startDate, endDate);
  return NextResponse.json(cars);
}
