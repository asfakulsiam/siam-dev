import { test, expect } from "@playwright/test";

test.describe("Admin Layout & UI Primitives", () => {
  test("admin login page renders complete accessible form", async ({ page }) => {
    await page.goto("/admin/login");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.getByRole("button", { name: /Sign In|Login/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });
});
