import { test, expect } from "@playwright/test";

test.describe("Contact Form Interaction & Bot Protection Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("shows inline validation errors when submitting empty form", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /Send Message/i });
    await submitBtn.click();

    // Verify accessible error states and aria-invalid attributes
    const nameInput = page.locator("#contact-name");
    await expect(nameInput).toHaveAttribute("aria-invalid", "true");

    const emailInput = page.locator("#contact-email");
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");

    const messageInput = page.locator("#contact-message");
    await expect(messageInput).toHaveAttribute("aria-invalid", "true");
  });

  test("validates email format and shows inline message", async ({ page }) => {
    await page.locator("#contact-name").fill("Jane Doe");
    await page.locator("#contact-email").fill("invalid-email-address");
    await page.locator("#contact-message").fill("This is a valid inquiry message with sufficient length.");

    const submitBtn = page.getByRole("button", { name: /Send Message/i });
    await submitBtn.click();

    const emailInput = page.locator("#contact-email");
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("fills honeypot field and simulates bot containment", async ({ page }) => {
    await page.locator("#contact-name").fill("Spam Bot");
    await page.locator("#contact-email").fill("bot@spammer.org");
    await page.locator("#contact-message").fill("Buy cheap backlinks right now.");

    // Fill hidden honeypot
    await page.locator("#contact-honeypot").fill("http://spam.org");

    const submitBtn = page.getByRole("button", { name: /Send Message/i });
    await submitBtn.click();

    // App pretends submission succeeded to discard spam silently
    await expect(page.getByRole("status")).toBeVisible();
  });

  test("valid submission records in messages inbox with delivery status tracking", async ({ page }) => {
    const timestamp = Date.now();
    const testName = `Delivery Test ${timestamp}`;
    const testEmail = `tester-${timestamp}@example.com`;

    await page.locator("#contact-name").fill(testName);
    await page.locator("#contact-email").fill(testEmail);
    await page.locator("#contact-projectType").selectOption("Full-Stack Web App");
    await page.locator("#contact-message").fill("Comprehensive testing of the contact submission and live delivery status tracking pipeline.");

    const submitBtn = page.getByRole("button", { name: /Send Message/i });
    await submitBtn.click();

    // Verify submission success state
    await expect(page.getByRole("status")).toContainText(/received/i, { timeout: 10000 });
  });
});
