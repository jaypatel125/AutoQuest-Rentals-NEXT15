import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const id = request.headers.get("x-car-id");
    if (!id) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT r.*, u.name AS "userName"
      FROM review r
      JOIN "user" u ON r."userId" = u.id
      WHERE r."carId" = $1
      `,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
