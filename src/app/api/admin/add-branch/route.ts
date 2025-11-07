import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Branches } from "@/lib/database/table-types";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function POST(request: Request) {
  try {
    const session = await getServerSideSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { name, address, city, province, postal_code } = await request.json();

    if (!name || !address || !city || !province || !postal_code) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const result = await pool.query<Branches>(
      `
      INSERT INTO branches (name, address, city, province, postal_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [name, address, city, province, postal_code]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Branch added successfully",
        branch: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding branch:", error);
    return NextResponse.json(
      { error: "Failed to add branch" },
      { status: 500 }
    );
  }
}
