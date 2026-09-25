import { test, expect } from "@playwright/test";

test.describe("SEO, Metadata & Discovery Verification", () => {
  test("homepage has valid title, meta description, and open graph tags", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();
    expect(title).toContain("Asfakul");

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });

  test("robots.txt disallows admin routes while allowing public crawling", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Sitemap:");
  });

  test("sitemap.xml is accessible and contains core routes", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/work");
    expect(body).toContain("/about");
    expect(body).toContain("/contact");
    expect(body).not.toContain("/admin");
  });
});
