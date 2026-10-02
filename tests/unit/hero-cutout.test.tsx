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

  it("renders theme-specific visual from heroProfiles for each theme", () => {
    const multiThemeCutoutProps = {
      ...mockProps,
      heroProfiles: {
        dayShift: { publicId: "day-shift-portrait-url", alt: "Day Shift Portrait" },
        charcoal: { publicId: "charcoal-portrait-url", alt: "Charcoal Portrait" },
        nightCoder: { publicId: "night-coder-portrait-url", alt: "Night Coder Portrait" },
        blueprint: { publicId: "blueprint-portrait-url", alt: "Blueprint Portrait" },
        mono: { publicId: "mono-portrait-url", alt: "Mono Portrait" },
      },
    };

    document.documentElement.setAttribute("data-theme", "blueprint");
    const { rerender } = render(<CutoutHero {...multiThemeCutoutProps} />);
    expect(screen.getByAltText("Blueprint Portrait")).toBeDefined();

    document.documentElement.setAttribute("data-theme", "charcoal");
    rerender(<CutoutHero {...multiThemeCutoutProps} />);
    expect(screen.getByAltText("Charcoal Portrait")).toBeDefined();

    document.documentElement.setAttribute("data-theme", "mono");
    rerender(<CutoutHero {...multiThemeCutoutProps} />);
    expect(screen.getByAltText("Mono Portrait")).toBeDefined();
  });

  it("falls back gracefully to theme default SVG when profile photo is empty", () => {
    document.documentElement.setAttribute("data-theme", "blueprint");
    render(
      <CutoutHero
        name="Asfakul"
        headline="I design and build digital products that feel considered."
        subheadline="Web designer and full-stack developer."
        metaRow={<span data-testid="meta">Available</span>}
        actions={<button type="button">Explore</button>}
        heroProfiles={null}
        cutout={null}
        cutoutPhoto={null}
      />,
    );

    const img = screen.getByRole("img");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toContain("data:image/svg+xml");
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
