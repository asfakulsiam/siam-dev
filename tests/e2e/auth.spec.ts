import { test, expect } from "@playwright/test";

test.describe("Admin Authentication & Defense-in-Depth Protection", () => {
  const protectedAdminRoutes = [
    "/admin",
    "/admin/projects",
    "/admin/profile",
    "/admin/appearance",
    "/admin/experience",
    "/admin/messages",
    "/admin/testimonials",
  ];

  for (const route of protectedAdminRoutes) {
    test(`unauthenticated visit to ${route} redirects to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/.*\/admin\/login/);
      await expect(page.getByRole("heading", { name: /Admin Login|Sign in/i })).toBeVisible();
    });
  }

  test("shows generic error message on invalid credentials without leaking email existence", async ({ page }) => {
    await page.goto("/admin/login");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.getByRole("button", { name: /Sign In|Login/i });

    await emailInput.fill("wrong-admin@example.com");
    await passwordInput.fill("IncorrectPassword123!");
    await submitBtn.click();

    // Alert with generic error message
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Invalid email or password/i);
  });

  test("unauthenticated request to an admin API route is rejected", async ({ request }) => {
    const res = await request.post("/api/admin/cloudinary-sign", { data: {} });
    expect(res.status()).toBe(401);
  });
});
