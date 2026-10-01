import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CutoutHero } from "@/components/motion/CutoutHero";
import { heroCutoutSchema, profileSchema } from "@/features/profile/schema";
import { staticSettings } from "@/features/appearance/data";

describe("Phase S: Full-Bleed Cutout Hero Mode", () => {
  const mockProps = {
    name: "Asfakul",
    headline: "I design and build digital products that feel considered.",
    subheadline: "Web designer and full-stack developer.",
    bio: "Focusing on fluid type systems and micro-interactions.",
    metaRow: <span data-testid="test-meta">Available for contracts</span>,
    actions: <button type="button">Explore Work</button>,
    cutout: {
      light: {
        publicId: "data:image/svg+xml;utf8,<svg id='cutout-light'></svg>",
        alt: "Asfakul light cutout",
      },
      dark: {
        publicId: "data:image/svg+xml;utf8,<svg id='cutout-dark'></svg>",
        alt: "Asfakul dark cutout",
      },
    },
  };

  it("renders full-bleed cutout hero with headline, meta, and actions", () => {
    render(<CutoutHero {...mockProps} />);

    expect(
      screen.getByRole("heading", {
        name: /Asfakul — I design and build digital products that feel considered\./i,
      }),
    ).toBeDefined();

    expect(screen.getByTestId("test-meta")).toBeDefined();
    expect(screen.getByRole("button", { name: "Explore Work" })).toBeDefined();
    expect(screen.getByText(/Web designer and full-stack developer\./i)).toBeDefined();
  });

  it("renders light cutout in light theme (day-shift default)", () => {
    document.documentElement.setAttribute("data-theme", "day-shift");
    render(<CutoutHero {...mockProps} />);

    const img = screen.getByAltText("Asfakul light cutout");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toContain("cutout-light");
  });

  it("renders dark cutout in dark theme (night-coder)", () => {
    document.documentElement.setAttribute("data-theme", "night-coder");
    render(<CutoutHero {...mockProps} />);

    const img = screen.getByAltText("Asfakul dark cutout");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toContain("cutout-dark");
  });

  it("renders clean text-only layout when zero cutout photos are assigned", () => {
    const { container } = render(
      <CutoutHero
        name="Asfakul"
        headline="I design and build digital products that feel considered."
        subheadline="Web designer and full-stack developer."
        metaRow={<span data-testid="meta">Available</span>}
        actions={<button type="button">Explore</button>}
        cutout={null}
        cutoutPhoto={null}
      />,
    );

    expect(screen.getByRole("heading")).toBeDefined();
    expect(container.querySelectorAll("img").length).toBe(0);
  });

  it("validates heroCutout schema with both light and dark variants", () => {
    const valid = {
      light: {
        publicId: "devden/portraits/cutout-light",
        alt: "Studio silhouette (light)",
      },
      dark: {
        publicId: "devden/portraits/cutout-dark",
        alt: "Studio silhouette (dark)",
      },
    };

    const parsed = heroCutoutSchema.safeParse(valid);
    expect(parsed.success).toBe(true);

    const empty = {};
    const parsedEmpty = heroCutoutSchema.safeParse(empty);
    expect(parsedEmpty.success).toBe(true);
  });

  it("ensures heroStyle default in staticSettings is 'cutout'", () => {
    expect(staticSettings.heroStyle).toBe("cutout");
  });
});
