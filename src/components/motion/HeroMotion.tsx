"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cldUrl } from "@/lib/cloudinary";

interface HeroMotionProps {
  name?: string;
  headline: string;
  subheadline?: string;
  bio?: string;
  photoUrl?: string;
}

export function HeroMotion({
  name = "Asfakul",
  headline,
  subheadline,
  bio,
  photoUrl,
}: HeroMotionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [revealed, setRevealed] = useState(false);

  const resolvedPhotoUrl = photoUrl ? cldUrl(photoUrl) : undefined;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Variable font load animation (M3)
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

        // Touch device reveal animation (triggers on scroll entrance for touch screens)
        if (headlineRef.current && window.matchMedia("(pointer: coarse)").matches && resolvedPhotoUrl) {
          gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              once: true,
            },
          })
            .to(headlineRef.current, {
              onStart: () => setRevealed(true),
              duration: 1.2,
            })
            .to(headlineRef.current, {
              onComplete: () => setRevealed(false),
              duration: 0.8,
              delay: 2.0,
            });
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="space-y-6 max-w-4xl select-none">
      <h1
        ref={headlineRef}
        aria-label={`${name} — ${headline}`}
        data-revealed={revealed}
        className={`text-[var(--text-display)] font-extrabold tracking-tight text-[var(--ink)] leading-[0.92] text-balance cursor-pointer transition-colors duration-[var(--duration-base)] ${
          resolvedPhotoUrl ? "identity-mask" : ""
        }`}
        style={
          {
            fontVariationSettings: "'wght' 800, 'wdth' 100",
            willChange: "transform, opacity",
            ...(resolvedPhotoUrl
              ? ({ "--identity-photo-url": `url("${resolvedPhotoUrl}")` } as React.CSSProperties)
              : {}),
          } as React.CSSProperties
        }
        onMouseEnter={() => setRevealed(true)}
        onMouseLeave={() => setRevealed(false)}
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
