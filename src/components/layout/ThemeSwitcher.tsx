"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { Palette, Check } from "lucide-react";

export type ThemeId = "day-shift" | "night-coder" | "blueprint" | "mono";

interface ThemeOption {
  id: ThemeId;
  label: string;
  dotColor: string;
}

const THEMES: ThemeOption[] = [
  { id: "day-shift", label: "Day Shift", dotColor: "#2F4BFF" },
  { id: "night-coder", label: "Night Coder", dotColor: "#8AA2FF" },
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
  const active = document.documentElement.getAttribute("data-theme") as ThemeId;
  return active && THEMES.some((t) => t.id === active) ? active : "day-shift";
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
    const apply = () => {
      document.documentElement.setAttribute("data-theme", theme);
      try {
        localStorage.setItem("devden-theme", theme);
      } catch {
        // Safe storage fallback
      }
      setIsOpen(false);
    };

    // Progressive enhancement with View Transitions API if supported
    if ("startViewTransition" in document && typeof document.startViewTransition === "function") {
      document.startViewTransition(() => {
        apply();
      });
    } else {
      apply();
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current theme is ${currentTheme}. Click to switch theme.`}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2"
        data-cursor-text="Theme"
      >
        <Palette className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
        <span className="hidden sm:inline capitalize font-medium">
          {currentTheme.replace("-", " ")}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 mt-2 w-44 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-floating)] z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
            Select Theme
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
