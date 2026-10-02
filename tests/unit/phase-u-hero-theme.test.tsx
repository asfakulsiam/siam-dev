import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SplitHero } from "@/components/motion/SplitHero";
import { getThemeAccent, THEME_ACCENTS } from "@/hooks/useTheme";
import { cldUrl, getDuotonePhotoUrl } from "@/lib/cloudinary";

describe("Phase U: Split Frame Theme-Aware Hero & Accent Resolution", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  describe("getThemeAccent()", () => {
    it("returns correct tokens matching tokens.css for each theme", () => {
      expect(getThemeAccent("day-shift")).toBe("#2F4BFF");
      expect(getThemeAccent("night-coder")).toBe("#8AA2FF");
      expect(getThemeAccent("charcoal")).toBe("#8AA2FF");
      expect(getThemeAccent("night-coder-charcoal")).toBe("#8AA2FF");
      expect(getThemeAccent("blueprint")).toBe("#FFE14D");
      expect(getThemeAccent("mono")).toBe("#000000");
    });

    it("respects custom admin accent color override over theme default", () => {
      expect(getThemeAccent("day-shift", "#FF00FF")).toBe("#FF00FF");
      expect(getThemeAccent("night-coder", "#123456")).toBe("#123456");
      // "auto" falls back to theme default
      expect(getThemeAccent("day-shift", "auto")).toBe("#2F4BFF");
      expect(getThemeAccent("blueprint", "auto")).toBe("#FFE14D");
    });
  });

  describe("SplitHero Theme Variant Resolution", () => {
    const mockHeroPrimary = {
      light: {
        publicId: "primary-light-img",
        alt: "Asfakul primary portrait in studio lighting (light)",
        accentColor: "auto",
      },
      dark: {
        publicId: "primary-dark-img",
        alt: "Asfakul primary portrait in midnight lighting (dark)",
        accentColor: "auto",
      },
    };

    const mockHeroSecondary = {
      light: {
        publicId: "secondary-light-img",
        alt: "Asfakul workstation light",
        accentColor: "auto",
      },
      dark: {
        publicId: "secondary-dark-img",
        alt: "Asfakul workstation dark",
        accentColor: "auto",
      },
    };

    it("selects light variant in light theme (day-shift)", () => {
      document.documentElement.setAttribute("data-theme", "day-shift");

      render(
        <SplitHero
          name="Asfakul"
          headline="I design and build websites that feel considered."
          heroPrimary={mockHeroPrimary}
          heroSecondary={mockHeroSecondary}
          metaRow={<div>Meta</div>}
          actions={<button>Click</button>}
        />
      );

      const primaryImg = screen.getByAltText("Asfakul primary portrait in studio lighting (light)");
      expect(primaryImg).toBeDefined();

      const secondaryImg = screen.getByAltText("Asfakul workstation light");
      expect(secondaryImg).toBeDefined();
    });

    it("selects dark variant in dark theme (night-coder / blueprint / charcoal)", () => {
      document.documentElement.setAttribute("data-theme", "night-coder");

      render(
        <SplitHero
          name="Asfakul"
          headline="I design and build websites that feel considered."
          heroPrimary={mockHeroPrimary}
          heroSecondary={mockHeroSecondary}
          metaRow={<div>Meta</div>}
          actions={<button>Click</button>}
        />
      );

      const primaryImg = screen.getByAltText("Asfakul primary portrait in midnight lighting (dark)");
      expect(primaryImg).toBeDefined();

      const secondaryImg = screen.getByAltText("Asfakul workstation dark");
      expect(secondaryImg).toBeDefined();
    });

    it("falls back to light when dark is missing in dark theme", () => {
      document.documentElement.setAttribute("data-theme", "night-coder");

      render(
        <SplitHero
          name="Asfakul"
          headline="I design and build websites that feel considered."
          heroPrimary={{
            light: mockHeroPrimary.light,
          }}
          metaRow={<div>Meta</div>}
          actions={<button>Click</button>}
        />
      );

      const img = screen.getByAltText("Asfakul primary portrait in studio lighting (light)");
      expect(img).toBeDefined();
    });

    it("falls back to dark when light is missing in light theme", () => {
      document.documentElement.setAttribute("data-theme", "day-shift");

      render(
        <SplitHero
          name="Asfakul"
          headline="I design and build websites that feel considered."
          heroPrimary={{
            dark: mockHeroPrimary.dark,
          }}
          metaRow={<div>Meta</div>}
          actions={<button>Click</button>}
        />
      );

      const img = screen.getByAltText("Asfakul primary portrait in midnight lighting (dark)");
      expect(img).toBeDefined();
    });

    it("renders clean text-only layout when zero photos are assigned", () => {
      render(
        <SplitHero
          name="Asfakul"
          headline="I design and build websites that feel considered."
          metaRow={<div>Meta</div>}
          actions={<button>Click</button>}
        />
      );

      expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
      expect(screen.queryByRole("img")).toBeNull();
    });
  });

  describe("Mono Theme Grayscale Preservation (No Forced Tint)", () => {
    it("preserves pure grayscale transformation for mono theme in cloudinary duotone", () => {
      const monoAccent = getThemeAccent("mono"); // "#000000"
      expect(monoAccent).toBe("#000000");

      const url = cldUrl("https://res.cloudinary.com/devden/image/upload/sample.jpg", {
        duotone: true,
        accent: monoAccent,
      });

      // Must include e_grayscale, and must NOT include e_tint with a color
      expect(url).toContain("e_grayscale");
      expect(url).not.toContain("e_tint:70:");
    });

    it("applies theme accent tint for colored themes like blueprint", () => {
      const bpAccent = getThemeAccent("blueprint"); // "#FFE14D"
      expect(bpAccent).toBe("#FFE14D");

      const url = cldUrl("https://res.cloudinary.com/devden/image/upload/sample.jpg", {
        duotone: true,
        accent: bpAccent,
      });

      expect(url).toContain("e_grayscale");
      expect(url).toContain("e_tint:70:ffe14d");
    });
  });
});
