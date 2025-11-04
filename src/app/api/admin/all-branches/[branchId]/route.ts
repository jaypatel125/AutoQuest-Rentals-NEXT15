import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function GET(
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
    const result = await pool.query(`SELECT * FROM branches WHERE id = $1`, [
      awaitedParams.branchId,
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching branch:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch" },
      { status: 500 }
    );
  }
}
