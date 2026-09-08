import { expect, test } from "@playwright/test";

test("opens the news to vehicle to source vertical slice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /News is input/i })).toBeVisible();
  await page.getByRole("link", { name: "View all" }).click();
  await expect(page).toHaveURL(/\/news$/);
  await page.getByRole("link", { name: /ZEEKR launches the 7X/i }).click();
  await expect(page).toHaveURL(/\/news\/zeekr-7x-launch$/);
  await expect(page.getByRole("heading", { name: /ZEEKR launches the 7X/i })).toBeVisible();
  await expect(page.getByText("CAA Editorial")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related events" })).toBeVisible();
  await page
    .getByRole("link", { name: /ZEEKR 7X/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/vehicles\/zeekr-7x$/);
  await expect(page.getByRole("heading", { name: "ZEEKR 7X", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Market specifications" })).toBeVisible();
  await expect(page.getByText(/605 km CLTC/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
});

test("returns a not-found page for an unknown vehicle", async ({ page }) => {
  const response = await page.goto("/vehicles/not-a-real-vehicle");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/not found/i).first()).toBeVisible();
});
