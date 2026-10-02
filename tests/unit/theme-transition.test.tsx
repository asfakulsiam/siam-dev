import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import fs from "fs";
import path from "path";

describe("Theme Color Transitions & Custom Property Interpolation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.removeAttribute("data-theme-transitioning");
    document.documentElement.setAttribute("data-theme", "day-shift");
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.documentElement.removeAttribute("data-theme-transitioning");
  });

  it("declares CSS @property registrations for smooth custom property color interpolation in tokens.css", () => {
    const tokensPath = path.resolve(process.cwd(), "src/styles/tokens.css");
    const tokensCss = fs.readFileSync(tokensPath, "utf8");

    const requiredColorProperties = [
      "--bg",
      "--surface",
      "--surface-2",
      "--ink",
      "--ink-muted",
      "--line",
      "--accent",
      "--accent-ink",
      "--focus",
      "--header-bg",
    ];

    for (const prop of requiredColorProperties) {
      expect(tokensCss).toContain(`@property ${prop}`);
      expect(tokensCss).toContain(`syntax: "<color>"`);
    }

    expect(tokensCss).toContain('html[data-theme-transitioning="true"]');
  });

  it("activates data-theme-transitioning on html when user switches theme", () => {
    render(<ThemeSwitcher />);

    // Open dropdown
    const trigger = screen.getByRole("button", { name: /current theme is/i });
    fireEvent.click(trigger);

    // Click on Blueprint theme option
    const blueprintOption = screen.getByRole("menuitem", { name: /blueprint/i });
    fireEvent.click(blueprintOption);

    // Verify data-theme is immediately applied
    expect(document.documentElement.getAttribute("data-theme")).toBe("blueprint");
    // Verify transition attribute is active
    expect(document.documentElement.getAttribute("data-theme-transitioning")).toBe("true");
    // Verify localStorage updated
    expect(localStorage.getItem("devden-theme")).toBe("blueprint");

    // Fast-forward past transition duration (450ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Verify transition attribute is cleaned up
    expect(document.documentElement.getAttribute("data-theme-transitioning")).toBeNull();
  });

  it("respects prefers-reduced-motion: reduce without activating transitions", () => {
    // Mock reduced motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ThemeSwitcher />);

    const trigger = screen.getByRole("button", { name: /current theme is/i });
    fireEvent.click(trigger);

    const charcoalOption = screen.getByRole("menuitem", { name: /charcoal/i });
    fireEvent.click(charcoalOption);

    expect(document.documentElement.getAttribute("data-theme")).toBe("charcoal");
    // Should NOT have data-theme-transitioning
    expect(document.documentElement.getAttribute("data-theme-transitioning")).toBeNull();
  });

  it("syncs meta theme-color tag when switching themes", () => {
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole("button", { name: /current theme is/i });
    fireEvent.click(trigger);

    const blueprintOption = screen.getByRole("menuitem", { name: /blueprint/i });
    fireEvent.click(blueprintOption);

    const metaTheme = document.querySelector('meta[name="theme-color"]:not([media])');
    expect(metaTheme).not.toBeNull();
    expect(metaTheme?.getAttribute("content")).toBe("#1f33e6");
  });
});
