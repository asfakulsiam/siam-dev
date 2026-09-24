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

  it("fails validation if name is too short", () => {
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

  it("fails validation if email format is invalid", () => {
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

  it("fails validation if message is too short", () => {
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
