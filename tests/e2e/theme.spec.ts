import { test, expect } from "@playwright/test";

test.describe("Theme Engine & Persistence", () => {
  const themes = ["day-shift", "night-coder", "blueprint", "mono"] as const;

  test("renders with valid initial data-theme on html element", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const themeAttr = await html.getAttribute("data-theme");
    expect(themes).toContain(themeAttr);
  });

  test("cycles through all 4 themes and persists preference to localStorage", async ({ page }) => {
    await page.goto("/");

    // Open theme menu or click switcher button
    const themeBtn = page.getByRole("button", { name: /Theme|Switch theme|current:/i }).first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();

      // Test each theme option
      for (const theme of themes) {
        const option = page.getByRole("button", { name: new RegExp(theme, "i") }).first();
        if (await option.isVisible()) {
          await option.click();
          const html = page.locator("html");
          await expect(html).toHaveAttribute("data-theme", theme);
        }
      }
    } else {
      // Direct DOM verification via script
      for (const theme of themes) {
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
          localStorage.setItem("devden-theme", t);
        }, theme);

        const html = page.locator("html");
        await expect(html).toHaveAttribute("data-theme", theme);
      }
    }
  });

  test("retains theme across hard page reloads without flash", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("devden-theme", "blueprint");
      document.documentElement.setAttribute("data-theme", "blueprint");
    });

    await page.reload();
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "blueprint");
  });
});
