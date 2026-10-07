"use client";

/**
 * Downscales and re-encodes a photo in the browser before upload so stored
 * images stay small. Falls back to the original file if anything fails.
 */
export async function compressImage(
  file: File,
  {
    maxWidth = 1600,
    quality = 0.85,
  }: { maxWidth?: number; quality?: number } = {}
): Promise<File> {
  try {
    if (typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const encode = (type: string) =>
      new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, quality)
      );

    let blob = await encode("image/webp");
    if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
    if (!blob || blob.size >= file.size) return file;

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const name = file.name.replace(/\.[^.]+$/, "") || "vehicle";
    return new File([blob], `${name}.${ext}`, { type: blob.type });
  } catch {
    return file;
  }
}
