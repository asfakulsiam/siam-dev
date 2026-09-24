import { describe, it, expect } from "vitest";
import { projectSchema, projectInputSchema } from "@/features/projects/schema";
import { profileSchema, profileInputSchema } from "@/features/profile/schema";
import { experienceItemSchema } from "@/features/experience/schema";
import { contactFormSchema, contactMessageSchema } from "@/features/contact/schema";
import {
  getProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getAllProjectSlugs,
  getAdjacentProjects,
} from "@/features/projects/queries";
import { getProfile, getNow } from "@/features/profile/queries";
import { getExperience, getPrinciples } from "@/features/experience/queries";

describe("Phase 4: Data Layer & Schemas", () => {
  describe("Zod Validation Schemas", () => {
    it("validates a complete project document", () => {
      const validProject = {
        slug: "test-system",
        title: "Test System",
        tagline: "A test project tagline for verification.",
        category: "Design Systems",
        featured: true,
        published: true,
        sortOrder: 1,
        year: "2026",
        timeline: "3 months",
        role: "Lead Engineer",
        client: "Acme Corp",
        summary: "This is a detailed summary of the testing project architecture and metrics.",
        coverImage: {
          src: "https://example.com/image.jpg",
          alt: "Test cover image",
          aspectRatio: "16/9",
        },
        tags: ["React", "TypeScript", "Tailwind"],
        metrics: [{ label: "Speed", value: "99%", description: "Lighthouse" }],
        deliverables: [{ title: "Tokens", description: "Design tokens pipeline" }],
        problem: "Legacy codebase was unmaintainable and broke on release.",
        solution: "Engineered scalable token system with zero regressions.",
        architecture: {
          stack: ["Next.js", "TypeScript"],
          decisions: ["Adopted fluid typography"],
        },
        sections: [
          {
            title: "Phase 1",
            content: ["Built tokens and verified accessibility."],
          },
        ],
      };

      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it("rejects invalid project slug or category", () => {
      const invalidProject = {
        slug: "INVALID SLUG WITH SPACES",
        title: "Invalid",
        tagline: "Short",
        category: "NonExistentCategory",
      };

      const result = projectInputSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path[0]);
        expect(issues).toContain("slug");
        expect(issues).toContain("category");
      }
    });

    it("validates profile schema and now section", () => {
      const validProfile = {
        name: "Asfakul",
        headline: "I design and build websites.",
        subheadline: "Web designer and full-stack developer.",
        bio: "Senior engineer focusing on design systems and high-contrast web performance.",
        location: "Dhaka, Bangladesh",
        timezone: "Asia/Dhaka",
        availability: { open: true, text: "Available for contract" },
        email: "test@example.com",
        socials: [{ label: "GitHub", url: "https://github.com" }],
        resume: { url: "https://example.com/resume.pdf", updatedAt: "Sept 2026" },
        now: {
          title: "Building Dev Den",
          body: "Focusing on data architecture.",
          updatedAt: "Today",
        },
        toolbox: [{ group: "Frontend", items: ["React", "Next.js"] }],
      };

      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);

      const invalidEmail = { ...validProfile, email: "not-an-email" };
      expect(profileInputSchema.safeParse(invalidEmail).success).toBe(false);
    });

    it("validates experience item and contact message schema", () => {
      const validExp = {
        id: "exp-test",
        role: "Senior Engineer",
        organization: "Studio Acme",
        period: "2024 — Present",
        location: "Remote",
        type: "Contract",
        description: "Architected component systems and reduced load times.",
        achievements: ["Reduced LCP by 50%"],
        skills: ["TypeScript", "Next.js"],
        sortOrder: 0,
      };

      expect(experienceItemSchema.safeParse(validExp).success).toBe(true);

      const validMessage = {
        name: "Jane Doe",
        email: "jane@example.com",
        projectType: "Full-Stack Web App",
        message: "Hello Asfakul, let's discuss a potential project for our engineering team.",
        honeypot: "",
        ipHash: "a".repeat(64),
        status: "unread",
        createdAt: new Date().toISOString(),
      };

      expect(contactMessageSchema.safeParse(validMessage).success).toBe(true);
    });
  });

  describe("Server Query Helpers (with Fallback)", () => {
    it("retrieves published projects and handles category filtering", async () => {
      const allProjects = await getProjects();
      expect(allProjects.length).toBeGreaterThan(0);

      const designSystems = await getProjects({ category: "Design Systems" });
      expect(designSystems.length).toBeGreaterThan(0);
      designSystems.forEach((p) => {
        expect(p.category).toBe("Design Systems");
      });
    });

    it("retrieves featured projects", async () => {
      const featured = await getFeaturedProjects();
      expect(featured.length).toBeGreaterThan(0);
      featured.forEach((p) => {
        expect(p.featured).toBe(true);
      });
    });

    it("retrieves project by slug and returns null for missing", async () => {
      const found = await getProjectBySlug("stride-design-system");
      expect(found).not.toBeNull();
      expect(found?.title).toBe("Stride Design System");

      const notFound = await getProjectBySlug("non-existent-slug-xyz");
      expect(notFound).toBeNull();
    });

    it("retrieves adjacent projects properly", async () => {
      const slugs = await getAllProjectSlugs();
      expect(slugs.length).toBeGreaterThan(1);

      const firstSlug = slugs[0];
      const lastSlug = slugs[slugs.length - 1];
      if (!firstSlug || !lastSlug) {
        throw new Error("Missing slugs in test dataset");
      }

      const adjFirst = await getAdjacentProjects(firstSlug);
      expect(adjFirst.prev).toBeNull();
      expect(adjFirst.next).not.toBeNull();

      const adjLast = await getAdjacentProjects(lastSlug);
      expect(adjLast.prev).not.toBeNull();
      expect(adjLast.next).toBeNull();
    });

    it("retrieves profile, now, experience, and principles", async () => {
      const profile = await getProfile();
      expect(profile.name).toBe("Asfakul");
      expect(profile.timezone).toBe("Asia/Dhaka");

      const now = await getNow();
      expect(now.title).toBeDefined();

      const experience = await getExperience();
      expect(experience.length).toBeGreaterThan(0);

      const principles = await getPrinciples();
      expect(principles.length).toBeGreaterThan(0);
    });
  });
});
