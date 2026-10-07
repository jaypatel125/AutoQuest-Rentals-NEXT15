import { test, expect } from "@playwright/test";
import { E2E_CITY, searchTrip } from "./helpers";

test("search a city and date range, then filter the results", async ({
  page,
}) => {
  await searchTrip(page);

  await expect(page.getByText(/2 day trip/)).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Search vehicles" })
  ).toContainText(E2E_CITY);

  const rentButtons = page.getByRole("button", { name: "Rent Now" });
  await expect(rentButtons.first()).toBeVisible();

  await page
    .getByRole("checkbox", { name: "Electric" })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/fuelTypes=Electric/);

  const cards = page.getByRole("article");
  await expect(cards.first()).toBeVisible();
  for (const card of await cards.all()) {
    await expect(card).toContainText("Electric");
  }
});
