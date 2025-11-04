import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function PATCH(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSideSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const awaitedParams = await params;
    const updates = await request.json();

    // Dynamically build update query only for provided fields
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const setClauses = fields.map((key, index) => `${key} = $${index + 1}`);
    const values = Object.values(updates);
    const query = `
      UPDATE branches
      SET ${setClauses.join(", ")}
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, [...values, awaitedParams.branchId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, branch: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 500 }
    );
  }
}
