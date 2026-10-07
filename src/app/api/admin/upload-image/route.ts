import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { ImageValidationError, saveImage } from "@/lib/images";

/** Stores a vehicle photo and returns its URL. Admin only. */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A file is required." },
        { status: 400 }
      );
    }
    const url = await saveImage(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    if (err instanceof ImageValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Error uploading image:", err);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    );
  }
}
