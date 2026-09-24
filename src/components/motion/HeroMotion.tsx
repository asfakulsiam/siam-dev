"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface HeroMotionProps {
  headline: string;
  subheadline?: string;
  bio?: string;
}

export function HeroMotion({ headline, subheadline, bio }: HeroMotionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Variable font load animation (M3)
        // Transition weight and width smoothly using variable font axes
        const fontProxy = { wght: 300, wdth: 80, opacity: 0, y: 16 };

        gsap.to(fontProxy, {
          wght: 800,
          wdth: 100,
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          onUpdate: () => {
            if (headlineRef.current) {
              headlineRef.current.style.fontVariationSettings = `'wght' ${Math.round(fontProxy.wght)}, 'wdth' ${Math.round(fontProxy.wdth)}`;
              headlineRef.current.style.opacity = `${fontProxy.opacity}`;
              headlineRef.current.style.transform = `translate3d(0, ${fontProxy.y}px, 0)`;
            }
          },
        });

        // Subhead fade-in
        if (textRef.current) {
          gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "expo.out" },
          );
        }

        // ScrollTrigger compress: subtle scrub as hero exits viewport
        if (headlineRef.current && containerRef.current) {
          gsap.to(headlineRef.current, {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
            opacity: 0.3,
            yPercent: -12,
            ease: "none",
          });
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="space-y-6 max-w-4xl">
      <h1
        ref={headlineRef}
        className="text-[var(--text-display)] font-extrabold tracking-tight text-[var(--ink)] leading-[0.92] text-balance"
        style={{
          fontVariationSettings: "'wght' 800, 'wdth' 100",
          willChange: "transform, opacity",
        }}
      >
        {headline}
      </h1>
      {(subheadline || bio) && (
        <p
          ref={textRef}
          className="text-[var(--text-xl)] text-[var(--ink-muted)] max-w-2xl text-pretty leading-relaxed"
        >
          {subheadline} {bio}
        </p>
      )}
    </div>
  );
}
