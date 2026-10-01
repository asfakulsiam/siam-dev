"use client";

import { useSyncExternalStore } from "react";

export type ThemeId =
  | "day-shift"
  | "charcoal"
  | "night-coder-charcoal"
  | "night-coder"
  | "blueprint"
  | "mono";

const DARK_THEMES = new Set<string>([
  "night-coder",
  "night-coder-charcoal",
  "charcoal",
  "blueprint",
]);

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "data-theme") {
        callback();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => observer.disconnect();
}

function getThemeSnapshot(): ThemeId {
  if (typeof document === "undefined") return "day-shift";
  const active = document.documentElement.getAttribute("data-theme") as ThemeId;
  return active || "day-shift";
}

function getServerThemeSnapshot(): ThemeId {
  return "day-shift";
}

export const THEME_ACCENTS: Record<string, string> = {
  "day-shift": "#2F4BFF",
  "night-coder": "#8AA2FF",
  "charcoal": "#8AA2FF",
  "night-coder-charcoal": "#8AA2FF",
  "blueprint": "#FFE14D",
  "mono": "#000000",
};

/**
 * Returns the active theme accent hex, respecting custom overrides if not set to "auto".
 */
export function getThemeAccent(theme: string, customAccent?: string): string {
  if (customAccent && customAccent !== "auto" && customAccent.trim() !== "") {
    return customAccent;
  }
  return THEME_ACCENTS[theme] || "#2F4BFF";
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const isDark = DARK_THEMES.has(theme);

  return { theme, isDark };
}
