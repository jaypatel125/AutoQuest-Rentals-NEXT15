import { NextResponse } from "next/server";
import pool from "@/lib/db";

async function getAvailableCars(
  city?: string,
  startDate?: string,
  endDate?: string
) {
  let query = `
    SELECT c.* FROM car c
    WHERE c.available = true
  `;

  const params: any[] = [];

  if (city) {
    query += ` AND c."branchId" IN (SELECT id FROM branch WHERE city = $${
      params.length + 1
    })`;
    params.push(city);
  }

  if (startDate && endDate) {
    query += `
      AND c.id NOT IN (
        SELECT "carId" FROM booking 
        WHERE (
          ("startDate" <= $${params.length + 1} AND "endDate" >= $${
      params.length + 2
    })
          OR ("startDate" <= $${params.length + 2} AND "endDate" >= $${
      params.length + 1
    })
          OR ("startDate" >= $${params.length + 1} AND "endDate" <= $${
      params.length + 2
    })
        )
        AND status != 'cancelled'
      )
    `;
    params.push(new Date(startDate), new Date(endDate));
  }

  query += " LIMIT 12";

  const result = await pool.query(query, params);

  console.log(result.rows);

  return result.rows;
}

export async function POST(req: Request) {
  const { city, startDate, endDate } = await req.json();
  const cars = await getAvailableCars(city, startDate, endDate);
  return NextResponse.json(cars);
}
