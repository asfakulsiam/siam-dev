import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortfolioImage } from "@/components/ui/PortfolioImage";

describe("Phase 6: PortfolioImage Component", () => {
  it("renders image with accessible alt text and responsive container", () => {
    render(
      <PortfolioImage
        src="https://picsum.photos/seed/test-image/800/600"
        alt="Aurora Design System components preview"
        aspectRatio="16/9"
      />
    );

    const img = screen.getByRole("img", {
      name: /aurora design system components preview/i,
    });
    expect(img).toBeDefined();
    expect(img.getAttribute("alt")).toBe("Aurora Design System components preview");
  });

  it("renders caption inside semantic figure and figcaption", () => {
    render(
      <PortfolioImage
        src="https://picsum.photos/seed/test-caption/800/600"
        alt="Interactive dashboard diagram"
        caption="Figure 1: High-throughput token synchronization engine"
      />
    );

    const caption = screen.getByText(
      /figure 1: high-throughput token synchronization engine/i
    );
    expect(caption).toBeDefined();
    expect(caption.tagName.toLowerCase()).toBe("figcaption");
  });

  it("handles empty or missing src gracefully with fallback image", () => {
    render(
      <PortfolioImage
        src=""
        alt="Fallback visual placeholder"
      />
    );

    const img = screen.getByRole("img", {
      name: /fallback visual placeholder/i,
    });
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toContain("portfolio-fallback");
  });
});
