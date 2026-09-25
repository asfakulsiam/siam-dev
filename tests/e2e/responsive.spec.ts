import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 360, height: 800, label: "Mobile Small" },
  { width: 768, height: 1024, label: "Tablet Portrait" },
  { width: 1024, height: 768, label: "Tablet Landscape" },
  { width: 1440, height: 900, label: "Desktop Standard" },
  { width: 1920, height: 1080, label: "Ultrawide Large" },
];

const ROUTES = ["/", "/work", "/about", "/contact"];

test.describe("Responsive Viewport & No Horizontal Scroll (AGENTS.md §8)", () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.label} (${vp.width}x${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of ROUTES) {
        test(`route ${route} has no horizontal overflow`, async ({ page }) => {
          await page.goto(route);
          await page.waitForLoadState("domcontentloaded");

          const hasOverflow = await page.evaluate(() => {
            const docWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyScrollWidth = document.body.scrollWidth;
            return scrollWidth > docWidth + 1 || bodyScrollWidth > docWidth + 1;
          });

          expect(hasOverflow).toBe(false);
        });
      }
    });
  }
});
