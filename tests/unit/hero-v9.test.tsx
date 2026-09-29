import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SplitHero } from "@/components/motion/SplitHero";

describe("Hero Redesign v9 (Figma-Referenced Split Frame): Typographic Overlap & Secondary Photo", () => {
  const baseProps = {
    name: "Asfakul",
    metaRow: <span data-testid="meta">Available</span>,
    actions: <div data-testid="cta-row"><button type="button">Explore Work</button></div>,
  };

  it("handles variable headline lengths and renders overlap word in desktop typography flow without floating collision", () => {
    // Short headline
    const { container, rerender } = render(
      <SplitHero
        {...baseProps}
        headline="Crafting web applications."
        subheadline="Web designer and full-stack developer."
        primaryPhoto={{
          publicId: "devden/portraits/sample-1",
          alt: "Portrait of Asfakul",
          accentColor: "#8AA2FF",
        }}
      />,
    );

    // Overlap word rendered with z-30 in desktop flow
    const overlapEl = container.querySelector(".z-30.whitespace-nowrap");
    expect(overlapEl).toBeDefined();
    expect(overlapEl?.textContent).toBe("applications.");

    // Rerender with significantly longer headline
    rerender(
      <SplitHero
        {...baseProps}
        headline="I design and engineer performant, accessible digital products and systems that feel considered."
        subheadline="Longer narrative subheadline to test line wraps and clearance calculations."
        primaryPhoto={{
          publicId: "devden/portraits/sample-1",
          alt: "Portrait of Asfakul",
          accentColor: "#8AA2FF",
        }}
      />,
    );

    // Overlap word correctly extracted for longer headline
    const overlapEl2 = container.querySelector(".z-30.whitespace-nowrap");
    expect(overlapEl2?.textContent).toBe("considered.");
    // Accessible heading still matches complete full headline
    expect(
      screen.getByRole("heading", {
        name: /I design and engineer performant, accessible digital products and systems that feel considered\./i,
      }),
    ).toBeDefined();
  });

  it("omits secondary photo card when no secondary photo is assigned (no placeholder box)", () => {
    const { container } = render(
      <SplitHero
        {...baseProps}
        headline="I design and build websites that feel considered."
        primaryPhoto={{
          publicId: "devden/portraits/sample-1",
          alt: "Primary photo only",
        }}
        secondaryPhoto={null}
      />,
    );

    // Exactly one image rendered (primary), zero secondary cards
    const images = container.querySelectorAll("img");
    expect(images.length).toBe(1);
    expect(container.querySelector(".rotate-\\[-4deg\\]")).toBeNull();
  });

  it("renders secondary photo inside panel bounds with -4deg tilt when assigned", () => {
    const { container } = render(
      <SplitHero
        {...baseProps}
        headline="I design and build websites that feel considered."
        primaryPhoto={{
          publicId: "devden/portraits/sample-1",
          alt: "Primary photo",
        }}
        secondaryPhoto={{
          publicId: "devden/portraits/sample-2",
          alt: "Secondary photo candid",
        }}
      />,
    );

    // Both images rendered
    const images = container.querySelectorAll("img");
    expect(images.length).toBe(2);

    // Secondary card exists with tilt
    const tiltedCard = container.querySelector(".rotate-\\[-4deg\\]");
    expect(tiltedCard).not.toBeNull();
  });

  it("stacks vertically below lg and renders standard headline cleanly", () => {
    const { container } = render(
      <SplitHero
        {...baseProps}
        headline="I design and build websites that feel considered."
        primaryPhoto={{
          publicId: "devden/portraits/sample-1",
          alt: "Primary photo",
        }}
      />,
    );

    // Mobile span contains full headline text without split
    const mobileSpan = container.querySelector(".lg\\:hidden");
    expect(mobileSpan?.textContent).toBe("I design and build websites that feel considered.");

    // Desktop split is hidden on mobile screens
    const desktopSpan = container.querySelector(".hidden.lg\\:inline");
    expect(desktopSpan).not.toBeNull();
  });
});
