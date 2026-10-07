import pool from "@/lib/db";
import { ensureSchema } from "@/lib/schema";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  // Image ids are immutable (a replaced photo gets a new id), so the id is a
  // strong validator and the response can be cached forever.
  const etag = `"${id}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  try {
    await ensureSchema();
    const { rows } = await pool.query<{ content_type: string; data: Buffer }>(
      `SELECT content_type, data FROM vehicle_images WHERE id = $1`,
      [id]
    );
    if (!rows.length) return new Response("Not found", { status: 404 });

    const { content_type, data } = rows[0];
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": content_type,
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (err) {
    console.error("Error serving image:", err);
    return new Response("Failed to load image", { status: 500 });
  }
}
