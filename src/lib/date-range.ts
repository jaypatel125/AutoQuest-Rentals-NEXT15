export interface PartialRange {
  from?: Date;
  to?: Date;
}

/**
 * Two-click range picking for the trip calendars. The first click sets the
 * pick-up day and the second sets the return day (the same day is allowed).
 * Clicking before pick-up, or after a finished range, starts a new range.
 *
 * react-day-picker's own range logic turns the first click into a one-day
 * range, which would close the picker before a return day is chosen.
 */
export function nextRange(
  current: PartialRange | undefined,
  clicked: Date
): { from: Date; to?: Date } {
  const from = current?.from;
  if (!from || current?.to || clicked < from) {
    return { from: clicked, to: undefined };
  }
  return { from, to: clicked };
}
