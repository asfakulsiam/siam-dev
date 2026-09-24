import { describe, it, expect, vi } from "vitest";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  togglePublishAction,
} from "@/features/projects/actions";
import { updateProfileAction, updateNowAction } from "@/features/profile/actions";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/features/experience/actions";
import { submitContactAction } from "@/features/contact/actions";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["x-forwarded-for", "127.0.0.1"]])),
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined), // No admin session cookie by default
  })),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

describe("Phase 4: Server Actions & Authorization Guards", () => {
  describe("Admin Authorization Enforcement", () => {
    it("rejects unauthenticated createProjectAction", async () => {
      const res = await createProjectAction({
        slug: "unauthorized-project",
        title: "Test",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("rejects unauthenticated updateProjectAction", async () => {
      const res = await updateProjectAction("stride-design-system", { title: "Updated" });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("rejects unauthenticated deleteProjectAction", async () => {
      const res = await deleteProjectAction("stride-design-system");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("rejects unauthenticated togglePublishAction", async () => {
      const res = await togglePublishAction("stride-design-system", false);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("rejects unauthenticated updateProfileAction and updateNowAction", async () => {
      const resProfile = await updateProfileAction({ name: "Hacker" });
      expect(resProfile.ok).toBe(false);
      if (!resProfile.ok) {
        expect(resProfile.error).toContain("Unauthorized");
      }

      const resNow = await updateNowAction({ title: "Updated", body: "test", updatedAt: "today" });
      expect(resNow.ok).toBe(false);
      if (!resNow.ok) {
        expect(resNow.error).toContain("Unauthorized");
      }
    });

    it("rejects unauthenticated experience mutations", async () => {
      const resCreate = await createExperienceAction({ id: "exp-hack", role: "Bad" });
      expect(resCreate.ok).toBe(false);

      const resUpdate = await updateExperienceAction("exp-1", { role: "Bad" });
      expect(resUpdate.ok).toBe(false);

      const resDelete = await deleteExperienceAction("exp-1");
      expect(resDelete.ok).toBe(false);
    });
  });

  describe("Public Contact Action Flow", () => {
    it("rejects contact submission with invalid fields", async () => {
      const res = await submitContactAction({
        name: "A", // Too short
        email: "not-an-email",
        projectType: "Full-Stack Web App",
        message: "Short",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("highlighted form errors");
        expect(res.errors).toBeDefined();
      }
    });

    it("detects and rejects bot honeypot traps", async () => {
      const res = await submitContactAction({
        name: "Spam Bot",
        email: "bot@spammer.com",
        projectType: "Full-Stack Web App",
        message: "We offer cheap SEO and link building services.",
        honeypot: "I am a bot filling hidden fields",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Spam submission detected");
      }
    });

    it("accepts valid contact submission and returns polite success response", async () => {
      const res = await submitContactAction({
        name: "Sarah Chen",
        email: "sarah@acme.corp",
        projectType: "Design System",
        timeline: "2 months",
        message: "We are looking for a senior engineer to audit and refactor our design tokens.",
        honeypot: "",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.message).toContain("received");
      }
    });
  });
});
