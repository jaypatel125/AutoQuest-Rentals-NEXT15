import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const STATE_PATH = "playwright/.auth/user.json";
test("UI login via /sign-in and save storageState", async ({
  page,
  baseURL,
  context,
}) => {
  if (!baseURL) throw new Error("baseURL is required");
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  await page.goto(`${baseURL}/signin`);
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(process.env.EMAIL as string);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.PASSWORD as string);

  await Promise.all([
    page.waitForLoadState("networkidle"),
    page.getByRole("button", { name: /^sign in$/i }).click(),
  ]);
  const res = await page.request.get("/api/auth/get-session", {
    headers: { accept: "application/json" },
  });
  if (!res.ok()) {
    throw new Error(
      `get-session failed: ${res.status()} ${res.statusText()}\n${await res.text()}`
    );
  }
  await page.waitForURL("/");
  await context.storageState({ path: STATE_PATH });
});
