import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pool from "@/lib/db";
import { auth } from "../../../../../auth";
import {
  transmission_type,
  fuel_type,
  body_type,
} from "@/lib/database/table-types";

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

async function uploadFileToS3(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURIComponent(
    key
  )}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await request.formData();

    // Extract data
    const data = {
      branch_id: formData.get("branch_id") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      transmission: formData.get("transmission") as transmission_type,
      fuel_type: formData.get("fuel_type") as fuel_type,
      passenger_capacity: Number(formData.get("passenger_capacity")),
      body_type: formData.get("body_type") as body_type,
      carbon_emissions: Number(formData.get("carbon_emissions")),
      price_per_day: Number(formData.get("price_per_day")),
      available: formData.get("available") === "true",
      image: formData.get("file") as File | null,
      imageUrl: formData.get("imageUrl") as string,
    };

    let imageUrl = data.imageUrl;

    // Upload image if a file is provided
    if (data.image && data.image instanceof File) {
      if (!ALLOWED_MIME.has(data.image.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Allowed types: PNG, JPG, JPEG, WEBP." },
          { status: 415 }
        );
      }

      const ext = getFileExtension(data.image.name) || ".png";
      const sanitized = data.image.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");
      const keyToUse = `vehicles/${sanitized}-${Date.now()}${ext}`;
      const buffer = Buffer.from(await data.image.arrayBuffer());
      imageUrl = await uploadFileToS3(buffer, keyToUse, data.image.type);
    }

    const client = await pool.connect();
    try {
      const now = new Date();

      await client.query(
        `INSERT INTO cars 
        (branch_id, brand, model, transmission, fuel_type, passenger_capacity, body_type, carbon_emissions, price_per_day, available, image, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          data.branch_id,
          data.brand,
          data.model,
          data.transmission,
          data.fuel_type,
          data.passenger_capacity,
          data.body_type,
          data.carbon_emissions,
          data.price_per_day,
          data.available,
          imageUrl,
          now,
          now,
        ]
      );

      return NextResponse.json({
        success: true,
        vehicle: {
          ...data,
          image: imageUrl,
          created_at: now,
          updated_at: now,
        },
      });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.error("Error creating vehicle:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create vehicle.", details: message },
      { status: 500 }
    );
  }
}
