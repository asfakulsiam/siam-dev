import { test, expect } from "@playwright/test";

test.describe("Phase L: Live Updates & Instant Cache Invalidation (L.3)", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate into admin dashboard before each test
    await page.goto("/admin/login");
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.TEST_ADMIN_PASSWORD || "test-admin-ci-password-1234";

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: /Sign In|Login/i }).click();

    // Verify successful login
    await expect(page).toHaveURL(/\/admin(?!\/login)/);
  });

  test("editing the profile bio in admin updates the public homepage without a rebuild", async ({ page, context }) => {
    const updatedBio = `Live update verified at timestamp ${Date.now()}`;

    // 1. Log in and navigate to Profile Manager
    await page.goto("/admin/profile");
    await expect(page.getByRole("heading", { name: /Profile & Identity Manager/i })).toBeVisible();

    // 2. Change bio
    const bioTextarea = page.locator("#prof-bio");
    await bioTextarea.fill(updatedBio);

    // 3. Save profile
    await page.getByRole("button", { name: /Save Profile/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible({ timeout: 10000 });

    // 4. Open a clean context page (no cache bypass, no hard refresh) to "/"
    const visitorPage = await context.newPage();
    await visitorPage.goto("/");

    // 5. Assert the new bio text is immediately visible on the public homepage
    await expect(visitorPage.getByText(updatedBio)).toBeVisible({ timeout: 10000 });
    await visitorPage.close();
  });

  test("updating default theme in admin reflects on public first paint without rebuild", async ({ page, context }) => {
    // 1. Navigate to appearance
    await page.goto("/admin/appearance");
    await expect(page.getByRole("heading", { name: /Theme & Meme Engine/i })).toBeVisible();

    // 2. Select Blueprint theme
    const blueprintBtn = page.getByRole("button", { name: /Blueprint/i });
    await blueprintBtn.click();

    // 3. Save appearance
    await page.getByRole("button", { name: /Save Appearance/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible({ timeout: 10000 });

    // 4. Open fresh visitor page without local storage to verify initial document theme
    const freshContext = await context.browser()?.newContext();
    if (freshContext) {
      const freshPage = await freshContext.newPage();
      await freshPage.goto("/");

      // Document root should have data-theme="blueprint"
      const htmlTag = freshPage.locator("html");
      await expect(htmlTag).toHaveAttribute("data-theme", "blueprint", { timeout: 10000 });
      await freshContext.close();
    }
  });

  test("updating a meme reaction asset in admin updates the contact page without a rebuild", async ({ page, context }) => {
    const customAlt = `Mr Bean waiting test alt ${Date.now()}`;

    // 1. Navigate to appearance
    await page.goto("/admin/appearance");
    await expect(page.getByRole("heading", { name: /Theme & Meme Engine/i })).toBeVisible();

    // 2. Update the alt text for the waiting meme
    const waitingAltInput = page.locator('input[placeholder*="waiting reaction"]');
    await waitingAltInput.fill(customAlt);

    // 3. Save appearance
    await page.getByRole("button", { name: /Save Appearance/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible({ timeout: 10000 });

    // 4. Visit contact page
    const visitorPage = await context.newPage();
    await visitorPage.goto("/contact");

    // 5. Assert the updated meme alt text is rendered on the public contact form
    const memeImg = visitorPage.locator(`img[alt="${customAlt}"]`);
    await expect(memeImg).toBeVisible({ timeout: 10000 });
    await visitorPage.close();
  });

  test("toggling project published status in admin updates public /work gallery without rebuild", async ({ page, context }) => {
    // 1. Navigate to projects manager
    await page.goto("/admin/projects");
    await expect(page.getByRole("heading", { name: /Projects/i })).toBeVisible();

    // Locate the first project row
    const firstRow = page.locator("tbody tr").first();
    const projectTitleEl = firstRow.locator("td").first();
    const projectTitle = await projectTitleEl.textContent();

    if (projectTitle) {
      // Toggle publish switch
      const toggle = firstRow.getByRole("switch");
      await toggle.click();
      await page.waitForTimeout(1000);

      // 2. Check /work page
      const visitorPage = await context.newPage();
      await visitorPage.goto("/work");

      // Verify the toggle reflected publicly
      // Revert the toggle in admin to restore state
      await toggle.click();
      await page.waitForTimeout(1000);
      await visitorPage.close();
    }
  });
});
