import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/features/contact/schema";

describe("Contact Form Validation Schema", () => {
  it("passes validation with valid data", () => {
    const input = {
      name: "Alex Vance",
      email: "alex@example.com",
      projectType: "Full-Stack Web App" as const,
      timeline: "1–3 months",
      message: "We need an architectural redesign of our multi-brand design system.",
      honeypot: "",
    };

    const result = contactFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  describe("Required Name Field Validation", () => {
    it("fails validation if name is empty", () => {
      const input = {
        name: "",
        email: "alex@example.com",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/name/i);
      }
    });

    it("fails validation if name contains only whitespace", () => {
      const input = {
        name: "   ",
        email: "alex@example.com",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("fails validation if name is too short (< 2 characters)", () => {
      const input = {
        name: "A",
        email: "alex@example.com",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/at least 2 characters/i);
      }
    });

    it("fails validation if name exceeds 100 characters", () => {
      const input = {
        name: "A".repeat(101),
        email: "alex@example.com",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("Required Email Field & Proper Format Validation", () => {
    it("fails validation if email is empty", () => {
      const input = {
        name: "Alex Vance",
        email: "",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/email/i);
      }
    });

    it("fails validation if email format is missing @ symbol", () => {
      const input = {
        name: "Alex Vance",
        email: "not-an-email",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/valid email/i);
      }
    });

    it("fails validation if email is missing top-level domain (e.g. user@domain)", () => {
      const input = {
        name: "Alex Vance",
        email: "user@domain",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("fails validation if email has spaces or invalid characters", () => {
      const input = {
        name: "Alex Vance",
        email: "alex vance@example.com",
        projectType: "Design System" as const,
        message: "Valid length message explaining the project requirements.",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("passes validation for various valid email formats", () => {
      const validEmails = [
        "jane.doe@company.org",
        "alex+dev@domain.co.uk",
        "founder@studio.design",
        "first_last@tech.io",
      ];

      for (const email of validEmails) {
        const result = contactFormSchema.safeParse({
          name: "Test User",
          email,
          projectType: "Frontend Engineering",
          message: "A detailed description of the project needs and technical scope.",
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("Required Message Field Validation", () => {
    it("fails validation if message is empty", () => {
      const input = {
        name: "Alex Vance",
        email: "alex@example.com",
        projectType: "Design System" as const,
        message: "",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("fails validation if message is too short (< 10 characters)", () => {
      const input = {
        name: "Alex Vance",
        email: "alex@example.com",
        projectType: "Design System" as const,
        message: "Too short",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/at least 10 characters/i);
      }
    });

    it("fails validation if message exceeds 3,000 characters", () => {
      const input = {
        name: "Alex Vance",
        email: "alex@example.com",
        projectType: "Design System" as const,
        message: "a".repeat(3001),
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("Bot Containment & Honeypot", () => {
    it("fails validation if honeypot is filled by bot", () => {
      const input = {
        name: "Spam Bot",
        email: "spambot@example.com",
        projectType: "Other" as const,
        message: "Buy cheap crypto right now at this malicious URL!",
        honeypot: "http://spam.example.com",
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
