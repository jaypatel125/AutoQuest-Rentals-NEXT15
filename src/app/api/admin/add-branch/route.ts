import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Branches } from "@/lib/database/table-types";
import { requireAdmin } from "@/lib/api-auth";
import { branchSchema } from "@/lib/zod";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json().catch(() => null);
    const parsed = branchSchema.safeParse(body ?? {});

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "All fields are required.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const { name, address, city, province, postal_code } = parsed.data;

    const result = await pool.query<Branches>(
      `INSERT INTO branches (name, address, city, province, postal_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, address, city, province, postal_code.toUpperCase()]
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
