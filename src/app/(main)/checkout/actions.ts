"use client";

/**
 * Starts a Stripe Checkout session. Only ids, dates, and the points choice
 * are sent; the server prices the booking itself.
 */
export async function handleCheckout(input: {
  carId: string;
  startDate: Date | string;
  endDate: Date | string;
  redeemPoints: boolean;
}): Promise<{ url: string }> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      carId: input.carId,
      startDate: new Date(input.startDate).toISOString(),
      endDate: new Date(input.endDate).toISOString(),
      redeemPoints: input.redeemPoints,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(
      data?.error || "Could not start checkout. Please try again."
    );
  }
  return data;
}
