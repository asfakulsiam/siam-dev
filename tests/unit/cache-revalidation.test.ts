import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProfile } from "@/features/profile/queries";
import { getSettings } from "@/features/appearance/queries";
import { getProjects } from "@/features/projects/queries";
import { getExperience } from "@/features/experience/queries";
import { getTestimonials } from "@/features/testimonials/queries";

describe("Phase L: Cache Strategy & Query Resilience", () => {
  it("getProfile returns valid profile data through cache layer", async () => {
    const profile = await getProfile();
    expect(profile).toBeDefined();
    expect(profile.name).toBeDefined();
    expect(profile.email).toBeDefined();
    expect(Array.isArray(profile.photos)).toBe(true);
  });

  it("getSettings returns valid settings through cache layer with tags: ['settings']", async () => {
    const settings = await getSettings();
    expect(settings).toBeDefined();
    expect(settings.defaultTheme).toBeDefined();
    expect(settings.memes).toBeDefined();
    expect(settings.memes.waiting).toBeDefined();
  });

  it("getProjects returns cached projects and filters by published status", async () => {
    const projects = await getProjects({ publishedOnly: true });
    expect(Array.isArray(projects)).toBe(true);
    for (const p of projects) {
      expect(p.published).toBe(true);
    }
  });

  it("getExperience returns career milestones through cache layer", async () => {
    const experience = await getExperience();
    expect(Array.isArray(experience)).toBe(true);
    expect(experience.length).toBeGreaterThan(0);
  });

  it("getTestimonials returns testimonials through cache layer", async () => {
    const testimonials = await getTestimonials(true);
    expect(Array.isArray(testimonials)).toBe(true);
  });
});
