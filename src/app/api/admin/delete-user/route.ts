import { NextResponse } from "next/server";
// import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

export async function GET() {
  try {
    const session = await getServerSideSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error in admin delete-user route:", error);
    return NextResponse.json({ status: 500 });
  }
}
