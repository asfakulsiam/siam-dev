"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export interface SkillBadgeItem {
  label: string;
  icon?: string;
  order?: number;
}

// Fixed, hand-placed positions around the photo frame — tuned to sit at the
// portrait's natural edges (shoulder, temple, chin-level) without obscuring the face.
const POSITION_PRESETS: React.CSSProperties[] = [
  { top: "12%", left: "4%" },
  { top: "34%", right: "2%" },
  { bottom: "24%", left: "0%" },
  { bottom: "8%", right: "8%" },
  { top: "58%", left: "-2%" },
];

export function FloatingSkillBadges({
  badges,
}: {
  badges?: SkillBadgeItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!badges || badges.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          fine: "(pointer: fine)",
          motionOk: "(prefers-reduced-motion: no-preference)",
          wide: "(min-width: 1024px)",
        },
        () => {
          const chips = containerRef.current?.querySelectorAll<HTMLElement>("[data-skill-chip]");
          chips?.forEach((chip, i) => {
            // Gentle, slow, independent drift
            gsap.to(chip, {
              y: "random(-8, 8)",
              x: "random(-5, 5)",
              duration: gsap.utils.random(3.5, 5.5),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: i * 0.25,
            });
          });
        },
      );

      // Reduced motion: static, no movement
      mm.add({ reduced: "(prefers-reduced-motion: reduce)" }, () => {
        gsap.set(containerRef.current?.querySelectorAll("[data-skill-chip]") ?? [], {
          x: 0,
          y: 0,
        });
      });
    },
    { scope: containerRef, dependencies: [badges] },
  );

  if (!badges || badges.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 hidden lg:block select-none"
      aria-hidden="true"
    >
      {badges.slice(0, 5).map((badge, i) => (
        <span
          key={`${badge.label}-${i}`}
          data-skill-chip
          className="absolute bg-[var(--bg)]/85 backdrop-blur-sm border border-[var(--line)] text-[var(--ink)] text-xs font-medium px-3 py-1.5 rounded-[var(--r-pill)] shadow-xs transition-colors duration-[var(--duration-base)]"
          style={POSITION_PRESETS[i % POSITION_PRESETS.length]}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
