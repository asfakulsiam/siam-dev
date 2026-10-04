import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { FloatingSkillBadges } from "@/components/motion/FloatingSkillBadges";
import { skillBadgeSchema, profileSchema } from "@/features/profile/schema";
import { CutoutHero } from "@/components/motion/CutoutHero";
import { SplitHero } from "@/components/motion/SplitHero";

describe("Phase AA: Floating Skill Badges & 5-Theme Resolution", () => {
  it("validates skillBadgeSchema correctly", () => {
    const validBadge = { label: "TypeScript", order: 0 };
    expect(skillBadgeSchema.safeParse(validBadge).success).toBe(true);

    const emptyBadge = { label: "" };
    expect(skillBadgeSchema.safeParse(emptyBadge).success).toBe(false);

    const longBadge = { label: "This is a super long label exceeding twenty four characters" };
    expect(skillBadgeSchema.safeParse(longBadge).success).toBe(false);
  });

  it("limits heroSkillBadges to max 5 in profileSchema", () => {
    const badges = [
      { label: "Design Systems" },
      { label: "TypeScript" },
      { label: "Next.js" },
      { label: "Tailwind" },
      { label: "GSAP" },
    ];
    const valid = profileSchema.safeParse({
      name: "Asfakul",
      headline: "Designer & Engineer",
      subheadline: "Creating web products",
      bio: "Full stack product builder",
      location: "Dhaka",
      timezone: "Asia/Dhaka",
      availability: { open: true, text: "Available" },
      email: "test@example.com",
      resume: { url: "https://example.com/resume.pdf", updatedAt: "2026" },
      now: { title: "Now", body: "Building Dev Den", updatedAt: "2026" },
      heroSkillBadges: badges,
    });
    expect(valid.success).toBe(true);

    const tooMany = profileSchema.safeParse({
      name: "Asfakul",
      headline: "Designer & Engineer",
      subheadline: "Creating web products",
      bio: "Full stack product builder",
      location: "Dhaka",
      timezone: "Asia/Dhaka",
      availability: { open: true, text: "Available" },
      email: "test@example.com",
      resume: { url: "https://example.com/resume.pdf", updatedAt: "2026" },
      now: { title: "Now", body: "Building Dev Den", updatedAt: "2026" },
      heroSkillBadges: [...badges, { label: "Excess" }],
    });
    expect(tooMany.success).toBe(false);
  });

  it("renders FloatingSkillBadges when badges are present and caps to 5", () => {
    const badges = [
      { label: "TypeScript" },
      { label: "Design Systems" },
      { label: "Next.js" },
    ];
    const { container } = render(<FloatingSkillBadges badges={badges} />);
    const chips = container.querySelectorAll("[data-skill-chip]");
    expect(chips.length).toBe(3);
    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("Design Systems")).toBeDefined();
    expect(screen.getByText("Next.js")).toBeDefined();
  });

  it("renders nothing when badges array is empty or undefined", () => {
    const { container } = render(<FloatingSkillBadges badges={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders FloatingSkillBadges in CutoutHero", () => {
    const { container } = render(
      <CutoutHero
        name="Asfakul"
        headline="Crafting web applications."
        metaRow={<span>Available</span>}
        actions={<button type="button">Explore</button>}
        skillBadges={[{ label: "TypeScript" }, { label: "Design Systems" }]}
      />,
    );
    const chips = container.querySelectorAll("[data-skill-chip]");
    expect(chips.length).toBe(2);
    expect(screen.getByText("TypeScript")).toBeDefined();
  });

  it("renders FloatingSkillBadges in SplitHero", () => {
    const { container } = render(
      <SplitHero
        name="Asfakul"
        headline="Crafting web applications."
        metaRow={<span>Available</span>}
        actions={<button type="button">Explore</button>}
        skillBadges={[{ label: "Next.js" }]}
        primaryPhoto={{ publicId: "test-photo", alt: "Test photo" }}
      />,
    );
    const chips = container.querySelectorAll("[data-skill-chip]");
    expect(chips.length).toBe(1);
    expect(screen.getByText("Next.js")).toBeDefined();
  });
});
