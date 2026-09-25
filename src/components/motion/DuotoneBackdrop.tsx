"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { getDuotonePhotoUrl } from "@/lib/cloudinary";

interface DuotoneBackdropProps {
  photoUrl?: string;
  className?: string;
}

export function DuotoneBackdrop({ photoUrl, className = "" }: DuotoneBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const resolvedUrl = photoUrl ? getDuotonePhotoUrl(photoUrl, "2f4bff") : undefined;

  useGSAP(
    () => {
      if (!imageRef.current || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.fromTo(
            imageRef.current,
            { scale: 1.0, yPercent: -4 },
            {
              scale: 1.06,
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            },
          );
        },
      );
    },
    { scope: containerRef },
  );

  if (!resolvedUrl) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
    >
      <div
        ref={imageRef}
        className="absolute inset-0 bg-cover bg-center opacity-[0.07] transition-opacity duration-700 dark:opacity-[0.09]"
        style={{
          backgroundImage: `url("${resolvedUrl}")`,
          willChange: "transform",
        }}
      />
      {/* Vignette gradient overlay for smooth section blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)] opacity-80" />
    </div>
  );
}
