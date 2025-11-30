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

test("book a vehicle by selecting Hamilton location and dynamic dates", async ({
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

  await page.getByRole("checkbox", { name: "Electric" }).click();
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("button", { name: "Rent Now" }) })
    .first()
    .getByRole("button", { name: "Rent Now" })
    .click();

  await page.getByRole("button", { name: "Pay Now" }).click();
  await page.getByRole("textbox", { name: "Card number" }).click();
  await page
    .getByRole("textbox", { name: "Card number" })
    .fill("4242 4242 4242 4242");
  await page.getByRole("textbox", { name: "Cardholder name" }).click();
  await page.getByRole("textbox", { name: "Cardholder name" }).fill("John");
  await page.getByRole("textbox", { name: "Postal code" }).click();
  await page.getByRole("textbox", { name: "Postal code" }).fill("L9C 3P3");
  await page.getByRole("textbox", { name: "Expiration" }).fill("04 / 44");
  await page.getByRole("textbox", { name: "CVC" }).click();
  await page.getByRole("textbox", { name: "CVC" }).fill("444");
  // click pay
  await page.getByTestId("hosted-payment-submit-button").click();

  // wait for Stripe checkout
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 });

  // now wait for confirmation UI (doesn't matter what query params are)
  await expect(page.locator("#success")).toContainText("Booking Confirmed", {
    timeout: 20000,
  });

  expect(page.url()).toMatch(/\/confirmation/);
});
