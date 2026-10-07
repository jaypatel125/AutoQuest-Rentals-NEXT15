import { expect, type Page } from "@playwright/test";
import { format } from "date-fns";

/** City to search in. Override with E2E_CITY to match your data. */
export const E2E_CITY = process.env.E2E_CITY ?? "Hamilton";

function daysFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/** Accessible name of a calendar day, e.g. "Friday, October 9th, 2026". */
function dayLabel(date: Date) {
  return format(date, "PPPP");
}

/**
 * Fills the search bar with a city and a pick-up/return range, runs the
 * search, and waits for the results page.
 */
export async function searchTrip(
  page: Page,
  { city = E2E_CITY, startIn = 2, endIn = 4 } = {}
) {
  await page.goto("/");

  const search = page.getByRole("region", { name: "Search vehicles" });
  await search.getByRole("button", { name: /location/i }).click();
  await page.getByRole("option", { name: city }).click();

  // Picking a city opens the calendar; open it if a date was already saved.
  const calendar = page.getByRole("grid").first();
  if (!(await calendar.isVisible())) {
    await search.getByRole("button", { name: /pick-up date/i }).click();
  }

  await page
    .getByRole("button", { name: dayLabel(daysFromToday(startIn)) })
    .first()
    .click();
  await page
    .getByRole("button", { name: dayLabel(daysFromToday(endIn)) })
    .first()
    .click();

  const searchButton = search.getByRole("button", {
    name: /search vehicles/i,
  });
  await expect(searchButton).toBeEnabled();
  await searchButton.click();

  await expect(page).toHaveURL(/\/select-vehicle$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    `Cars in ${city}`
  );
}
