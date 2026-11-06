import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Open Support Ledger");
  await expect(
    page.getByRole("heading", { name: "Open Support Ledger" }),
  ).toBeVisible();
});
