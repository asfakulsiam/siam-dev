"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeId, normalizeThemeId } from "@/hooks/useTheme";

export type { ThemeId };

interface ThemeOption {
  id: ThemeId;
  label: string;
  dotColor: string;
}

const THEMES: ThemeOption[] = [
  { id: "day-shift", label: "Day Shift", dotColor: "#2F4BFF" },
  { id: "charcoal", label: "Charcoal Dark", dotColor: "#151517" },
  { id: "night-coder", label: "Night Coder (Navy)", dotColor: "#0A0F1A" },
  { id: "blueprint", label: "Blueprint", dotColor: "#FFE14D" },
  { id: "mono", label: "Mono", dotColor: "#000000" },
];

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
  const active = document.documentElement.getAttribute("data-theme");
  return normalizeThemeId(active);
}

function getServerThemeSnapshot(): ThemeId {
  return "day-shift";
}

export function ThemeSwitcher() {
  const currentTheme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const switchTheme = (theme: ThemeId) => {
    if (theme === currentTheme) {
      setIsOpen(false);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Trigger smooth custom property color interpolation if reduced motion is not preferred
    if (!prefersReducedMotion && typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme-transitioning", "true");

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // 400ms matches --duration-base, 450ms allows full settle before cleanup
      transitionTimeoutRef.current = setTimeout(() => {
        document.documentElement.removeAttribute("data-theme-transitioning");
        transitionTimeoutRef.current = null;
      }, 450);
    }

    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("devden-theme", theme);
    } catch {
      // Safe storage fallback
    }

    // Keep <meta name="theme-color"> in sync with current theme background
    const themeColors: Record<string, string> = {
      "day-shift": "#f4f6fa",
      "night-coder": "#0a0f1a",
      "charcoal": "#151517",
      "night-coder-charcoal": "#151517",
      "blueprint": "#1f33e6",
      "mono": "#ffffff",
    };
    let metaTheme = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.setAttribute("name", "theme-color");
      document.head.appendChild(metaTheme);
    }
    if (themeColors[theme]) {
      metaTheme.setAttribute("content", themeColors[theme]);
    }

    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current theme is ${currentTheme}. Click to switch theme.`}
        data-cursor-text="Theme"
      >
        <Palette className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
        <span className="hidden sm:inline capitalize font-medium">
          {currentTheme.replace("-", " ")}
        </span>
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 mt-2 w-44 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-floating)] z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1 text-xs font-semibold text-[var(--ink-muted)]">
            Select theme
          </div>
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                role="menuitem"
                onClick={() => switchTheme(theme.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[var(--r-sm)] transition-colors ${
                  isActive
                    ? "bg-[var(--surface-2)] text-[var(--ink)] font-semibold"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: theme.dotColor }}
                    aria-hidden="true"
                  />
                  <span>{theme.label}</span>
                </div>
                {isActive && (
                  <Check className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
