"use client";

import React, { useState } from "react";
import { Sparkles, Terminal, Play, ShieldCheck } from "lucide-react";

interface HotspotItem {
  id: string;
  icon: typeof Sparkles;
  label: string;
  detail: string;
  positionClass: string;
  delay: string;
}

const HOTSPOTS: HotspotItem[] = [
  {
    id: "design-systems",
    icon: Sparkles,
    label: "Design Systems",
    detail: "Strict token architecture & fluid scales",
    positionClass: "top-[16%] -left-4 sm:-left-12 lg:-left-20",
    delay: "0s",
  },
  {
    id: "production-code",
    icon: Terminal,
    label: "Production Next.js",
    detail: "TypeScript, Server Actions & App Router",
    positionClass: "top-[40%] -right-4 sm:-right-12 lg:-right-24",
    delay: "0.8s",
  },
  {
    id: "fluid-motion",
    icon: Play,
    label: "Fluid Motion",
    detail: "GSAP 60fps & Bricolage variable font",
    positionClass: "bottom-[28%] -left-2 sm:-left-10 lg:-left-16",
    delay: "1.4s",
  },
  {
    id: "accessibility",
    icon: ShieldCheck,
    label: "WCAG 2.2 AA",
    detail: "Contrast-audited across all 5 themes",
    positionClass: "bottom-[12%] -right-2 sm:-right-8 lg:-right-16",
    delay: "2.1s",
  },
];

export function HeroHotspots() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div
      aria-label="Interactive Craft Highlights"
      className="absolute inset-0 pointer-events-none z-30"
    >
      {HOTSPOTS.map((hotspot) => {
        const Icon = hotspot.icon;
        const isActive = activeId === hotspot.id;

        return (
          <div
            key={hotspot.id}
            className={`absolute ${hotspot.positionClass} pointer-events-auto transition-transform duration-500 hover:scale-105`}
            style={{ animationDelay: hotspot.delay }}
          >
            <div
              onMouseEnter={() => setActiveId(hotspot.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId(isActive ? null : hotspot.id)}
              className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)]/85 backdrop-blur-md border border-[var(--line)] shadow-[var(--shadow-floating)] cursor-pointer transition-all duration-300 hover:border-[var(--accent)] hover:shadow-lg"
            >
              {/* Pulsing micro-beacon node */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>

              <Icon className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />

              <span className="text-xs font-semibold text-[var(--ink)] whitespace-nowrap select-none">
                {hotspot.label}
              </span>

              {/* Hover / Active Detail Tooltip */}
              {isActive && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 px-2.5 py-1 rounded-[var(--r-sm)] bg-[var(--ink)] text-[var(--bg)] text-[11px] font-mono whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-150 z-40 pointer-events-none">
                  {hotspot.detail}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-[var(--ink)]" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
