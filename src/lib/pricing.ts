// Pricing rules shared by the checkout UI and the server. The server always
// recomputes the quote from database values; the client copy is for display.

export const SERVICE_FEE = 15;
export const TAX_RATE = 0.13;
/** 10 reward points = $1.00 discount. */
export const POINTS_PER_DOLLAR = 10;
export const MAX_REDEEMABLE_POINTS = 1000;
export const MAX_RENTAL_DAYS = 60;
export const EV_POINTS_MULTIPLIER = 2;
/** Stripe needs a non-trivial charge, so discounts never go below this. */
const MIN_CHARGE_CENTS = 100;
const CENTS_PER_POINT = 100 / POINTS_PER_DOLLAR;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isElectric(fuelType?: string | null) {
  return fuelType?.toLowerCase() === "electric";
}

/** Number of billable rental days. Same-day rentals count as one day. */
export function rentalDays(start: Date | string, end: Date | string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / DAY_MS));
}

export interface Quote {
  days: number;
  dailyRate: number;
  rentalCharge: number;
  serviceFee: number;
  tax: number;
  pointsRedeemed: number;
  discount: number;
  total: number;
  pointsToEarn: number;
}

export function buildQuote({
  pricePerDay,
  start,
  end,
  fuelType,
  availablePoints = 0,
  redeemPoints = true,
}: {
  pricePerDay: number | string;
  start: Date | string;
  end: Date | string;
  fuelType?: string | null;
  availablePoints?: number;
  redeemPoints?: boolean;
}): Quote {
  const days = rentalDays(start, end);
  const rateCents = Math.round(Number(pricePerDay) * 100);
  const rentalCents = rateCents * days;
  const feeCents = SERVICE_FEE * 100;
  const taxCents = Math.round(rentalCents * TAX_RATE);
  const grossCents = rentalCents + feeCents + taxCents;

  const maxPointsByPrice = Math.floor(
    Math.max(0, grossCents - MIN_CHARGE_CENTS) / CENTS_PER_POINT
  );
  const pointsRedeemed = redeemPoints
    ? Math.min(
        Math.max(0, Math.floor(availablePoints)),
        MAX_REDEEMABLE_POINTS,
        maxPointsByPrice
      )
    : 0;
  const discountCents = pointsRedeemed * CENTS_PER_POINT;
  const totalCents = grossCents - discountCents;
  const multiplier = isElectric(fuelType) ? EV_POINTS_MULTIPLIER : 1;

  return {
    days,
    dailyRate: rateCents / 100,
    rentalCharge: rentalCents / 100,
    serviceFee: feeCents / 100,
    tax: taxCents / 100,
    pointsRedeemed,
    discount: discountCents / 100,
    total: totalCents / 100,
    pointsToEarn: Math.floor((totalCents / 100) * multiplier),
  };
}

/** Converts a point balance into its dollar value. */
export function pointsToDollars(points: number) {
  return points / POINTS_PER_DOLLAR;
}
