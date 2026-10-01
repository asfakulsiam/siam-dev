import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SplitHero } from "@/components/motion/SplitHero";
import { getThemeAccent, THEME_ACCENTS } from "@/hooks/useTheme";
import {
  getDefaultIdentityPhotoSVG,
  getDefaultSecondaryPhotoSVG,
} from "@/features/profile/data";
import { cldUrl } from "@/lib/cloudinary";

describe("Phase T: Theme-Aware Hero Photos", () => {
  it("resolves the correct accent color per theme when set to auto or empty", () => {
    expect(getThemeAccent("day-shift")).toBe("#2F4BFF");
    expect(getThemeAccent("night-coder")).toBe("#8AA2FF");
    expect(getThemeAccent("charcoal")).toBe("#8AA2FF");
    expect(getThemeAccent("blueprint")).toBe("#FFE14D");
    expect(getThemeAccent("mono")).toBe("#000000");

    expect(getThemeAccent("blueprint", "auto")).toBe("#FFE14D");
    expect(getThemeAccent("day-shift", "auto")).toBe("#2F4BFF");
  });

  it("respects explicit custom accent colors when not auto", () => {
    expect(getThemeAccent("blueprint", "#10B981")).toBe("#10B981");
    expect(getThemeAccent("day-shift", "#F43F5E")).toBe("#F43F5E");
  });

  it("generates theme-calibrated SVGs for default photos", () => {
    const blueprintPrimary = getDefaultIdentityPhotoSVG("blueprint");
    expect(blueprintPrimary).toContain("data:image/svg+xml");
    expect(blueprintPrimary).toContain(encodeURIComponent("#ffe14d")); // yellow accent in blueprint

    const monoPrimary = getDefaultIdentityPhotoSVG("mono");
    expect(monoPrimary).toContain(encodeURIComponent("#000000")); // monochrome

    const blueprintSecondary = getDefaultSecondaryPhotoSVG("blueprint");
    expect(blueprintSecondary).toContain(encodeURIComponent("#ffe14d"));
  });

  it("produces correct Cloudinary grayscale transform for mono theme", () => {
    const testUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const monoTransformed = cldUrl(testUrl, { duotone: true, accent: "#000000" });
    expect(monoTransformed).toContain("e_grayscale");
    expect(monoTransformed).not.toContain("e_tint:70:000000");

    const tinted = cldUrl(testUrl, { duotone: true, accent: "#FFE14D" });
    expect(tinted).toContain("e_grayscale,e_tint:70:ffe14d");
  });

  it("SplitHero renders theme-aware default SVGs based on document data-theme", () => {
    document.documentElement.setAttribute("data-theme", "blueprint");

    const { container } = render(
      <SplitHero
        name="Asfakul"
        headline="I design and build websites that feel considered."
        subheadline="Web designer and developer"
        primaryPhoto={{
          publicId: "data:image/svg+xml;utf8,<svg></svg>",
          alt: "Primary architectural portrait",
          accentColor: "auto",
        }}
        secondaryPhoto={{
          publicId: "data:image/svg+xml;utf8,<svg></svg>",
          alt: "Secondary workspace photo",
          accentColor: "auto",
        }}
        metaRow={<span>Available</span>}
        actions={<button type="button">Work</button>}
      />,
    );

    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(1);
    // In blueprint theme, SVG has blueprint yellow accent
    expect(images[0]?.getAttribute("src")).toContain(encodeURIComponent("#ffe14d"));
  });
});
