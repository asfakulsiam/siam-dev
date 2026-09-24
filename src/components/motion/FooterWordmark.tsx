"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function FooterWordmark() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!wordmarkRef.current || !containerRef.current) return;

        // Clip-path reveal from bottom to top as footer enters viewport (M7)
        gsap.fromTo(
          wordmarkRef.current,
          {
            clipPath: "inset(100% 0 0 0)",
            yPercent: 20,
            opacity: 0,
          },
          {
            clipPath: "inset(0% 0 0 0)",
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="pt-12 pb-4 overflow-hidden select-none border-t border-[var(--line)]"
    >
      <span
        ref={wordmarkRef}
        className="block text-center text-[clamp(2.5rem,14vw,11rem)] font-extrabold tracking-[-0.04em] text-[var(--ink)]/10 leading-none will-change-[transform,clip-path]"
      >
        A S F A K U L
      </span>
    </div>
  );
}
