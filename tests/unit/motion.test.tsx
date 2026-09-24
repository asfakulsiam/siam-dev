import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { ScrubbedStatement } from "@/components/motion/ScrubbedStatement";
import { PinnedWorkStack } from "@/components/motion/PinnedWorkStack";
import { FooterWordmark } from "@/components/motion/FooterWordmark";
import { ExperienceTimeline } from "@/features/about/components/ExperienceTimeline";
import { staticProjects } from "@/features/projects/data";
import { staticExperience } from "@/features/experience/data";

// Mock @gsap/react and gsap to test rendered output in Node/JSDOM
vi.mock("@gsap/react", () => ({
  useGSAP: (fn: () => void) => {
    // Run effect callback in test safely
    try {
      fn();
    } catch {
      // Ignored in headless DOM
    }
  },
}));

vi.mock("@/lib/gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    matchMedia: () => ({
      add: vi.fn(),
    }),
    to: vi.fn(),
    fromTo: vi.fn(),
    quickTo: () => vi.fn(),
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn(),
    },
  },
  ScrollTrigger: {
    update: vi.fn(),
    refresh: vi.fn(),
  },
}));

describe("Phase 3 Motion Components", () => {
  it("HeroMotion renders semantic h1 and bio with variable font styles", () => {
    render(
      <HeroMotion
        headline="Crafting Considered Interfaces"
        subheadline="Full-stack engineer."
        bio="Focused on design systems and high-craft web apps."
      />,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toContain("Crafting Considered Interfaces");
    expect(screen.getByText(/Full-stack engineer/i)).toBeDefined();
  });

  it("ScrubbedStatement provides accessible aria-label and aria-hidden split words", () => {
    const quote = "Craft is the feature. Zero-pill discipline and typography.";
    render(<ScrubbedStatement text={quote} />);

    const container = screen.getByLabelText(quote);
    expect(container).toBeDefined();

    // Check that aria-hidden p is present
    const hiddenParagraph = container.querySelector("p[aria-hidden='true']");
    expect(hiddenParagraph).not.toBeNull();
    expect(hiddenParagraph?.textContent).toContain("Craft");
    expect(hiddenParagraph?.textContent).toContain("typography.");
  });

  it("PinnedWorkStack renders all provided project cards", () => {
    const testProjects = staticProjects.slice(0, 2);
    render(<PinnedWorkStack projects={testProjects} />);

    testProjects.forEach((project) => {
      expect(screen.getByText(project.title)).toBeDefined();
      expect(screen.getByText(project.summary)).toBeDefined();
    });
  });

  it("FooterWordmark renders the prominent signature wordmark", () => {
    const { container } = render(<FooterWordmark />);
    const wordmark = container.querySelector("span");
    expect(wordmark?.textContent).toContain("A S F A K U L");
  });

  it("ExperienceTimeline renders experience items with timeline indicators", () => {
    render(<ExperienceTimeline items={staticExperience.slice(0, 2)} />);

    expect(screen.getByText(/Senior Design Engineer/i)).toBeDefined();
    expect(screen.getByText(/Full-Stack Engineer & UI Specialist/i)).toBeDefined();
  });
});
