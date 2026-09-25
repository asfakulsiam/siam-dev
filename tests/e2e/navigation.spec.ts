import { test, expect } from "@playwright/test";

test.describe("Public Navigation & Shell Flow", () => {
  test("loads homepage and verifies skip-to-content link", async ({ page }) => {
    await page.goto("/");

    // Skip to content link
    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toHaveAttribute("href", "#main-content");
    await expect(skipLink).toContainText("Skip to main content");

    // Header nav links
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: "Work", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "About", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Contact", exact: true })).toBeVisible();

    // Main landmark
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();
  });

  test("navigates across all public routes smoothly", async ({ page }) => {
    await page.goto("/");

    // Navigate to Work
    await page.getByRole("link", { name: "Work", exact: true }).first().click();
    await expect(page).toHaveURL(/.*\/work/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Navigate to About
    await page.getByRole("link", { name: "About", exact: true }).first().click();
    await expect(page).toHaveURL(/.*\/about/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Navigate to Contact
    await page.getByRole("link", { name: "Contact", exact: true }).first().click();
    await expect(page).toHaveURL(/.*\/contact/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("handles 404 routes gracefully with custom not-found page", async ({ page }) => {
    await page.goto("/non-existent-page-url-xyz", { failOnStatusCode: false });
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Page Not Found|404/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Return Home/i })).toBeVisible();
  });
});
