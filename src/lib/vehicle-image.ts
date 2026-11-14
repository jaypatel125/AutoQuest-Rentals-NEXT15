// Client-safe helpers for vehicle image URLs.
import { CAR_PHOTOS, type CarPhoto } from "./car-photos";

/** "Tesla Model 3" -> "tesla-model-3", the key used by the photo catalog. */
export function photoSlug(brand?: string | null, model?: string | null) {
  return `${brand ?? ""} ${model ?? ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The stock photo bundled with the site for this model, if there is one. */
export function bundledVehiclePhoto(
  brand?: string | null,
  model?: string | null
): CarPhoto | null {
  return CAR_PHOTOS[photoSlug(brand, model)] ?? null;
}

/** A photo the admin uploaded, or null for empty and retired S3 URLs. */
function uploadedImage(src: string | null | undefined) {
  if (!src) return null;
  const value = src.trim();
  if (!value) return null;
  if (/amazonaws\.com/i.test(value)) return null;
  if (
    value.startsWith("/") ||
    /^https?:\/\//i.test(value) ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  return null;
}

/**
 * Returns a usable image URL: the uploaded photo when there is one, else the
 * bundled stock photo for the model, else null (callers draw an illustration).
 */
export function resolveVehicleImage(
  src: string | null | undefined,
  brand?: string | null,
  model?: string | null
) {
  return uploadedImage(src) ?? bundledVehiclePhoto(brand, model)?.file ?? null;
}

/** Absolute URL for third parties (Stripe Checkout needs one). */
export function absoluteImageUrl(
  src: string | null | undefined,
  appUrl?: string,
  brand?: string | null,
  model?: string | null
) {
  const resolved = resolveVehicleImage(src, brand, model);
  if (!resolved || resolved.startsWith("blob:")) return null;
  if (/^https:\/\//i.test(resolved)) return resolved;
  if (resolved.startsWith("/") && appUrl?.startsWith("https://")) {
    return `${appUrl.replace(/\/$/, "")}${resolved}`;
  }
  return null;
}
