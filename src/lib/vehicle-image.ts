// Client-safe helpers for vehicle image URLs.

/**
 * Returns a usable image URL, or null when the vehicle has no photo or the
 * photo lived in the retired S3 bucket (those URLs no longer resolve).
 */
export function resolveVehicleImage(src: string | null | undefined) {
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

/** Absolute URL for third parties (Stripe Checkout needs one). */
export function absoluteImageUrl(
  src: string | null | undefined,
  appUrl?: string
) {
  const resolved = resolveVehicleImage(src);
  if (!resolved || resolved.startsWith("blob:")) return null;
  if (/^https:\/\//i.test(resolved)) return resolved;
  if (resolved.startsWith("/") && appUrl?.startsWith("https://")) {
    return `${appUrl.replace(/\/$/, "")}${resolved}`;
  }
  return null;
}
