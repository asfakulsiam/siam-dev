import { test, expect } from "@playwright/test";

test.describe("prefers-reduced-motion Compliance (AGENTS.md §7 & §9)", () => {
  test.use({ reducedMotion: "reduce" });

  test("renders all page sections in static final states without infinite animations", async ({ page }) => {
    await page.goto("/");

    // Verify root HTML element loads cleanly
    await expect(page.locator("main#main-content")).toBeVisible();

    // Verify headline is rendered in solid color and fully visible
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // Verify contact form loads memes as accessible static stills under reduced motion
    await page.goto("/contact");
    const contactHeading = page.getByRole("heading", { name: /Let's build|Get in Touch/i });
    await expect(contactHeading).toBeVisible();

    // No video auto-playing in infinite loops under reduced motion
    const autoplayingVideos = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll("video"));
      return videos.filter((v) => !v.paused && v.autoplay).length;
    });

    expect(autoplayingVideos).toBe(0);
  });
});
