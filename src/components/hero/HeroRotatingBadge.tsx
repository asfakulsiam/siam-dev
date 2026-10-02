"use client";

import React, { useEffect, useState } from "react";

const ROTATING_PILLARS = [
  { label: "considered digital experiences", tag: "Design & Craft" },
  { label: "token-driven design systems", tag: "System Architecture" },
  { label: "high-performance web apps", tag: "Full-Stack Next.js" },
  { label: "fluid variable typography", tag: "Motion & Polish" },
];

export function HeroRotatingBadge() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_PILLARS.length);
        setIsFading(false);
      }, 250);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const current = ROTATING_PILLARS[index]!;

  return (
    <span className="inline-flex items-baseline gap-2">
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full bg-[var(--surface-2)]/90 border border-[var(--line)] shadow-xs transition-all duration-300 ${
          isFading ? "opacity-0 -translate-y-1 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <span className="text-[var(--accent)] font-mono text-xs mr-2 font-bold select-none">
          ✦
        </span>
        <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--ink)] tracking-tight">
          {current.label}
        </span>
      </span>
    </span>
  );
}
