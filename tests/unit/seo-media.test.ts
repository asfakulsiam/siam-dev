import { describe, it, expect } from "vitest";
import {
  isCloudinaryUrl,
  parseCloudinaryUrl,
  getOptimizedCloudinaryUrl,
  getBlurPlaceholderUrl,
} from "@/lib/cloudinary";
import {
  generatePersonJsonLd,
  generateWebSiteJsonLd,
  generateProfilePageJsonLd,
  generateProjectJsonLd,
} from "@/lib/json-ld";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { staticProjects } from "@/features/projects/data";

describe("Phase 6: Media & Cloudinary Optimization Utilities", () => {
  const sampleCloudinary =
    "https://res.cloudinary.com/devden/image/upload/v1700000000/projects/aurora-design-system.png";
  const sampleExternal = "https://picsum.photos/seed/test/1200/800";

  it("accurately identifies Cloudinary URLs", () => {
    expect(isCloudinaryUrl(sampleCloudinary)).toBe(true);
    expect(isCloudinaryUrl(sampleExternal)).toBe(false);
    expect(isCloudinaryUrl(null)).toBe(false);
    expect(isCloudinaryUrl(undefined)).toBe(false);
  });

  it("parses Cloudinary URL structure into components", () => {
    const parsed = parseCloudinaryUrl(sampleCloudinary);
    expect(parsed).not.toBeNull();
    expect(parsed?.cloudName).toBe("devden");
    expect(parsed?.resourceType).toBe("image");
    expect(parsed?.deliveryType).toBe("upload");
  });

  it("generates optimized Cloudinary delivery URLs with transformations", () => {
    const optimized = getOptimizedCloudinaryUrl(sampleCloudinary, {
      width: 800,
      height: 450,
      format: "webp",
      quality: "auto",
      crop: "fill",
    });

    expect(optimized).toContain("f_webp");
    expect(optimized).toContain("q_auto");
    expect(optimized).toContain("w_800");
    expect(optimized).toContain("h_450");
    expect(optimized).toContain("c_fill");
  });

  it("generates lightweight LQIP blur placeholder URLs", () => {
    const blurCloudinary = getBlurPlaceholderUrl(sampleCloudinary);
    expect(blurCloudinary).toContain("e_blur:1000");
    expect(blurCloudinary).toContain("w_32");

    const blurExternal = getBlurPlaceholderUrl(sampleExternal);
    expect(blurExternal).toContain("data:image/svg+xml");
  });
});

describe("Phase 6: Schema.org Structured Data (JSON-LD)", () => {
  it("generates valid Person JSON-LD entity with required fields", () => {
    const person = generatePersonJsonLd();
    expect(person["@context"]).toBe("https://schema.org");
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Asfakul");
    expect(person.jobTitle).toContain("Developer");
    expect(person.sameAs.length).toBeGreaterThan(0);
    expect(person.knowsAbout).toBeDefined();
  });

  it("generates valid WebSite JSON-LD entity", () => {
    const website = generateWebSiteJsonLd();
    expect(website["@context"]).toBe("https://schema.org");
    expect(website["@type"]).toBe("WebSite");
    expect(website.url).toBeDefined();
    expect(website.author["@type"]).toBe("Person");
  });

  it("generates valid ProfilePage JSON-LD entity for About view", () => {
    const profilePage = generateProfilePageJsonLd();
    expect(profilePage["@context"]).toBe("https://schema.org");
    expect(profilePage["@type"]).toBe("ProfilePage");
    expect(profilePage.mainEntity["@type"]).toBe("Person");
  });

  it("generates valid CreativeWork JSON-LD for case study projects", () => {
    const project = staticProjects[0]!;
    const creativeWork = generateProjectJsonLd(project);

    expect(creativeWork["@context"]).toBe("https://schema.org");
    expect(creativeWork["@type"]).toBe("CreativeWork");
    expect(creativeWork.name).toBe(project.title);
    expect(creativeWork.headline).toBe(project.tagline);
    expect(creativeWork.url).toContain(project.slug);
    expect(creativeWork.creator["@type"]).toBe("Person");
  });
});

describe("Phase 6: Dynamic Sitemap and Robots.txt", () => {
  it("generates dynamic sitemap with core pages and all project slugs", async () => {
    const sitemapEntries = await sitemap();
    expect(sitemapEntries.length).toBeGreaterThanOrEqual(5);

    const urls = sitemapEntries.map((e: { url: string }) => e.url);
    expect(urls.some((u: string) => u.endsWith("/work"))).toBe(true);
    expect(urls.some((u: string) => u.endsWith("/about"))).toBe(true);
    expect(urls.some((u: string) => u.endsWith("/contact"))).toBe(true);
    expect(urls.some((u: string) => u.includes("/work/stride-design-system"))).toBe(true);
  });

  it("generates compliant robots.txt blocking /admin and referencing sitemap", () => {
    const robotsRules = robots();
    expect(robotsRules.sitemap).toContain("/sitemap.xml");

    const rules = Array.isArray(robotsRules.rules) ? robotsRules.rules : [robotsRules.rules];
    const adminBlocked = rules.some((rule: { disallow?: string | string[] }) =>
      Array.isArray(rule.disallow)
        ? rule.disallow.some((d: string) => d.includes("/admin"))
        : (rule.disallow as string)?.includes("/admin")
    );
    expect(adminBlocked).toBe(true);
  });
});
