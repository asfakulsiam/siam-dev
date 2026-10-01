"use client";

import { useLayoutEffect, useState, useEffect } from "react";

// SSR-safe useLayoutEffect
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface OverlapPosition {
  top: number;
  left: number;
  ready: boolean;
}

export function useOverlapPosition(
  containerRef: React.RefObject<HTMLElement | null>,
  headlineRef: React.RefObject<HTMLElement | null>,
  photoRef: React.RefObject<HTMLElement | null>,
): OverlapPosition {
  const [pos, setPos] = useState<OverlapPosition>({ top: 0, left: 0, ready: false });

  useIsomorphicLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const headline = headlineRef.current;
      const photo = photoRef.current;
      if (!container || !headline || !photo) return;

      const containerBox = container.getBoundingClientRect();
      const headlineBox = headline.getBoundingClientRect();
      const photoBox = photo.getBoundingClientRect();

      // Find the top of the headline's actual last line (not the whole block)
      let lastLine = headlineBox;
      if (typeof document !== "undefined" && typeof document.createRange === "function") {
        try {
          const range = document.createRange();
          range.selectNodeContents(headline);
          if (typeof range.getClientRects === "function") {
            const lineRects = Array.from(range.getClientRects());
            if (lineRects.length > 0) {
              lastLine = lineRects[lineRects.length - 1] ?? headlineBox;
            }
          }
        } catch {
          lastLine = headlineBox;
        }
      }

      // Start ~90px before the photo panel's left edge, so roughly 40-45% sits on the text column gutter and the rest lands on the photo
      setPos({
        top: Math.round(lastLine.top - containerBox.top),
        left: Math.round(photoBox.left - containerBox.left - 90),
        ready: true,
      });
    }

    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      if (containerRef.current) ro.observe(containerRef.current);
      if (headlineRef.current) ro.observe(headlineRef.current);
      if (photoRef.current) ro.observe(photoRef.current);
    }

    window.addEventListener("resize", measure, { passive: true });

    // Font loading observer to re-measure when variable font settles
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    // Re-measure after variable font load animation completes (GSAP 0.9s expo animation)
    const fontTimeout = setTimeout(measure, 1000);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(fontTimeout);
    };
  }, [containerRef, headlineRef, photoRef]);

  return pos;
}
