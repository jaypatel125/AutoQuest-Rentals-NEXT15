import pool from "./db";
import { ensureSchema } from "./schema";

// Vehicle photos are stored in Postgres (table vehicle_images) and served by
// /api/images/[id]. Images are resized in the browser before upload, so a
// typical photo is 100-300 KB.

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type ImageMime = "image/png" | "image/jpeg" | "image/webp";

/** Detects the real image type from its magic bytes (never trust the client). */
export function sniffImageType(buf: Uint8Array): ImageMime | null {
  if (
    buf.length > 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length > 12 &&
    String.fromCharCode(...buf.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...buf.subarray(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export class ImageValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function imagePath(id: string) {
  return `/api/images/${id}`;
}

/** Validates an uploaded file and stores it. Returns the public image path. */
export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new ImageValidationError("The file is empty.");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError("Images must be 4 MB or smaller.", 413);
  }

  const data = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImageType(data);
  if (!contentType) {
    throw new ImageValidationError(
      "Unsupported image. Upload a PNG, JPEG, or WebP file.",
      415
    );
  }

  await ensureSchema();
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO vehicle_images (content_type, data, byte_size)
     VALUES ($1, $2, $3) RETURNING id`,
    [contentType, data, data.length]
  );
  return imagePath(rows[0].id);
}

const IMAGE_PATH_RE = /^\/api\/images\/([0-9a-f-]{36})$/i;

/** Deletes a stored image if the URL points at our image store. */
export async function deleteImageByUrl(url: string | null | undefined) {
  const match = url?.match(IMAGE_PATH_RE);
  if (!match) return;
  await pool.query(`DELETE FROM vehicle_images WHERE id = $1`, [match[1]]);
}
