import { test, expect } from "@playwright/test";

function formatAriaLabel(date: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // suffix (1st, 2nd, 3rd, 4th…)
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${dayName}, ${monthName} ${day}${suffix}, ${year}`;
}

test("select Hamilton location, choose dates and search vehicles", async ({
  page,
  baseURL,
}) => {
  await page.goto(baseURL || "/");

  // LOCATION
  await page.getByText("Select a city...").click();
  await page.getByText("Hamilton", { exact: true }).click();

  // DYNAMIC DATE CALCULATION
  const today = new Date();
  const pickupDate = new Date(today);
  pickupDate.setDate(today.getDate() + 2);

  const returnDate = new Date(today);
  returnDate.setDate(today.getDate() + 4);

  const pickupLabel = formatAriaLabel(pickupDate);
  const returnLabel = formatAriaLabel(returnDate);

  // PICKUP DATE
  await page.getByRole("button", { name: /pick-up date/i }).click();
  await page.getByRole("button", { name: pickupLabel }).first().click();

  // RETURN DATE
  await page.getByRole("button", { name: /return date/i }).click();
  await page.getByRole("button", { name: returnLabel }).first().click();

  // SEARCH VEHICLES
  const searchButton = page.getByRole("button", { name: /search vehicles/i });
  await expect(searchButton).toBeEnabled();
  await searchButton.click();

  await expect(page).toHaveURL("/select-vehicle");

  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
  - text: Location
  - combobox: Hamilton
  - text: Pickup Date
  - button /[A-Za-z]+ \\d{1,2}(st|nd|rd|th), \\d{4}/:
    - img
  - text: Return Date
  - button /[A-Za-z]+ \\d{1,2}(st|nd|rd|th), \\d{4}/:
    - img
  - button "Search Vehicles":
    - img
  - complementary:
    - heading "Search Results For:" [level=3]
    - button "Clear Filters":
      - img
    - text: "/Location: Hamilton Pickup: \\\\d+\\\\/\\\\d+\\\\/\\\\d+ Return: \\\\d+\\\\/\\\\d+\\\\/\\\\d+/"
  `);
});
