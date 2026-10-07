// Cancellation policy (matches section 3 of the rental terms):
// - more than 24 hours before pick-up: full refund
// - within 24 hours of pick-up: one day's rental (plus tax) is kept
// - once the rental has started it can no longer be cancelled online

import { TAX_RATE } from "./pricing";

export const FREE_CANCELLATION_HOURS = 24;

export interface CancellationTerms {
  allowed: boolean;
  free: boolean;
  fee: number;
  refund: number;
  reason?: string;
}

export function cancellationTerms(
  booking: {
    status: string;
    start_date: string | Date;
    total_price: number | string;
    price_per_day: number | string;
  },
  now: Date = new Date()
): CancellationTerms {
  const total = Number(booking.total_price);
  const base = { allowed: false, free: false, fee: 0, refund: 0 };

  if (booking.status !== "Confirmed") {
    return { ...base, reason: "Only confirmed bookings can be cancelled." };
  }

  const hoursUntilPickup =
    (new Date(booking.start_date).getTime() - now.getTime()) / 3_600_000;

  if (hoursUntilPickup <= 0) {
    return {
      ...base,
      reason:
        "This rental has already started. Contact support if you need help.",
    };
  }

  if (hoursUntilPickup >= FREE_CANCELLATION_HOURS) {
    return { allowed: true, free: true, fee: 0, refund: round(total) };
  }

  const fee = Math.min(
    total,
    round(Number(booking.price_per_day) * (1 + TAX_RATE))
  );
  return { allowed: true, free: false, fee, refund: round(total - fee) };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Status changes an admin may make. Cancelling goes through the refund flow,
 * and finished bookings cannot be reopened (money and points have moved).
 */
export const ADMIN_TRANSITIONS: Record<string, string[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};
