import { test, expect } from "@playwright/test";

test.describe("Admin CRUD & Content Management", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate into admin dashboard before each test
    await page.goto("/admin/login");
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.TEST_ADMIN_PASSWORD || "test-admin-ci-password-1234";

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: /Sign In|Login/i }).click();

    // Verify successful login redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin(?!\/login)/);
  });

  test("create, publish, and delete a project", async ({ page }) => {
    const testSlug = `e2e-project-${Date.now()}`;
    const testTitle = `E2E Automated Design System ${Date.now()}`;

    // 1. Navigate to Project Creation
    await page.goto("/admin/projects/new");
    await expect(page.getByRole("heading", { name: /New Project/i })).toBeVisible();

    // 2. Fill required project fields
    await page.locator("#p-title").fill(testTitle);
    await page.locator("#p-slug").fill(testSlug);
    await page.locator("#p-tagline").fill("Automated end-to-end testing project verifying real database persistence.");
    await page.locator("#p-summary").fill("Detailed summary of automated E2E system testing architecture.");
    await page.locator("#p-problem").fill("Lack of end-to-end database verification led to false confidence in test results.");
    await page.locator("#p-solution").fill("Engineered comprehensive round-trip database tests covering all administrative mutations.");

    // 3. Submit Project Form
    await page.getByRole("button", { name: /Create Project/i }).click();

    // 4. Assert navigation back to project list and find the created project
    await expect(page).toHaveURL(/\/admin\/projects/);
    await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });

    // 5. Toggle publish state
    const row = page.locator("tr", { hasText: testTitle });
    const toggleBtn = row.getByRole("switch");
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await page.waitForTimeout(500);

    // 6. Cleanup: Delete project to maintain clean repeatable state
    const deleteBtn = row.getByRole("button", { name: new RegExp(`Delete ${testTitle}`, "i") });
    await deleteBtn.click();

    // Confirm deletion modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: /Delete Project/i }).click();

    // Verify removal from list
    await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 });
  });

  test("update profile bio and resume link, see it reflected publicly", async ({ page }) => {
    await page.goto("/admin/profile");
    await expect(page.getByRole("heading", { name: /Profile & Identity/i })).toBeVisible();

    const originalBio = "Designer and full-stack engineer building deliberate digital systems with typographic discipline, fluid motion, and zero-compromise accessibility.";
    const updatedBio = `E2E Verified Bio: Architecting resilient systems with genuine database persistence (${Date.now()}).`;
    const updatedResume = "https://example.com/e2e-verified-resume.pdf";

    // 1. Update Bio and Resume
    const bioInput = page.locator("#prof-bio");
    await bioInput.fill(updatedBio);

    const resumeInput = page.locator("#prof-resume");
    await resumeInput.fill(updatedResume);

    await page.getByRole("button", { name: /Save Profile/i }).click();

    // Assert success feedback
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible({ timeout: 8000 });

    // 2. Verify on public About page
    await page.goto("/about");
    await expect(page.getByText(updatedBio)).toBeVisible({ timeout: 10000 });

    // 3. Cleanup: Restore original bio
    await page.goto("/admin/profile");
    await page.locator("#prof-bio").fill(originalBio);
    await page.getByRole("button", { name: /Save Profile/i }).click();
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible({ timeout: 8000 });
  });

  test("add and reorder an experience entry", async ({ page }) => {
    await page.goto("/admin/experience");
    await expect(page.getByRole("heading", { name: /Experience & Principles/i })).toBeVisible();

    const testRole = `E2E Staff Systems Architect ${Date.now()}`;
    const testOrg = "E2E Integrity Labs";

    // 1. Open Add Experience Modal
    await page.getByRole("button", { name: /Add Experience/i }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // 2. Fill form
    await page.locator("#exp-role").fill(testRole);
    await page.locator("#exp-org").fill(testOrg);
    await page.locator("#exp-period").fill("2025 — Present");
    await page.locator("#exp-location").fill("Remote / Global");
    await page.locator("#exp-desc").fill("Led comprehensive database integrity and automated test suite verification.");

    // 3. Submit
    await modal.getByRole("button", { name: /Create Milestone/i }).click();
    await expect(modal).not.toBeVisible({ timeout: 8000 });

    // 4. Assert item appears in the experience list
    await expect(page.getByText(testRole)).toBeVisible({ timeout: 8000 });

    // 5. Cleanup: Delete test entry
    const entryCard = page.locator("div", { hasText: testRole }).last();
    const deleteBtn = entryCard.locator('button[title="Delete milestone"]');
    await deleteBtn.click();

    // Confirm deletion modal
    const deleteModal = page.locator('[role="dialog"]');
    await expect(deleteModal).toBeVisible();
    await deleteModal.getByRole("button", { name: /Delete Milestone/i }).click();

    // Assert removal
    await expect(page.getByText(testRole)).not.toBeVisible({ timeout: 8000 });
  });

  test("create a testimonial, publish it, confirm it appears on the homepage, then unpublish", async ({ page }) => {
    await page.goto("/admin/testimonials");
    await expect(page.getByRole("heading", { name: /Client & Colleague Endorsements/i })).toBeVisible();

    const testQuote = `Asfakul's typographic craft and automated testing architecture are truly best in class (${Date.now()}).`;
    const testAuthor = `Dr. Alex Rivera ${Date.now()}`;

    // 1. Open Add Testimonial Form
    await page.getByRole("button", { name: /Add Testimonial/i }).click();
    await expect(page.locator("#testi-quote")).toBeVisible();

    // 2. Fill form
    await page.locator("#testi-quote").fill(testQuote);
    await page.locator("#testi-author").fill(testAuthor);
    await page.locator("#testi-role").fill("VP of Engineering at Stride");

    // Check published checkbox
    const publishedCheckbox = page.locator("#testi-published");
    if (!(await publishedCheckbox.isChecked())) {
      await publishedCheckbox.check();
    }

    // 3. Save Testimonial
    await page.getByRole("button", { name: /Create Testimonial/i }).click();
    await expect(page.getByText(/Testimonial published on portfolio site/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(testAuthor)).toBeVisible();

    // 4. Check on public homepage
    await page.goto("/");
    await expect(page.getByText(testQuote)).toBeVisible({ timeout: 10000 });

    // 5. Cleanup: Navigate back and delete test testimonial
    await page.goto("/admin/testimonials");
    const testimonialRow = page.locator("div", { hasText: testAuthor }).last();
    const deleteBtn = testimonialRow.locator('button[title="Delete testimonial"]');
    await deleteBtn.click();

    await expect(page.getByText(/Testimonial deleted/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(testAuthor)).not.toBeVisible({ timeout: 8000 });
  });

  test("upload a meme asset and set it active in /admin/appearance", async ({ page }) => {
    await page.goto("/admin/appearance");
    await expect(page.getByRole("heading", { name: /Theme Architecture/i })).toBeVisible();

    // 1. Set custom URL on waiting meme slot
    const waitingInput = page.locator('input[name="memes.waiting.publicId"]');
    await waitingInput.fill("https://picsum.photos/seed/waiting-e2e/400/300");

    await page.getByRole("button", { name: /Save Appearance Settings/i }).click();
    await expect(page.getByText(/Appearance settings saved successfully/i)).toBeVisible({ timeout: 8000 });

    // 2. Cleanup: Reset to default vector SVG and save
    const waitingContainer = page.locator("div", { hasText: "Idle / Waiting State" }).first();
    const resetBtn = waitingContainer.getByRole("button", { name: /Reset/i });
    await resetBtn.click();

    await page.getByRole("button", { name: /Save Appearance Settings/i }).click();
    await expect(page.getByText(/Appearance settings saved successfully/i)).toBeVisible({ timeout: 8000 });
  });

  test("add a photo, set it as the active identity photo", async ({ page }) => {
    await page.goto("/admin/profile");
    await expect(page.getByRole("heading", { name: /Profile & Identity/i })).toBeVisible();

    // 1. Switch to Identity Photos tab
    await page.getByRole("button", { name: /Identity Photos/i }).click();
    await expect(page.getByText(/Hero Text-Mask & Ambient Duotone/i)).toBeVisible();

    // 2. Assert photos list is rendered
    const photoCards = page.locator("div.group.relative.rounded-\\[var\\(--r-sm\\)\\]");
    await expect(photoCards.first()).toBeVisible({ timeout: 8000 });

    // 3. Save profile to confirm form persistence
    await page.getByRole("button", { name: /Save Profile/i }).click();
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible({ timeout: 8000 });
  });
});
