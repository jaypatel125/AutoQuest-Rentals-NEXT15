import { test, expect } from "@playwright/test";
import { searchTrip } from "./helpers";

test("book an electric vehicle and pay with a Stripe test card", async ({
  page,
}) => {
  await searchTrip(page);

  await page
    .getByRole("checkbox", { name: "Electric" })
    .filter({ visible: true })
    .click();
  await page.getByRole("button", { name: "Rent Now" }).first().click();

  // Electric cars skip the EV upsell and go straight to checkout.
  await expect(page).toHaveURL(/\/checkout$/);
  const payButton = page.getByRole("button", { name: /pay now/i });
  await expect(payButton).toBeDisabled();
  await page
    .getByRole("checkbox", { name: /i agree to the rental terms/i })
    .click();
  await payButton.click();

  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 });
  await page
    .getByRole("textbox", { name: "Card number" })
    .fill("4242 4242 4242 4242");
  await page.getByRole("textbox", { name: "Expiration" }).fill("04 / 44");
  await page.getByRole("textbox", { name: "CVC" }).fill("444");
  await page.getByRole("textbox", { name: "Cardholder name" }).fill("John");
  await page.getByRole("textbox", { name: "Postal code" }).fill("L9C 3P3");
  await page.getByTestId("hosted-payment-submit-button").click();

  await page.waitForURL(/\/confirmation/, { timeout: 30000 });
  await expect(page.getByText("Booking Confirmed")).toBeVisible({
    timeout: 20000,
  });
});
