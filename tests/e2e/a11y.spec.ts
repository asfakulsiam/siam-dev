import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/work", "/about", "/contact", "/admin/login"];
const THEMES = ["day-shift", "night-coder", "blueprint", "mono"] as const;

test.describe("WCAG 2.2 AA Accessibility Audits (@axe-core/playwright)", () => {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route} in ${theme} theme has zero critical a11y violations`, async ({ page }) => {
        await page.goto(route);
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
        }, theme);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();

        const criticalViolations = accessibilityScanResults.violations.filter(
          (v) => v.impact === "critical" || v.impact === "serious",
        );

        expect(criticalViolations).toEqual([]);
      });
    }
  }
});
