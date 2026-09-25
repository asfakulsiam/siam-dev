"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { getDuotonePhotoUrl } from "@/lib/cloudinary";

interface DuotoneBackdropProps {
  photoUrl?: string;
  className?: string;
  cursorReactive?: boolean;
}

export function DuotoneBackdrop({
  photoUrl,
  className = "",
  cursorReactive = false,
}: DuotoneBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollLayerRef = useRef<HTMLDivElement>(null);
  const cursorLayerRef = useRef<HTMLDivElement>(null);

  const resolvedUrl = photoUrl ? getDuotonePhotoUrl(photoUrl, "2f4bff") : undefined;

  useGSAP(
    () => {
      if (!containerRef.current || !scrollLayerRef.current) return;

      const mm = gsap.matchMedia();

      // 1. Scroll-driven ambient parallax
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.fromTo(
            scrollLayerRef.current,
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

      // 2. Cursor-reactive drift (additive subtle offset, Phase G)
      if (cursorReactive && cursorLayerRef.current) {
        mm.add(
          {
            fine: "(pointer: fine)",
            motionOk: "(prefers-reduced-motion: no-preference)",
          },
          () => {
            const cursorEl = cursorLayerRef.current;
            if (!cursorEl) return;

            const xTo = gsap.quickTo(cursorEl, "x", { duration: 0.6, ease: "power3.out" });
            const yTo = gsap.quickTo(cursorEl, "y", { duration: 0.6, ease: "power3.out" });
            const MAX_SHIFT = 12; // px, deliberately small — this is a whisper, not a parallax gallery

            const section = containerRef.current?.closest("section") || containerRef.current?.parentElement;
            if (!section) return;

            function onMove(e: PointerEvent) {
              const rect = section!.getBoundingClientRect();
              const relX = (e.clientX - rect.left) / rect.width - 0.5;
              const relY = (e.clientY - rect.top) / rect.height - 0.5;
              xTo(relX * MAX_SHIFT * 2);
              yTo(relY * MAX_SHIFT * 2);
            }

            function onLeave() {
              xTo(0);
              yTo(0);
            }

            section.addEventListener("pointermove", onMove as EventListener);
            section.addEventListener("pointerleave", onLeave as EventListener);

            return () => {
              section.removeEventListener("pointermove", onMove as EventListener);
              section.removeEventListener("pointerleave", onLeave as EventListener);
            };
          },
        );
      }
    },
    { scope: containerRef, dependencies: [cursorReactive] },
  );

  if (!resolvedUrl) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
    >
      <div ref={scrollLayerRef} className="absolute inset-0">
        <div
          ref={cursorLayerRef}
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] transition-opacity duration-700 dark:opacity-[0.08]"
          style={{
            backgroundImage: `url("${resolvedUrl}")`,
            willChange: "transform",
          }}
        />
      </div>
      {/* Vignette gradient overlay for smooth section blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)] opacity-80" />
    </div>
  );
}
