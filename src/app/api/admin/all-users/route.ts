import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import pool from "@/lib/db";

export type CustomersItem = {
  id: string;
  name: string;
  email: string | null;
  createdAt: string;
  bookingsCount: number;
  revenue: number;
  lastBookedAt: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
};

type CustomersResponse = {
  customers: CustomersItem[];
  nextCursor: string | null;
};

function parseLimit(value: string | null): number {
  const n = Number(value ?? 20);
  if (!Number.isFinite(n)) return 20;
  return Math.min(100, Math.max(1, Math.floor(n)));
}

function encodeCursor(createdAtISO: string, id: string) {
  return Buffer.from(`${createdAtISO}|${id}`, "utf-8").toString("base64url");
}
function decodeCursor(cursor: string | null): {
  createdAt?: string;
  id?: string;
} {
  if (!cursor) return {};
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const [createdAtISO, id] = raw.split("|");
    if (!createdAtISO || !id) return {};
    return { createdAt: createdAtISO, id };
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = parseLimit(url.searchParams.get("limit"));
  const { createdAt: cursorCreatedAt, id: cursorId } = decodeCursor(
    url.searchParams.get("cursor")
  );

  const whereParts: string[] = ["1=1"];
  const params = [];
  let p = 0;

  if (q) {
    whereParts.push(
      `(u.name ILIKE '%' || $${++p} || $${p} || '%' OR u.email ILIKE '%' || $${p} || '%')`
    );
    params.push(q);
  }

  if (cursorCreatedAt && cursorId) {
    whereParts.push(
      `(u."createdAt" < $${++p}::timestamptz OR (u."createdAt" = $${p}::timestamptz AND u.id < $${++p}))`
    );
    params.push(cursorCreatedAt, cursorId);
  }

  const sql = `
    WITH booking_agg AS (
      SELECT
        b.user_id,
        COUNT(*)::bigint AS bookings_count,
        COALESCE(SUM(b.sub_total::numeric), 0)::numeric AS revenue,
        MAX(b.created_at) AS last_booked_at
      FROM "bookings" b
      GROUP BY b.user_id
    )
    SELECT
      u.id,
      COALESCE(u.name, u.email, u.id::text) AS name,
      u.email,
      u.role,
      u.banned,
      u."banReason" AS "banReason",
      u."banExpires"::timestamptz AS "banExpires",
      u."createdAt"::timestamptz AS "createdAt",
      COALESCE(oa.bookings_count, 0)::bigint AS bookings_count,
      COALESCE(oa.revenue, 0)::numeric AS revenue,
      oa.last_booked_at::timestamptz AS last_booked_at
    FROM "user" u
    LEFT JOIN booking_agg oa ON oa.user_id = u.id
    WHERE ${whereParts.join(" AND ")}
    ORDER BY u."createdAt" DESC, u.id DESC
    LIMIT $${++p}
  `;

  params.push(limit + 1);

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, params);

    const hasNext = rows.length > limit;
    const slice = hasNext ? rows.slice(0, limit) : rows;

    const customers: CustomersItem[] = slice.map((r) => ({
      id: r.id,
      name: r.name || "(no name)",
      email: r.email ?? null,
      createdAt: new Date(r.createdAt).toISOString(),
      bookingsCount: Number(r.bookings_count || 0),
      revenue: Number(r.revenue || 0),
      lastBookedAt: r.last_booked_at
        ? new Date(r.last_booked_at).toISOString()
        : null,
      role: r.role,
      banned: r.banned,
      banReason: r.banReason,
      banExpires: r.banExpires,
    }));

    const last = slice[slice.length - 1];
    const nextCursor = hasNext
      ? encodeCursor(new Date(last.createdAt).toISOString(), last.id)
      : null;

    const payload: CustomersResponse = { customers, nextCursor };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/admin/users] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST() {
  return NextResponse.json({ status: "API is running" });
}
