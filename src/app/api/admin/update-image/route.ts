import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pool from "@/lib/db";
import { auth } from "../../../../../auth";

const {
  AWS_S3_REGION,
  AWS_S3_BUCKET_NAME,
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY,
} = process.env;

if (
  !AWS_S3_REGION ||
  !AWS_S3_BUCKET_NAME ||
  !AWS_S3_ACCESS_KEY_ID ||
  !AWS_S3_SECRET_ACCESS_KEY
) {
  throw new Error("Missing required AWS S3 environment variables");
}

const s3Client = new S3Client({
  region: AWS_S3_REGION,
  credentials: {
    accessKeyId: AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
  },
});

/** Allowed mime types for upload */
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0] : "";
}

function extractS3KeyFromUrl(url: string): string | undefined {
  try {
    const decoded = decodeURIComponent(url);
    const host = `${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/`;
    const idx = decoded.indexOf(host);
    if (idx === -1) return undefined;
    return decoded.slice(idx + host.length);
  } catch {
    return undefined;
  }
}

async function uploadFileToS3(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURI(
    key
  )}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const formData = await request.formData();
    const maybeFile = formData.get("file");
    const carId = formData.get("carId");
    const imageUrl = formData.get("image");

    if (!maybeFile || !(maybeFile instanceof File)) {
      return NextResponse.json(
        { error: "A file is required." },
        { status: 400 }
      );
    }
    const file: File = maybeFile;

    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED_MIME.has(contentType)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed types: PNG, JPG, JPEG, WEBP.",
        },
        { status: 415 }
      );
    }

    let keyToUse: string | null = null;
    if (imageUrl && typeof imageUrl === "string") {
      const extracted = extractS3KeyFromUrl(imageUrl);
      if (extracted) {
        keyToUse = extracted;
      }
    }

    if (!keyToUse) {
      const ext = getFileExtension(file.name) || ".png";
      const sanitized = file.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");
      keyToUse = `vehicles/${sanitized}-${Date.now()}${ext}`;
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileUrl = await uploadFileToS3(buffer, keyToUse, contentType);

    const client = await pool.connect();

    try {
      await client.query(
        `UPDATE cars
                 SET image = $1
                 WHERE id = $2`,
        [fileUrl, carId]
      );

      return NextResponse.json({
        success: true,
        image: fileUrl,
      });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error("Error uploading file:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload file.", details: message },
      { status: 500 }
    );
  }
}
